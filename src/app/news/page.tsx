import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { AnnouncementCard } from "@/components/public/ContentCards";
import { ContentStatus, PageHeading, PublicPage } from "@/components/public/PublicPage";
import { getAnnouncements } from "@/lib/content/public-content";

export const metadata: Metadata = {
  title: "News and student dispatches",
  description:
    "Student dispatches, policy updates, and verified news from the Arewa for Asiwaju Student Wing.",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "News and announcements | Arewa for Asiwaju Student Wing",
    description: "Read the latest movement updates and policy briefs across Northern Nigeria.",
  },
};

export default async function NewsPage() {
  const result = await getAnnouncements();
  const items = result.state === "ready" ? result.items : [];
  const categories = Array.from(new Set(items.map((item) => item.category)));

  return (
    <PublicPage>
      <PageHeading
        eyebrow="Newsroom"
        title="Dispatches and policy briefings"
        intro="Read regional student updates, policy analyses of the Renewed Hope Agenda, and reports from chapters across Northern Nigeria."
      />

      {/* Category Chips (shown only if categories exist) */}
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap items-center gap-2" aria-label="News categories">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">Category:</span>
          {categories.map((cat) => (
            <span
              key={cat}
              className="rounded-xs border border-line bg-surface px-2.5 py-1 text-xs font-bold capitalize text-ink"
            >
              {cat.replaceAll("_", " ")}
            </span>
          ))}
        </div>
      )}

      {/* Article List / Empty State */}
      <section aria-labelledby="articles-heading" className="pb-12">
        <h2 id="articles-heading" className="sr-only">
          Published articles
        </h2>

        {result.state !== "ready" || items.length === 0 ? (
          <ContentStatus state={result.state === "ready" ? "empty" : result.state} kind="news" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <AnnouncementCard key={item.id} item={item} featured={index === 0} />
            ))}
          </div>
        )}
      </section>

      {/* WhatsApp Community Invitation Band */}
      <section className="mt-8 rounded-md border border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="text-lg font-bold text-ink sm:text-xl">
              Get news delivered to your phone
            </h2>
            <p className="mt-1 text-sm text-muted">
              Receive breaking student updates, bursary alerts, and event notifications on WhatsApp.
            </p>
          </div>
          <a
            href="https://wa.me/2349122628654?text=Hello%2C%20I%20want%20to%20subscribe%20to%20A4A%20Student%20Wing%20news"
            target="_blank"
            rel="noopener noreferrer"
            className="button-primary inline-flex items-center gap-2 text-sm shrink-0"
          >
            <Newspaper aria-hidden="true" className="h-4 w-4" />
            <span>Join WhatsApp Channel</span>
          </a>
        </div>
      </section>
    </PublicPage>
  );
}
