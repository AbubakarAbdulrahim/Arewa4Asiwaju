import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PortalShell } from "@/components/portal/PortalShell";
import { hasSupabaseConfig } from "@/lib/env";
import { PortalSignInPrompt } from "@/components/portal/PortalSignInPrompt";

export default async function MemberPortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!hasSupabaseConfig) return <PortalSignInPrompt unavailable />;
  let user: User | null = null;
  let profile: { full_name: string } | null = null;
  try {
    const supabase = await createServerSupabaseClient();
    const auth = await supabase.auth.getUser();
    user = auth.data.user;
    if (user) {
      const result = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      profile = result.data;
    }
  } catch {
    return <PortalSignInPrompt />;
  }
  if (!user || !profile) return <PortalSignInPrompt />;
  return <PortalShell memberName={profile.full_name}>{children}</PortalShell>;
}
