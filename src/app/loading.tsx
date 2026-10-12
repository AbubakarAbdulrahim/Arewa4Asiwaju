export default function Loading() {
  return (
    <main
      id="main-content"
      className="site-container grid min-h-[50vh] content-center py-12"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="eyebrow">Loading</p>
      <p className="mt-2 text-muted">Please wait while this page loads.</p>
    </main>
  );
}
