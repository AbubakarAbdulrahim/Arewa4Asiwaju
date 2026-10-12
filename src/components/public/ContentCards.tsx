import Image from "next/image";
import Link from "next/link";
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
    return candidate.origin === storageOrigin ? candidate.href : null;
  } catch {
    return null;
  }
}

function ResponsiveImage({ src }: { src: string | null }) {
  const image = approvedImageUrl(src);
  if (!image) return null;
  return (
    <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-sm bg-[#e9eee9]">
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        unoptimized
        className="object-cover"
      />
    </div>
  );
}

export function AnnouncementCard({ item }: { item: PublicAnnouncement }) {
  return (
    <article className="border-t-2 border-brand-forest py-5">
      <ResponsiveImage src={item.cover_image} />
      <p className="eyebrow">{item.category.replaceAll("_", " ")}</p>
      <h2 className="mt-2 text-xl font-bold leading-snug text-ink">
        <Link className="underline-offset-4 hover:underline" href={`/news/${item.slug}`}>
          {item.title}
        </Link>
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{item.excerpt}</p>
      {item.published_at && (
        <time className="mt-3 block text-xs text-muted" dateTime={item.published_at}>
          {dateFormat.format(new Date(item.published_at))}
        </time>
      )}
    </article>
  );
}

export function EventCard({ item }: { item: PublicEvent }) {
  return (
    <article className="border-t-2 border-brand-ochre py-5">
      <ResponsiveImage src={item.banner_url} />
      <p className="eyebrow">{item.category.replaceAll("_", " ")}</p>
      <h2 className="mt-2 text-xl font-bold leading-snug text-ink">
        <Link className="underline-offset-4 hover:underline" href={`/events/${item.slug}`}>
          {item.title}
        </Link>
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
      <p className="mt-3 text-sm font-semibold text-ink">
        <time dateTime={item.start_date}>{dateFormat.format(new Date(item.start_date))}</time>
        {" · "}
        {item.is_virtual ? "Online" : `${item.venue}, ${item.state_code}`}
      </p>
    </article>
  );
}
