import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public/PublicPage";
import { getAnnouncement } from "@/lib/content/public-content";

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
          images: item.cover_image ? [item.cover_image] : undefined,
        },
      }
    : { title: "News item not found" };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getAnnouncement(slug);
  if (!item) notFound();
  return (
    <PublicPage>
      <article className="mx-auto max-w-3xl">
        <p className="eyebrow">{item.category.replaceAll("_", " ")}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {item.title}
        </h1>
        {item.published_at && (
          <time className="mt-4 block text-sm text-muted" dateTime={item.published_at}>
            {new Intl.DateTimeFormat("en-NG", {
              dateStyle: "long",
              timeZone: "Africa/Lagos",
            }).format(new Date(item.published_at))}
          </time>
        )}
        <p className="mt-7 border-l-4 border-brand-ochre pl-4 text-lg leading-relaxed text-muted">
          {item.excerpt}
        </p>
        <div className="prose-a4a mt-8 whitespace-pre-wrap text-base leading-8 text-ink">
          {item.content}
        </div>
      </article>
    </PublicPage>
  );
}
