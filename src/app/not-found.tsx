import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="site-container grid min-h-[60vh] content-center gap-4 py-12">
      <p className="eyebrow">Page not found</p>
      <h1 className="section-title">We could not find that page.</h1>
      <p className="max-w-xl text-muted">
        The address may have changed or the page may no longer be available.
      </p>
      <Link className="button-primary w-fit" href="/">
        Return home
      </Link>
    </main>
  );
}
