import type { Metadata } from "next";
import { ContentStatus, PageHeading, PublicPage } from "@/components/public/PublicPage";
import { EventCard } from "@/components/public/ContentCards";
import { getEvents } from "@/lib/content/public-content";

export const metadata: Metadata = {
  title: "Events and activities",
  description: "Upcoming published events and activities from Arewa for Asiwaju.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const result = await getEvents();
  const upcoming =
    result.state === "ready"
      ? result.items.filter((event) => new Date(event.end_date) >= new Date())
      : [];
  return (
    <PublicPage>
      <PageHeading
        eyebrow="Events"
        title="Events and activities"
        intro="Public activities will be listed here when event details are approved and published."
      />
      {result.state !== "ready" || upcoming.length === 0 ? (
        <ContentStatus state={result.state === "ready" ? "empty" : result.state} />
      ) : (
        <div className="divide-y divide-line">
          {upcoming.map((event) => (
            <EventCard key={event.id} item={event} />
          ))}
        </div>
      )}
    </PublicPage>
  );
}
