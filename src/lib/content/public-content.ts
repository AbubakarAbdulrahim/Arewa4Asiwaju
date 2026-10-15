import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { env, hasSupabaseConfig } from "@/lib/env";

export type PublicAnnouncement = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image: string | null;
  published_at: string | null;
};

export type PublicEvent = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  venue: string;
  state_code: string;
  is_virtual: boolean;
  banner_url: string | null;
  start_date: string;
  end_date: string;
  capacity: number | null;
};

export function splitEventsByDate(items: PublicEvent[], now: number) {
  return {
    upcoming: items.filter((event) => new Date(event.end_date).getTime() >= now),
    recent: items
      .filter((event) => new Date(event.end_date).getTime() < now)
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
      .slice(0, 6),
  };
}

export async function getPublicContentTime(): Promise<number> {
  "use cache";
  cacheLife("minutes");
  return Date.now();
}

export type PublicLeader = {
  id: string;
  full_name: string;
  title: string;
  biography: string;
  photo_url: string | null;
  unit_name: string | null;
};

export type PublicResult<T> =
  | { state: "ready"; items: T[] }
  | { state: "not-configured"; items: [] }
  | { state: "unavailable"; items: [] };

function publicClient() {
  if (!hasSupabaseConfig) return null;
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function getAnnouncements(): Promise<PublicResult<PublicAnnouncement>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("public-announcements");
  const client = publicClient();
  if (!client) return { state: "not-configured", items: [] };
  const { data, error } = await client
    .from("announcements")
    .select("id,title,slug,excerpt,content,category,cover_image,published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(50);
  if (error) return { state: "unavailable", items: [] };
  return { state: "ready", items: (data ?? []) as PublicAnnouncement[] };
}

export async function getAnnouncement(slug: string): Promise<PublicAnnouncement | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("public-announcements");
  const client = publicClient();
  if (!client) return null;
  const { data, error } = await client
    .from("announcements")
    .select("id,title,slug,excerpt,content,category,cover_image,published_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) return null;
  return data as PublicAnnouncement | null;
}

export async function getEvents(): Promise<PublicResult<PublicEvent>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("public-events");
  const client = publicClient();
  if (!client) return { state: "not-configured", items: [] };
  const { data, error } = await client
    .from("events")
    .select(
      "id,title,slug,description,category,venue,state_code,is_virtual,banner_url,start_date,end_date,capacity",
    )
    .eq("is_published", true)
    .order("start_date", { ascending: true })
    .limit(50);
  if (error) return { state: "unavailable", items: [] };
  return { state: "ready", items: (data ?? []) as PublicEvent[] };
}

export async function getEvent(slug: string): Promise<PublicEvent | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("public-events");
  const client = publicClient();
  if (!client) return null;
  const { data, error } = await client
    .from("events")
    .select(
      "id,title,slug,description,category,venue,state_code,is_virtual,banner_url,start_date,end_date,capacity",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) return null;
  return data as PublicEvent | null;
}

export async function getPublicLeadership(): Promise<PublicLeader[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("public-leadership");
  const client = publicClient();
  if (!client) return [];
  const { data, error } = await client.rpc("get_public_leadership");
  if (error || !Array.isArray(data)) return [];
  return data as unknown as PublicLeader[];
}
