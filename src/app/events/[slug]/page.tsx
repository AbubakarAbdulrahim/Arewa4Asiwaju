import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public/PublicPage";
import { PublicContentImage } from "@/components/public/ContentCards";
import { getEvent } from "@/lib/content/public-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  return event
    ? {
        title: event.title,
        description: event.description,
        alternates: { canonical: `/events/${event.slug}` },
        openGraph: {
          title: event.title,
          description: event.description,
          images: event.banner_url ? [event.banner_url] : undefined,
        },
      }
    : { title: "Event not found" };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();
  const dates = new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  });
  return (
    <PublicPage>
      <article className="mx-auto max-w-3xl">
        <p className="eyebrow">{event.category.replaceAll("_", " ")}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {event.title}
        </h1>
        <PublicContentImage src={event.banner_url} alt={`${event.title} event flyer`} />
        <dl className="mt-7 grid gap-4 border-y border-line py-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-muted">Starts</dt>
            <dd className="mt-1 font-semibold text-ink">
              <time dateTime={event.start_date}>{dates.format(new Date(event.start_date))}</time>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-muted">Location</dt>
            <dd className="mt-1 font-semibold text-ink">
              {event.is_virtual ? "Online" : `${event.venue}, ${event.state_code}`}
            </dd>
          </div>
        </dl>
        <div className="mt-7 whitespace-pre-wrap text-base leading-8 text-ink">
          {event.description}
        </div>
      </article>
    </PublicPage>
  );
}
