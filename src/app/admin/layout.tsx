import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminMfaGate } from "@/components/admin/AdminMfaGate";
import { getAdminSession, isAdministrator } from "@/lib/admin/server";
import { hasSupabaseConfig } from "@/lib/env";
import type { UserRole } from "@/types/database";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!hasSupabaseConfig) {
    return (
      <main id="main-content" className="site-container py-16">
        <h1 className="section-title">Administration setup pending</h1>
        <p className="mt-3 max-w-2xl text-muted">
          The administrator must finish connecting the data service before this workspace can load
          records.
        </p>
        <Link className="button-quiet mt-6" href="/admin-login">
          Admin sign in
        </Link>
      </main>
    );
  }
  // Admin pages depend on the current request's authenticated Supabase session.
  // Keep request-time auth work out of the prerendered shell.
  await connection();
  const { supabase, user, name, roles } = await getAdminSession();
  if (!user) redirect("/admin-login");
  if (!isAdministrator(roles)) {
    return (
      <main id="main-content" className="site-container py-16">
        <h1 className="section-title">Administrative access required</h1>
        <p className="mt-3 text-muted">
          This account does not have an assigned administration role.
        </p>
        <Link className="button-quiet mt-6" href="/portal">
          Return to member portal
        </Link>
      </main>
    );
  }
  const { data: assurance, error: assuranceError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assuranceError || assurance?.currentLevel !== "aal2") return <AdminMfaGate />;
  return (
    <AdminShell name={name} roles={roles as UserRole[]}>
      {children}
    </AdminShell>
  );
}
