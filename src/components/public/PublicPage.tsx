import type { ReactNode } from "react";
import Link from "next/link";
import { MessageCircle, CalendarPlus, ArrowRight } from "lucide-react";
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
  eyebrow?: string;
  title: string;
  intro: string;
}) {
  return (
    <header className="mb-10 max-w-3xl border-b border-line pb-8">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{intro}</p>
    </header>
  );
}

export function ContentStatus({
  state,
  kind = "general",
}: {
  state: "not-configured" | "unavailable" | "empty";
  kind?: "news" | "events" | "general";
}) {
  if (state === "empty") {
    if (kind === "news") {
      return (
        <div className="rounded-md border border-line bg-surface p-6 sm:p-8">
          <h3 className="text-lg font-bold text-ink sm:text-xl">
            No stories yet. Follow us on WhatsApp to get the first one.
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            We publish student dispatches, policy briefs, and regional coordinator updates directly
            to our community channels.
          </p>
          <div className="mt-5">
            <a
              href="https://wa.me/2349122628654?text=Hello%2C%20I%20would%20like%20to%20follow%20A4A%20Student%20Wing%20updates"
              target="_blank"
              rel="noopener noreferrer"
              className="button-primary inline-flex items-center gap-2 text-sm"
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4" />
              <span>Follow on WhatsApp</span>
            </a>
          </div>
        </div>
      );
    }

    if (kind === "events") {
      return (
        <div className="rounded-md border border-line bg-surface p-6 sm:p-8">
          <h3 className="text-lg font-bold text-ink sm:text-xl">
            No campus events scheduled right now.
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Interested in hosting a Renewed Hope policy forum, voter education drive, or student
            gathering on your campus? Contact the coordination desk.
          </p>
          <div className="mt-5">
            <Link
              href="/contact?subject=Host-Campus-Event"
              className="button-primary inline-flex items-center gap-2 text-sm"
            >
              <CalendarPlus aria-hidden="true" className="h-4 w-4" />
              <span>Request a campus meet-up</span>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-md border border-line bg-surface p-6">
        <h3 className="font-bold text-ink">No updates posted yet.</h3>
        <p className="mt-1 text-sm text-muted">
          Follow our community on WhatsApp for real-time announcements.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border-l-4 border-brand-ochre bg-surface p-5 sm:p-6 shadow-xs">
      <h3 className="font-bold text-ink">Updates are refreshing.</h3>
      <p className="mt-1 text-sm text-muted">
        Connect directly with student coordinators on WhatsApp for live movement notices.
      </p>
      <div className="mt-4">
        <a
          href="https://wa.me/2349122628654"
          target="_blank"
          rel="noopener noreferrer"
          className="button-secondary inline-flex items-center gap-2 text-xs"
        >
          <span>Connect via WhatsApp</span>
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
