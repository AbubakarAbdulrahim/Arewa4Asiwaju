import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Newspaper, Clock } from "lucide-react";
import { env } from "@/lib/env";
import type { PublicAnnouncement, PublicEvent } from "@/lib/content/public-content";

const dateFormat = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeZone: "Africa/Lagos",
});

function approvedImageUrl(value: string | null) {
  if (!value) return null;
  if (value.startsWith("/brand/") && !value.includes("..")) return value;
  if (!env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const candidate = new URL(value);
    const storageOrigin = new URL(env.NEXT_PUBLIC_SUPABASE_URL).origin;
    return candidate.protocol === "https:" && candidate.origin === storageOrigin
      ? candidate.href
      : null;
  } catch {
    return null;
  }
}

export function PublicContentImage({ src, alt }: { src: string | null; alt: string }) {
  const image = approvedImageUrl(src);
  if (!image) return null;
  return (
    <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-md border border-line bg-surface">
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 768px"
        unoptimized
        fetchPriority="high"
        className="object-cover"
      />
    </div>
  );
}

function CardImage({
  src,
  alt,
  kind,
}: {
  src: string | null;
  alt: string;
  kind: "news" | "event";
}) {
  const image = approvedImageUrl(src);
  const Icon = kind === "news" ? Newspaper : CalendarDays;
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-[#e8f2ea]">
      {image ? (
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-forest text-white">
          <div className="flex flex-col items-center gap-2 text-white/90">
            <Icon
              aria-hidden="true"
              className="h-8 w-8 text-white"
              stroke="white"
              strokeWidth={1.5}
            />
            <span className="text-xs font-bold uppercase tracking-wider">
              {kind === "news" ? "Student Dispatch" : "Campus Gathering"}
            </span>
          </div>
        </div>
      )}
      <span className="absolute left-3 top-3 rounded-xs bg-white/95 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-brand-forest shadow-xs">
        {kind === "news" ? "News" : "Event"}
      </span>
    </div>
  );
}

function categoryLabel(category: string) {
  return category.replaceAll("_", " ");
}

function estimateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function AnnouncementCard({
  item,
  featured = false,
}: {
  item: PublicAnnouncement;
  featured?: boolean;
}) {
  const readingTime = estimateReadingTime(`${item.title} ${item.excerpt} ${item.content}`);

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-md border border-line bg-surface transition-colors hover:border-brand-forest ${
        featured ? "md:col-span-2 md:grid md:grid-cols-2" : ""
      }`}
    >
      <Link
        href={`/news/${item.slug}`}
        aria-label={`Read ${item.title}`}
        className="block focus-visible:outline-offset-[-3px]"
      >
        <CardImage src={item.cover_image} alt={`${item.title} news image`} kind="news" />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-bold uppercase tracking-wider text-brand-forest">
            {categoryLabel(item.category)}
          </span>
          <div className="flex items-center gap-3 text-muted">
            {item.published_at && (
              <time dateTime={item.published_at}>
                {dateFormat.format(new Date(item.published_at))}
              </time>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock aria-hidden="true" className="h-3 w-3" />
              {readingTime} min read
            </span>
          </div>
        </div>
        <h3
          className={`mt-2.5 font-bold leading-snug text-ink group-hover:text-brand-forest ${
            featured ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
          }`}
        >
          <Link href={`/news/${item.slug}`} className="focus-visible:underline">
            {item.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-3">
          {item.excerpt}
        </p>
        <Link
          className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-bold text-brand-forest underline-offset-4 hover:underline"
          href={`/news/${item.slug}`}
        >
          <span>Read story</span>
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export function EventCard({ item }: { item: PublicEvent }) {
  const startDate = new Date(item.start_date);
  const location = item.is_virtual
    ? "Online gathering"
    : [item.venue, item.state_code].filter(Boolean).join(", ");

  const dayNumber = startDate.getDate();
  const monthShort = startDate.toLocaleDateString("en-NG", {
    month: "short",
    timeZone: "Africa/Lagos",
  });

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-md border border-line bg-surface transition-colors hover:border-brand-forest">
      <Link
        href={`/events/${item.slug}`}
        aria-label={`View ${item.title}`}
        className="block focus-visible:outline-offset-[-3px]"
      >
        <CardImage src={item.banner_url} alt={`${item.title} event flyer`} kind="event" />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Prominent Date Block */}
          <div className="flex flex-col items-center justify-center rounded-xs border border-line bg-paper px-2.5 py-1.5 text-center shrink-0">
            <span className="font-mono text-xs font-bold uppercase text-brand-forest">
              {monthShort}
            </span>
            <span className="font-mono text-xl font-extrabold text-ink leading-tight">
              {dayNumber}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-brand-forest">
                {categoryLabel(item.category)}
              </span>
              <span className="font-semibold text-muted">
                {item.is_virtual ? "Virtual" : item.state_code || "Campus"}
              </span>
            </div>
            <h3 className="mt-1.5 text-lg font-bold leading-snug text-ink group-hover:text-brand-forest">
              <Link href={`/events/${item.slug}`} className="focus-visible:underline">
                {item.title}
              </Link>
            </h3>
          </div>
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted line-clamp-2">
          {item.description}
        </p>
        <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-ink">
          <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-brand-forest" />
          <span className="truncate">{location}</span>
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-xs">
          <Link
            className="inline-flex items-center gap-1 font-bold text-brand-forest underline-offset-4 hover:underline"
            href={`/events/${item.slug}`}
          >
            <span>Details & RSVP</span>
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
          <span className="rounded-xs bg-[#e8f2ea] px-2 py-0.5 font-mono text-[0.6875rem] font-bold text-brand-forest">
            Open RSVP
          </span>
        </div>
      </div>
    </article>
  );
}
