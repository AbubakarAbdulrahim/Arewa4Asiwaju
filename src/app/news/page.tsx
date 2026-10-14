import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Newspaper } from "lucide-react";
import { AnnouncementCard } from "@/components/public/ContentCards";
import { ContentStatus, PublicPage } from "@/components/public/PublicPage";
import { getAnnouncements } from "@/lib/content/public-content";

export const metadata: Metadata = {
  title: "News and announcements",
  description: "Official news, announcements, and public updates from Arewa for Asiwaju.",
  alternates: { canonical: "/news" },
  openGraph: { title: "News and announcements | Arewa for Asiwaju" },
};

export default async function NewsPage() {
  const result = await getAnnouncements();
  return (
    <PublicPage>
      <header className="grid gap-8 border-b border-line pb-9 lg:grid-cols-[1fr_.55fr] lg:items-end">
        <div>
          <p className="eyebrow">A4A newsroom</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            News and announcements
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-muted">
            Updates from the movement, published for members, students, and communities across the
            region.
          </p>
        </div>
        <div className="flex items-start gap-3 border-l-2 border-brand-ochre pl-4">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-forest" />
          <p className="text-sm leading-6 text-muted">
            News and notices are managed by authorised editors. Published items link to their full
            story or announcement.
          </p>
        </div>
      </header>

      <section className="py-9 sm:py-12" aria-labelledby="latest-news-heading">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Latest updates</p>
            <h2 id="latest-news-heading" className="section-title mt-2">From the movement</h2>
          </div>
          <Newspaper aria-hidden="true" className="hidden h-7 w-7 text-brand-forest sm:block" />
        </div>
        {result.state !== "ready" || result.items.length === 0 ? (
          <ContentStatus state={result.state === "ready" ? "empty" : result.state} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {result.items.map((item) => <AnnouncementCard key={item.id} item={item} />)}
          </div>
        )}
      </section>

      <aside className="flex flex-col gap-4 rounded-lg border border-line bg-[#f1f5f1] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-lg font-bold text-ink">Want to be part of the updates?</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Join the Student Wing to participate in movement activities and receive relevant information.
          </p>
        </div>
        <Link href="/register" className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-sm bg-brand-forest px-4 py-2 text-sm font-bold text-white hover:bg-brand-forest-dark sm:self-auto">
          Join the Student Wing <ArrowRight aria-hidden="true" className="h-4 w-4 text-white" stroke="white" />
        </Link>
      </aside>
    </PublicPage>
  );
}
