import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Newspaper } from "lucide-react";
import { env } from "@/lib/env";
import type { PublicAnnouncement, PublicEvent } from "@/lib/content/public-content";

const dateFormat = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "long",
  timeZone: "Africa/Lagos",
});

function approvedImageUrl(value: string | null) {
  if (!value) return null;
  if (value.startsWith("/brand/") && !value.includes("..")) return value;
  if (!env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const candidate = new URL(value);
    const storageOrigin = new URL(env.NEXT_PUBLIC_SUPABASE_URL).origin;
    return candidate.protocol === "https:" && candidate.origin === storageOrigin ? candidate.href : null;
  } catch {
    return null;
  }
}

export function PublicContentImage({ src, alt }: { src: string | null; alt: string }) {
  const image = approvedImageUrl(src);
  if (!image) return null;
  return (
    <div className="relative mt-7 aspect-[16/9] overflow-hidden rounded-lg bg-[#e9eee9]">
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
    <div className="relative aspect-[16/10] overflow-hidden bg-[#e9eee9]">
      {image ? (
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-forest text-white">
          <div className="flex flex-col items-center gap-3 text-white/85">
            <Icon aria-hidden="true" className="h-9 w-9 text-white" stroke="white" strokeWidth={1.5} />
            <span className="text-xs font-bold uppercase tracking-[.16em]">
              {kind === "news" ? "A4A newsroom" : "A4A event"}
            </span>
          </div>
        </div>
      )}
      <span className="absolute left-4 top-4 rounded-sm bg-white/95 px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[.1em] text-brand-forest shadow-sm">
        {kind === "news" ? "News" : "Event"}
      </span>
    </div>
  );
}

function categoryLabel(category: string) {
  return category.replaceAll("_", " ");
}

export function AnnouncementCard({ item }: { item: PublicAnnouncement }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-md">
      <Link href={`/news/${item.slug}`} aria-label={`Read ${item.title}`} className="block focus-visible:outline-offset-[-3px]">
        <CardImage src={item.cover_image} alt={`${item.title} news image`} kind="news" />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-bold uppercase tracking-[.1em] text-brand-forest">
            {categoryLabel(item.category)}
          </span>
          {item.published_at && (
            <time className="shrink-0 text-muted" dateTime={item.published_at}>
              {dateFormat.format(new Date(item.published_at))}
            </time>
          )}
        </div>
        <h3 className="mt-3 text-xl font-bold leading-snug text-ink sm:text-[1.35rem]">
          <Link className="hover:text-brand-forest focus-visible:underline" href={`/news/${item.slug}`}>
            {item.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-muted">{item.excerpt}</p>
        <Link
          className="mt-5 inline-flex min-h-10 items-center gap-2 self-start text-sm font-bold text-brand-forest underline-offset-4 hover:underline"
          href={`/news/${item.slug}`}
        >
          Read the story <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

export function EventCard({ item }: { item: PublicEvent }) {
  const location = item.is_virtual ? "Online" : [item.venue, item.state_code].filter(Boolean).join(", ");
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-md">
      <Link href={`/events/${item.slug}`} aria-label={`View ${item.title}`} className="block focus-visible:outline-offset-[-3px]">
        <CardImage src={item.banner_url} alt={`${item.title} event flyer`} kind="event" />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-bold uppercase tracking-[.1em] text-brand-forest">
            {categoryLabel(item.category)}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-muted">
            <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
            <time dateTime={item.start_date}>{dateFormat.format(new Date(item.start_date))}</time>
          </span>
        </div>
        <h3 className="mt-3 text-xl font-bold leading-snug text-ink sm:text-[1.35rem]">
          <Link className="hover:text-brand-forest focus-visible:underline" href={`/events/${item.slug}`}>
            {item.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-muted">{item.description}</p>
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink">
          <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-forest" />
          <span>{location}</span>
        </p>
        <Link
          className="mt-4 inline-flex min-h-10 items-center gap-2 self-start text-sm font-bold text-brand-forest underline-offset-4 hover:underline"
          href={`/events/${item.slug}`}
        >
          Learn more <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
