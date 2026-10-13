import type { Metadata } from "next";
import { AnnouncementCard } from "@/components/public/ContentCards";
import { ContentStatus, PageHeading, PublicPage } from "@/components/public/PublicPage";
import { getAnnouncements } from "@/lib/content/public-content";

export const metadata: Metadata = {
  title: "News and announcements",
  description: "Published news and announcements from Arewa for Asiwaju.",
  alternates: { canonical: "/news" },
  openGraph: { title: "News and announcements | Arewa for Asiwaju" },
};

export default async function NewsPage() {
  const result = await getAnnouncements();
  return (
    <PublicPage>
      <PageHeading
        eyebrow="Newsroom"
        title="News and announcements"
        intro="Updates appear here after they have been reviewed and published by an authorised editor."
      />
      {result.state !== "ready" || result.items.length === 0 ? (
        <ContentStatus state={result.state === "ready" ? "empty" : result.state} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {result.items.map((item) => (
            <AnnouncementCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </PublicPage>
  );
}
