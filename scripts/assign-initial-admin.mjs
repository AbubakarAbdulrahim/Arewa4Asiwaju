import { createClient } from "@supabase/supabase-js";

// Run only against the explicitly selected production project after migrations
// are applied and the nominated account has completed verified registration.
const targetEmail = process.argv[2]?.trim().toLowerCase();
if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
  console.error("Usage: npm run admin:bootstrap -- <verified-account-email>");
  process.exit(2);
}

try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  console.error("Supabase URL and server-only service role key must be configured.");
  process.exit(2);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let user = null;
for (let page = 1; !user; page += 1) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw new Error("Unable to find the nominated Auth account.");
  user = data.users.find((candidate) => candidate.email?.toLowerCase() === targetEmail) ?? null;
  if (user || data.users.length < 1000) break;
}

if (!user?.email_confirmed_at) {
  console.error("The nominated account must exist and have a confirmed email.");
  process.exit(1);
}

const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("id")
  .eq("id", user.id)
  .maybeSingle();
if (profileError) throw new Error("Unable to validate the account profile.");
if (!profile) {
  console.error("The account must complete verified membership registration first.");
  process.exit(1);
}

const { data: existing, error: roleError } = await supabase
  .from("role_assignments")
  .select("id")
  .eq("role", "super_admin")
  .limit(1);
if (roleError) throw new Error("Unable to check the current administrator state.");
if (existing.length) {
  console.error("A super administrator already exists; this bootstrap is single-use.");
  process.exit(1);
}

const { error: assignmentError } = await supabase.rpc("assign_user_role", {
  p_user_id: user.id,
  p_role: "super_admin",
  p_org_unit_id: null,
});
if (assignmentError) throw new Error("The database rejected the administrator assignment.");

console.log("Initial administrator assigned. Confirm MFA and sign-in before launch.");
