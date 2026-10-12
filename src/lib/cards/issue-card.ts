import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateMembershipCardPdf } from "@/lib/cards/id-card-generator";

export type CardProcessingState = "ready" | "processing" | "failed";

export async function processMembershipCard(
  userId: string,
  membershipId: string,
  cardId: string,
): Promise<CardProcessingState> {
  const admin = createAdminClient();
  const claim = await admin.rpc("claim_card_generation_job", { p_id_card_id: cardId });
  if (claim.error) throw new Error("card_job_claim_failed");
  if (!claim.data) {
    const [jobResult, cardResult] = await Promise.all([
      admin
        .from("card_generation_jobs")
        .select("status,attempts")
        .eq("id_card_id", cardId)
        .maybeSingle(),
      admin.from("id_cards").select("pdf_storage_path").eq("id", cardId).maybeSingle(),
    ]);
    if (jobResult.error || cardResult.error) throw new Error("card_job_status_unavailable");
    if (jobResult.data?.status === "completed" && cardResult.data?.pdf_storage_path) return "ready";
    if (jobResult.data?.status === "processing") return "processing";
    return "failed";
  }

  let storagePath: string | null = null;
  try {
    const [profileResult, membershipResult, cardResult] = await Promise.all([
      admin
        .from("profiles")
        .select("full_name,state_of_residence,lga_of_residence,institution_name,photo_storage_path")
        .eq("id", userId)
        .single(),
      admin
        .from("memberships")
        .select("id,membership_number,state_code,status,profile_id")
        .eq("id", membershipId)
        .single(),
      admin
        .from("id_cards")
        .select("id,membership_id,card_version,status,verification_token,issued_at,expires_at")
        .eq("id", cardId)
        .single(),
    ]);
    if (profileResult.error || membershipResult.error || cardResult.error)
      throw new Error("card_source_record_missing");
    const profile = profileResult.data;
    const membership = membershipResult.data;
    const card = cardResult.data;
    if (
      membership.profile_id !== userId ||
      card.membership_id !== membership.id ||
      membership.status !== "active" ||
      card.status !== "active"
    ) {
      throw new Error("card_source_record_not_active");
    }

    let photoBytes: Uint8Array | null = null;
    if (profile.photo_storage_path) {
      const photo = await admin.storage
        .from("member-profile-photos")
        .download(profile.photo_storage_path);
      if (photo.error || !photo.data) throw new Error("card_member_photo_unavailable");
      photoBytes = new Uint8Array(await photo.data.arrayBuffer());
    }

    const generated = await generateMembershipCardPdf({
      fullName: profile.full_name,
      membershipNumber: membership.membership_number,
      stateName: profile.state_of_residence,
      stateCode: membership.state_code,
      lgaName: profile.lga_of_residence,
      institutionName: profile.institution_name,
      photoBytes,
      issuedAt: card.issued_at,
      expiresAt: card.expires_at,
      verificationToken: card.verification_token,
    });
    storagePath = `members/${userId}/${membershipId}/card-${card.card_version}.pdf`;
    const uploaded = await admin.storage
      .from("member-id-cards")
      .upload(storagePath, generated.pdfBuffer, {
        contentType: "application/pdf",
        cacheControl: "60",
        upsert: true,
      });
    if (uploaded.error) throw new Error("card_storage_upload_failed");

    const saved = await admin
      .from("id_cards")
      .update({ pdf_storage_path: storagePath })
      .eq("id", cardId)
      .eq("status", "active")
      .select("id")
      .maybeSingle();
    if (saved.error || !saved.data) {
      await admin.storage.from("member-id-cards").remove([storagePath]);
      throw new Error("card_no_longer_active");
    }

    const completed = await admin
      .from("card_generation_jobs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        last_error_code: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id_card_id", cardId);
    if (completed.error) throw new Error("card_job_completion_failed");
    await admin.from("audit_logs").insert({
      actor_id: userId,
      action: "membership_card.generated",
      target_type: "id_card",
      target_id: cardId,
      details: { card_version: card.card_version },
    });
    return "ready";
  } catch (error) {
    const knownCode =
      error instanceof Error && /^[a-z0-9_]{1,64}$/.test(error.message)
        ? error.message
        : "card_generation_failed";
    await admin
      .from("card_generation_jobs")
      .update({
        status: "failed",
        last_error_code: knownCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id_card_id", cardId);
    await admin.from("audit_logs").insert({
      actor_id: userId,
      action: "membership_card.generation_failed",
      target_type: "id_card",
      target_id: cardId,
      details: { error_code: knownCode },
    });
    return "failed";
  }
}
