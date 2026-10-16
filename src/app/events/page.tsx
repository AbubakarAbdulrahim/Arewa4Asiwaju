import type { Metadata } from "next";
import { CalendarDays, MapPinned } from "lucide-react";
import { ContentStatus, PublicPage } from "@/components/public/PublicPage";
import { EventCard } from "@/components/public/ContentCards";
import { getEvents, getPublicContentTime, splitEventsByDate } from "@/lib/content/public-content";

export const metadata: Metadata = {
  title: "Events and activities",
  description: "Find upcoming public events and activities from Arewa for Asiwaju.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const result = await getEvents();
  const events = result.state === "ready" ? result.items : [];
  const { upcoming, recent } = splitEventsByDate(events, await getPublicContentTime());

  return (
    <PublicPage>
      <header className="relative overflow-hidden rounded-xl bg-[#063e26] px-6 py-9 text-white sm:px-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-white/70">
              Gather, learn, participate
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              Events and activities
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Find public meetings, student activities, and community programmes published by the
              movement. Event details are maintained by authorised organisers.
            </p>
          </div>
          <CalendarDays
            aria-hidden="true"
            className="hidden h-14 w-14 text-white/70 lg:block"
            strokeWidth={1.2}
          />
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/20 pt-4 text-sm text-white/80">
          <span className="inline-flex items-center gap-2">
            <MapPinned aria-hidden="true" className="h-4 w-4 text-white" stroke="white" /> State,
            LGA, campus, and online listings
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="h-4 w-4 text-white" stroke="white" /> Dates
            and venues shown on each event
          </span>
        </div>
      </header>

      {result.state !== "ready" ? (
        <section className="py-9">
          <ContentStatus state={result.state} />
        </section>
      ) : (
        <>
          <section className="py-10 sm:py-12" aria-labelledby="upcoming-heading">
            <p className="eyebrow">What&apos;s next</p>
            <h2 id="upcoming-heading" className="section-title mt-2">
              Upcoming events
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Check each event page for its location, participation details, and any registration
              requirements.
            </p>
            {upcoming.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-line bg-surface px-5 py-8 text-center">
                <CalendarDays aria-hidden="true" className="mx-auto h-7 w-7 text-brand-forest" />
                <h3 className="mt-3 font-bold text-ink">No upcoming events published</h3>
                <p className="mt-1 text-sm text-muted">
                  Please check back for new activities and announcements.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {upcoming.map((event) => (
                  <EventCard key={event.id} item={event} />
                ))}
              </div>
            )}
          </section>

          {recent.length > 0 && (
            <section
              className="border-t border-line py-10 sm:py-12"
              aria-labelledby="recent-heading"
            >
              <p className="eyebrow">From the archive</p>
              <h2 id="recent-heading" className="section-title mt-2">
                Recent activities
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {recent.map((event) => (
                  <EventCard key={event.id} item={event} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </PublicPage>
  );
}
