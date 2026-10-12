import Link from "next/link";

export function PortalSignInPrompt({ unavailable = false }: { unavailable?: boolean }) {
  return (
    <main className="site-container py-16">
      <section className="mx-auto max-w-xl border border-line bg-surface p-6">
        <h1 className="text-2xl font-bold">
          {unavailable ? "Member access is unavailable" : "Sign-in required"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {unavailable
            ? "The account service is not configured right now. Please try again later."
            : "Your membership information is private. Sign in with the email address on your account to continue."}
        </p>
        <Link className="button-primary mt-5" href="/auth/login">
          Go to member sign-in
        </Link>
      </section>
    </main>
  );
}
