"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Next's digest is safe to report; avoid forwarding user or request data here.
    console.error("Application route error", { digest: error.digest });
  }, [error.digest]);

  return (
    <main
      id="main-content"
      className="site-container grid min-h-[60vh] content-center gap-4 py-12"
      role="alert"
    >
      <p className="eyebrow">Something went wrong</p>
      <h1 className="section-title">This page could not be loaded.</h1>
      <p className="max-w-xl text-muted">
        Please try again. Your account and personal information have not been included in this error
        message.
      </p>
      <div className="responsive-cta-group flex gap-3">
        <button className="button-primary" type="button" onClick={reset}>
          Try again
        </button>
        <Link className="button-secondary" href="/">
          Return home
        </Link>
      </div>
    </main>
  );
}
