import { createHash } from "node:crypto";
import { PDFDocument } from "pdf-lib";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { getLgaMembershipCode, getWardOptions, NORTHERN_STATES } from "@/lib/geo-data";
import { registrationSchema } from "@/lib/validation/registration-schema";
import { hashPrivateValue } from "@/lib/security/hmac";
import { processMembershipCard } from "@/lib/cards/issue-card";
import { logger } from "@/lib/logger";
import { inspectMemberPhoto } from "@/lib/security/member-photo";
import { buildRegistrationNotice } from "@/lib/registration-notice";

const acceptedResponse = {
  ok: true,
  message:
    "If you already have a membership, sign in to access your card. Otherwise, retry later or contact member support.",
};

function json(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, private",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function isDuplicateAccount(error: { code?: string; message?: string }) {
  return (
    error.code === "email_exists" ||
    /already (?:been )?(?:registered|exists)|user already exists/i.test(error.message ?? "")
  );
}

export async function POST(request: NextRequest) {
  if (!env.REGISTRATION_ENABLED) {
    return json({ error: "Registration is not available yet." }, 503);
  }
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > 6 * 1024 * 1024) {
    return json({ error: "The registration upload must be smaller than 6 MB." }, 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Enter valid registration details." }, 400);
  }
  if (String(form.get("website") ?? "").trim()) return json(acceptedResponse, 202);

  const values: Record<string, unknown> = Object.fromEntries(
    Array.from(form.entries()).filter(
      ([key, value]) => key !== "profilePhoto" && typeof value === "string",
    ),
  );
  if (values.acceptedNotice === "true") values.acceptedNotice = true;
  const parsed = registrationSchema.safeParse(values);
  if (!parsed.success) {
    return json(
      {
        error: "Check the highlighted fields and consent selections.",
        issues: parsed.error.issues.map((issue) => ({
          field: String(issue.path[0] ?? "form"),
          message: issue.message,
        })),
      },
      400,
    );
  }
  const state = NORTHERN_STATES.find((item) => item.name === parsed.data.stateOfResidence);
  if (!state || !state.lgas.includes(parsed.data.lgaOfResidence)) {
    return json({ error: "Select a valid state and LGA." }, 400);
  }
  const lgaCode = getLgaMembershipCode(state.code, parsed.data.lgaOfResidence);
  if (!lgaCode || !getWardOptions(state.code, parsed.data.lgaOfResidence).includes(parsed.data.ward)) {
    return json({ error: "Select a ward within the chosen LGA." }, 400);
  }
  const photoFile = form.get("profilePhoto");
  if (!(photoFile instanceof File)) {
    return json({ error: "Choose a clear profile photo to continue." }, 400);
  }
  let photoBytes: Uint8Array;
  let photoContentType: "image/jpeg" | "image/png";
  try {
    photoBytes = new Uint8Array(await photoFile.arrayBuffer());
    const photoInfo = inspectMemberPhoto(photoBytes);
    photoContentType = photoInfo.contentType;
    const imageDocument = await PDFDocument.create();
    if (photoInfo.format === "jpeg") await imageDocument.embedJpg(photoBytes);
    else await imageDocument.embedPng(photoBytes);
  } catch (photoError) {
    const message = photoError instanceof Error ? photoError.message : "photo_format_invalid";
    const errorMessage =
      message === "photo_size_invalid"
        ? "Choose an image smaller than 5 MB."
        : message === "photo_dimensions_invalid"
          ? "Choose an image between 128 and 4096 pixels in each dimension."
          : "Use a valid JPEG or PNG image file. We could not read the image data.";
    return json({ error: errorMessage }, 400);
  }

  const admin = createAdminClient();
  const chapter = await admin
    .from("organisational_units")
    .select("id")
    .eq("type", "state")
    .eq("state_code", state.code)
    .maybeSingle();
  if (chapter.error || !chapter.data) {
    logger.error("registration.state_chapter_unavailable");
    return json({ error: "Registration is temporarily unavailable. Please retry later." }, 503);
  }

  const now = new Date();
  await Promise.all([
    admin
      .from("registration_intents")
      .delete()
      .eq("status", "pending")
      .lt("expires_at", now.toISOString()),
    admin
      .from("registration_intents")
      .delete()
      .eq("status", "completed")
      .lt("created_at", new Date(now.getTime() - 30 * 86400_000).toISOString()),
    admin
      .from("registration_rate_limits")
      .delete()
      .lt("window_started_at", new Date(now.getTime() - 2 * 86400_000).toISOString()),
  ]);

  // Only apply the shared client key when the trusted hosting proxy provides
  // an address. A hardcoded fallback would make every local user share one
  // bucket and block unrelated registrations after a few attempts.
  const ipAddress = request.headers.get("x-real-ip")?.trim();
  const rateLimitKeys = [hashPrivateValue(`registration-email:${parsed.data.email}`)];
  if (ipAddress) rateLimitKeys.push(hashPrivateValue(`registration-ip:${ipAddress}`));
  const rateLimit = await admin.rpc("consume_registration_rate_limit", {
    p_key_hashes: rateLimitKeys,
    p_limit: 20,
    p_window_seconds: 3600,
  });
  if (rateLimit.error) {
    logger.error("registration.rate_limit_unavailable");
    return json({ error: "Registration is temporarily unavailable. Please retry later." }, 503);
  }
  if (rateLimit.data !== true) {
    return json({ error: "Too many attempts. Please try again later." }, 429);
  }

  const fullName = [parsed.data.firstName, parsed.data.middleName, parsed.data.lastName]
    .filter(Boolean)
    .join(" ");
  const createdUser = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    // Create the Auth identity without requiring an email verification step.
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createdUser.error || !createdUser.data.user) {
    if (createdUser.error && isDuplicateAccount(createdUser.error)) {
      return json(acceptedResponse, 202);
    }
    logger.error("registration.auth_account_create_failed");
    return json({ error: "Registration could not be completed. Please retry later." }, 503);
  }

  const photoStoragePath = `members/${createdUser.data.user.id}/profile.jpg`;
  const uploadedPhoto = await admin.storage
    .from("member-profile-photos")
    .upload(photoStoragePath, photoBytes, {
      contentType: photoContentType,
      cacheControl: "3600",
      upsert: false,
    });
  if (uploadedPhoto.error) {
    await admin.auth.admin.deleteUser(createdUser.data.user.id).catch(() => undefined);
    logger.error("registration.photo_upload_failed");
    return json(
      { error: "The profile photo could not be saved. Please choose it again and retry." },
      503,
    );
  }

  const noticeHash = createHash("sha256")
    .update(buildRegistrationNotice(env.REGISTRATION_CONSENT_NOTICE!), "utf8")
    .digest("hex");
  const created = await admin.rpc("create_open_membership_with_photo", {
    p_auth_user_id: createdUser.data.user.id,
    p_email: parsed.data.email,
    p_first_name: parsed.data.firstName,
    p_middle_name: parsed.data.middleName || null,
    p_last_name: parsed.data.lastName,
    p_state_of_residence: state.name,
    p_lga_of_residence: parsed.data.lgaOfResidence,
    p_state_code: state.code,
    p_org_unit_id: chapter.data.id,
    p_consent_policy_version: env.REGISTRATION_CONSENT_VERSION!,
    p_consent_policy_sha256: noticeHash,
    p_consent_granted: true,
    p_photo_storage_path: photoStoragePath,
    p_institution_type: parsed.data.institutionType || null,
    p_institution_name: parsed.data.institutionName || null,
    p_registration_details: {
      phone: parsed.data.phone,
      is_student: parsed.data.isStudent,
      ward: parsed.data.ward || null,
      gender: parsed.data.gender || null,
      date_of_birth: parsed.data.dateOfBirth || null,
      occupation: parsed.data.occupation || null,
      address: parsed.data.address || null,
      voter_card_status: parsed.data.voterCard || null,
      voter_card_number: parsed.data.voterCard === "yes" ? parsed.data.voterCardNumber?.trim() ?? null : null,
      lga_code: lgaCode,
      course_of_study: parsed.data.courseOfStudy || null,
      study_level: parsed.data.studyLevel || null,
    },
  });
  const issued = Array.isArray(created.data) ? created.data[0] : created.data;
  if (created.error || !issued?.membership_id || !issued.id_card_id) {
    await admin.storage.from("member-profile-photos").remove([photoStoragePath]);
    await admin.auth.admin.deleteUser(createdUser.data.user.id).catch(() => undefined);
    logger.error("registration.membership_transaction_failed");
    return json({ error: "Registration could not be completed. Please retry later." }, 503);
  }

  let cardStatus = await processMembershipCard(
    createdUser.data.user.id,
    issued.membership_id,
    issued.id_card_id,
  ).catch(() => "failed" as const);
  if (cardStatus === "failed") {
    cardStatus = await processMembershipCard(
      createdUser.data.user.id,
      issued.membership_id,
      issued.id_card_id,
    ).catch(() => "failed" as const);
  }

  let downloadUrl: string | null = null;
  let previewUrl: string | null = null;
  if (cardStatus === "ready") {
    const cardRecord = await admin
      .from("id_cards")
      .select("pdf_storage_path")
      .eq("id", issued.id_card_id)
      .eq("status", "active")
      .maybeSingle();
    if (!cardRecord.error && cardRecord.data?.pdf_storage_path) {
      const [preview, download] = await Promise.all([
        admin.storage
          .from("member-id-cards")
          .createSignedUrl(cardRecord.data.pdf_storage_path, 600),
        admin.storage
          .from("member-id-cards")
          .createSignedUrl(cardRecord.data.pdf_storage_path, 600, {
            download: `A4A-${issued.membership_number}.pdf`,
          }),
      ]);
      if (!preview.error) previewUrl = preview.data.signedUrl;
      if (!download.error) downloadUrl = download.data.signedUrl;
    }
    if (!downloadUrl) logger.error("registration.card_download_link_failed");
  } else {
    logger.error("registration.card_generation_failed");
  }

  return json(
    {
      ok: true,
      membershipNumber: issued.membership_number,
      cardStatus,
      previewUrl,
      downloadUrl,
      message:
        cardStatus === "ready" && downloadUrl
          ? "Registration is complete. Your membership and ID card are ready to download."
          : "Your membership is saved. The ID card is still processing; sign in to your member portal or contact support if it does not appear shortly.",
    },
    201,
  );
}
