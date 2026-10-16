import Link from "next/link";
import { MemberPasswordResetForm } from "@/components/auth/MemberPasswordResetForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function MemberPasswordResetPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return (
      <main id="main-content" className="site-container py-12 sm:py-20">
        <section className="mx-auto max-w-lg border border-line bg-surface p-6 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[.15em] text-brand-forest">
            Member access
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Reset link expired or invalid</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Open the latest reset email in this browser, or request a new one from member access.
          </p>
          <Link className="button-primary mt-6" href="/login">
            Return to member access
          </Link>
        </section>
      </main>
    );
  }
  return <MemberPasswordResetForm />;
}
