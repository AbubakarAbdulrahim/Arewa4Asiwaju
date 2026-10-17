import type { Metadata } from "next";
import { PublicPage, PageHeading, ContentStatus } from "@/components/public/PublicPage";
import { EventsDirectory } from "@/components/public/EventsDirectory";
import { getEvents } from "@/lib/content/public-content";

export const metadata: Metadata = {
  title: "Events and campus activities",
  description:
    "Student symposiums, policy dialogues, and chapter gatherings across Northern Nigeria.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "Events and activities | Arewa for Asiwaju Student Wing",
    description: "Find upcoming youth assemblies and campus policy forums across Northern Nigeria.",
  },
};

export default async function EventsPage() {
  const result = await getEvents();
  const events = result.state === "ready" ? result.items : [];

  return (
    <PublicPage>
      <PageHeading
        eyebrow="Campus calendar"
        title="Student symposiums and policy dialogues"
        intro="Find upcoming chapter gatherings, policy debates, and delegate conferences organised by the Student Wing across the 19 northern states and the FCT."
      />

      {result.state !== "ready" ? (
        <section className="py-6">
          <ContentStatus state={result.state} kind="events" />
        </section>
      ) : events.length === 0 ? (
        <section className="py-6">
          <ContentStatus state="empty" kind="events" />
        </section>
      ) : (
        <section className="py-6" aria-labelledby="calendar-heading">
          <h2 id="calendar-heading" className="sr-only">
            Events directory
          </h2>
          <EventsDirectory events={events} />
        </section>
      )}
    </PublicPage>
  );
}
