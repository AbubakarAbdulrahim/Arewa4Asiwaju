"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            maxWidth: 720,
            margin: "12vh auto",
            padding: 24,
            fontFamily: "Arial, sans-serif",
          }}
          role="alert"
        >
          <h1>We could not load the Arewa for Asiwaju Student Wing site</h1>
          <p>Please try again or return to the site shortly.</p>
          <button type="button" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
