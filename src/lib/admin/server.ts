import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

const ADMIN_ROLES: UserRole[] = [
  "super_admin",
  "event_manager",
  "chapter_coordinator",
  "lga_coordinator",
  "state_coordinator",
  "content_editor",
  "membership_officer",
  "data_protection_officer",
  "auditor",
];

export async function getAdminSession() {
  const supabase = await createServerSupabaseClient();
  let auth: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"];
  try {
    const result = await supabase.auth.getUser();
    auth = result.data;
  } catch {
    return { supabase, user: null, name: "", roles: [] as UserRole[] };
  }
  if (!auth.user) return { supabase, user: null, name: "", roles: [] as UserRole[] };
  const { data } = await supabase
    .from("role_assignments")
    .select("role")
    .eq("user_id", auth.user.id);
  const roles = (data ?? []).map((assignment) => assignment.role as UserRole);
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", auth.user.id)
    .maybeSingle();
  return { supabase, user: auth.user, name: profile?.full_name ?? "Administrator", roles };
}

export function isAdministrator(roles: UserRole[]) {
  return roles.some((role) => ADMIN_ROLES.includes(role));
}

export function canAdminister(roles: readonly UserRole[], permitted: readonly UserRole[]) {
  return roles.some((role) => permitted.includes(role));
}
