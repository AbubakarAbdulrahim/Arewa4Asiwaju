import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function PublicPage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="site-container flex-1 py-12 sm:py-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <header className="mb-10 max-w-3xl border-b border-line pb-8">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">{title}</h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">{intro}</p>
    </header>
  );
}

export function ContentStatus({ state }: { state: "not-configured" | "unavailable" | "empty" }) {
  const copy = {
    "not-configured": [
      "Content publishing is not connected yet.",
      "Published items will appear here after the organisation configures its content database.",
    ],
    unavailable: ["Updates are temporarily unavailable.", "Please check back later."],
    empty: [
      "Nothing has been published yet.",
      "There are no approved public items to show at this time.",
    ],
  } as const;
  return (
    <div className="border-l-4 border-brand-ochre bg-[#f5f0e5] px-5 py-4">
      <h2 className="font-bold text-ink">{copy[state][0]}</h2>
      <p className="mt-1 text-sm text-muted">{copy[state][1]}</p>
    </div>
  );
}
