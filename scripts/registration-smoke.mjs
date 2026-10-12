import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const appUrl = process.argv[2] ?? "http://127.0.0.1:3101";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) throw new Error("Supabase staging credentials are unavailable");
const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const email = `registration-smoke-${Date.now()}@example.test`;
const form = new FormData();
form.set("firstName", "Registration");
form.set("middleName", "");
form.set("lastName", "Smoke Test");
form.set("email", email);
form.set("stateOfResidence", "Kano");
form.set("lgaOfResidence", "Kano Municipal");
form.set("institutionType", "tertiary");
form.set("institutionName", "Smoke Test University");
form.set("acceptedNotice", "true");
form.set(
  "profilePhoto",
  new Blob([await readFile("public/brand/arewa-for-asiwaju-a4a.jpg")], { type: "image/jpeg" }),
  "smoke-photo.jpg",
);

let profileId;
try {
  const response = await fetch(new URL("/api/register", appUrl), { method: "POST", body: form });
  const result = await response.json();
  if (response.status !== 201)
    throw new Error(`Registration returned ${response.status}: ${JSON.stringify(result)}`);
  if (!/^A4A-\d{4}-KN-\d{6,}$/.test(result.membershipNumber ?? "")) {
    throw new Error("Registration did not return a valid membership number");
  }
  if (result.cardStatus !== "ready" || !result.previewUrl || !result.downloadUrl) {
    throw new Error(`Card generation did not complete: ${JSON.stringify(result)}`);
  }
  const [preview, download] = await Promise.all([
    fetch(result.previewUrl),
    fetch(result.downloadUrl),
  ]);
  if (!preview.ok || !download.ok) throw new Error("Generated PDF could not be retrieved");
  if (!preview.headers.get("content-type")?.includes("application/pdf")) {
    throw new Error("Card preview is not a PDF");
  }
  const downloadBytes = new Uint8Array(await download.arrayBuffer());
  if (new TextDecoder().decode(downloadBytes.slice(0, 5)) !== "%PDF-") {
    throw new Error("Card download does not contain PDF bytes");
  }
  console.log(`STAGING_REGISTRATION_OK ${result.membershipNumber}`);
} finally {
  const profile = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
  profileId = profile.data?.id;
  if (profileId) {
    const memberships = await admin.from("memberships").select("id").eq("profile_id", profileId);
    const membershipIds = (memberships.data ?? []).map((membership) => membership.id);
    if (membershipIds.length) {
      const cards = await admin
        .from("id_cards")
        .select("pdf_storage_path")
        .in("membership_id", membershipIds);
      const paths = (cards.data ?? [])
        .map((card) => card.pdf_storage_path)
        .filter((path) => typeof path === "string");
      if (paths.length) await admin.storage.from("member-id-cards").remove(paths);
      await admin.from("memberships").delete().eq("profile_id", profileId);
    }
    await admin.storage.from("member-profile-photos").remove([`members/${profileId}/profile.jpg`]);
    await admin.from("consent_records").delete().eq("profile_id", profileId);
    await admin.from("role_assignments").delete().eq("user_id", profileId);
    await admin.from("profiles").delete().eq("id", profileId);
    await admin.auth.admin.deleteUser(profileId);
  }
}
