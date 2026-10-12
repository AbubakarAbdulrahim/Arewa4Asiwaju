import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";

export const instant = false;

export default async function MemberAnnouncementsPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("title,slug,excerpt,category,published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(50);
  return (
    <section>
      <h2 className="text-xl font-bold">Announcements</h2>
      <p className="mt-2 text-sm text-muted">Official public updates from Arewa for Asiwaju.</p>
      {error ? (
        <p className="mt-5 border border-red-300 bg-red-50 p-4 text-sm text-red-900" role="alert">
          Announcements are temporarily unavailable.
        </p>
      ) : !data?.length ? (
        <p className="mt-5 border border-line p-5 text-sm text-muted">
          There are no published announcements yet.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {data.map((item) => (
            <li key={item.slug} className="py-5">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-forest">
                {item.category}{" "}
                {item.published_at
                  ? `· ${new Date(item.published_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}`
                  : ""}
              </p>
              <Link
                href={`/news/${item.slug}`}
                className="mt-2 block text-lg font-bold text-ink underline"
              >
                {item.title}
              </Link>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{item.excerpt}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
