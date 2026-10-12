import Link from "next/link";

export default function AdminPasswordResetErrorPage() {
  return (
    <main id="main-content" className="site-container py-12 sm:py-20">
      <section className="mx-auto max-w-lg border border-line bg-surface p-6 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.15em] text-brand-forest">
          A4A administration
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Reset link expired or invalid</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          The link may have expired or already been used. Request a new reset email and open the
          latest link on this site.
        </p>
        <Link className="button-primary mt-6" href="/admin-login">
          Return to admin sign in
        </Link>
      </section>
    </main>
  );
}
