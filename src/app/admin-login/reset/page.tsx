import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminPasswordResetForm } from "./ResetPasswordForm";

export default async function AdminPasswordResetPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return (
      <main id="main-content" className="site-container py-12 sm:py-20">
        <section className="mx-auto max-w-lg border border-line bg-surface p-6 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[.15em] text-brand-forest">
            A4A administration
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Reset link expired or invalid</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Open the latest reset email in the same browser where you requested it. The link may
            have expired or already been used.
          </p>
          <Link className="button-primary mt-6" href="/admin-login">
            Request another reset link
          </Link>
        </section>
      </main>
    );
  }

  return <AdminPasswordResetForm />;
}
