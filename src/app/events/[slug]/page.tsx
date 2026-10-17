import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Download, MapPin, MessageCircle } from "lucide-react";
import { PublicPage } from "@/components/public/PublicPage";
import { PublicContentImage } from "@/components/public/ContentCards";
import { getEvent } from "@/lib/content/public-content";
import { siteUrl } from "@/lib/env";

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
          images: event.banner_url
            ? [event.banner_url]
            : [`${siteUrl}/brand/arewa-for-asiwaju-a4a.jpg`],
        },
        twitter: {
          card: "summary_large_image",
          title: event.title,
          description: event.description,
        },
      }
    : { title: "Event not found" };
}

function createIcsDataUri(event: {
  id: string;
  title: string;
  description: string;
  venue: string;
  state_code: string;
  is_virtual: boolean;
  start_date: string;
  end_date: string;
}) {
  const start = new Date(event.start_date).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const end = new Date(event.end_date).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Arewa4Asiwaju//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@arewa4asiwaju.org`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title.replaceAll("\n", " ")}`,
    `DESCRIPTION:${(event.description || "").replaceAll("\n", " ")}`,
    `LOCATION:${(event.is_virtual ? "Online Gathering" : `${event.venue}, ${event.state_code}`).replaceAll("\n", " ")}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return `data:text/calendar;charset=utf8,${encodeURIComponent(icsLines)}`;
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const dates = new Intl.DateTimeFormat("en-NG", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  });

  const icsUri = createIcsDataUri(event);

  return (
    <PublicPage>
      <article className="mx-auto max-w-[70ch]">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-brand-forest mb-6"
        >
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
          <span>Back to all events</span>
        </Link>

        <header>
          <div className="flex items-center gap-3 text-xs">
            <span className="rounded bg-brand-forest/10 px-2 py-0.5 font-bold uppercase tracking-wider text-brand-forest">
              {event.category.replaceAll("_", " ")}
            </span>
            <span className="font-semibold text-muted">
              {event.is_virtual ? "Online Event" : event.state_code}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl leading-tight">
            {event.title}
          </h1>

          {/* Event Details Card */}
          <div className="mt-6 rounded-md border border-line bg-surface p-5 sm:p-6 shadow-xs">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                  <Calendar aria-hidden="true" className="h-3.5 w-3.5 text-brand-forest" />
                  <span>Date & time</span>
                </dt>
                <dd className="text-sm font-semibold text-ink">
                  <time dateTime={event.start_date}>
                    {dates.format(new Date(event.start_date))}
                  </time>
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-brand-forest" />
                  <span>Venue</span>
                </dt>
                <dd className="text-sm font-semibold text-ink">
                  {event.is_virtual ? "Online Gathering" : `${event.venue}, ${event.state_code}`}
                </dd>
              </div>
            </dl>

            {/* Event Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-4">
              <a
                href={icsUri}
                download={`${event.slug}.ics`}
                className="button-secondary text-xs inline-flex items-center gap-1.5"
              >
                <Download aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Save to calendar (.ics)</span>
              </a>
              <a
                href={`https://wa.me/2349122628654?text=${encodeURIComponent(`Hello, I want to RSVP for ${event.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button-primary text-xs inline-flex items-center gap-1.5"
              >
                <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
                <span>RSVP on WhatsApp</span>
              </a>
            </div>
          </div>
        </header>

        <PublicContentImage src={event.banner_url} alt={`${event.title} event flyer`} />

        <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-ink sm:text-lg sm:leading-8">
          {event.description}
        </div>
      </article>
    </PublicPage>
  );
}
