import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MessageCircle, Share2 } from "lucide-react";
import { PublicPage } from "@/components/public/PublicPage";
import { AnnouncementCard, PublicContentImage } from "@/components/public/ContentCards";
import { getAnnouncement, getAnnouncements } from "@/lib/content/public-content";
import { siteUrl } from "@/lib/env";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getAnnouncement(slug);
  return item
    ? {
        title: item.title,
        description: item.excerpt,
        alternates: { canonical: `/news/${item.slug}` },
        openGraph: {
          type: "article",
          title: item.title,
          description: item.excerpt,
          images: item.cover_image
            ? [item.cover_image]
            : [`${siteUrl}/brand/arewa-for-asiwaju-a4a.jpg`],
        },
        twitter: {
          card: "summary_large_image",
          title: item.title,
          description: item.excerpt,
        },
      }
    : { title: "Story not found" };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [item, allNews] = await Promise.all([getAnnouncement(slug), getAnnouncements()]);
  if (!item) notFound();

  const readingTime = Math.max(
    1,
    Math.ceil(`${item.title} ${item.excerpt} ${item.content}`.trim().split(/\s+/).length / 200),
  );

  const articleUrl = `${siteUrl}/news/${item.slug}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${item.title}\n\nRead more on A4A Student Wing:\n${articleUrl}`,
  )}`;

  const relatedStories =
    allNews.state === "ready"
      ? allNews.items.filter((news) => news.slug !== item.slug).slice(0, 2)
      : [];

  return (
    <PublicPage>
      <div className="mx-auto max-w-[70ch]">
        {/* Navigation Breadcrumb */}
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-brand-forest mb-6"
        >
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
          <span>Back to all stories</span>
        </Link>

        {/* Article Header */}
        <header>
          <div className="flex items-center gap-3 text-xs">
            <span className="rounded bg-brand-forest/10 px-2 py-0.5 font-bold uppercase tracking-wider text-brand-forest">
              {item.category.replaceAll("_", " ")}
            </span>
            <span className="inline-flex items-center gap-1 text-muted">
              <Clock aria-hidden="true" className="h-3 w-3" />
              {readingTime} min read
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl leading-tight">
            {item.title}
          </h1>

          {item.published_at && (
            <time className="mt-3 block text-sm text-muted" dateTime={item.published_at}>
              Published on{" "}
              {new Intl.DateTimeFormat("en-NG", {
                dateStyle: "long",
                timeZone: "Africa/Lagos",
              }).format(new Date(item.published_at))}
            </time>
          )}

          {/* Social Share Toolbar (WhatsApp First) */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5 border-y border-line py-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Share:</span>
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#1EBE5D]"
            >
              <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Share to WhatsApp</span>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(articleUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand-forest"
            >
              <Share2 aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Share on X</span>
            </a>
          </div>
        </header>

        {/* Article Cover Image */}
        <PublicContentImage src={item.cover_image} alt={`${item.title} news image`} />

        {/* Lead Excerpt */}
        {item.excerpt && (
          <p className="mt-6 border-l-3 border-brand-forest pl-4 text-lg font-medium leading-relaxed text-ink/90 sm:text-xl">
            {item.excerpt}
          </p>
        )}

        {/* Article Body Content */}
        <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-ink sm:text-lg sm:leading-8">
          {item.content}
        </div>
      </div>

      {/* Related Stories */}
      {relatedStories.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl border-t border-line pt-10">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">Related dispatches</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {relatedStories.map((story) => (
              <AnnouncementCard key={story.id} item={story} />
            ))}
          </div>
        </section>
      )}
    </PublicPage>
  );
}
