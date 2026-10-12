import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const instant = false;

export default async function MemberDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase
    .from("memberships")
    .select("id,membership_number,status,state_code,created_at")
    .eq("profile_id", user.id)
    .maybeSingle();
  const { data: upcoming } = await supabase
    .from("events")
    .select("id,title,slug,start_date,venue,state_code")
    .eq("is_published", true)
    .gt("start_date", new Date().toISOString())
    .order("start_date")
    .limit(3);
  const { data: registrations } = membership
    ? await supabase
        .from("event_registrations")
        .select("event_id,registered_at")
        .eq("membership_id", membership.id)
    : { data: [] };
  const registered = new Set((registrations ?? []).map((item) => item.event_id));
  const { count: openSupport } = membership
    ? await supabase
        .from("support_requests")
        .select("id", { count: "exact", head: true })
        .eq("membership_id", membership.id)
        .in("status", ["open", "in_progress"])
    : { count: 0 };

  return (
    <div>
      <h2 className="text-xl font-bold">Your membership</h2>
      {membership ? (
        <section className="mt-4 grid gap-5 border border-line bg-surface p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-sm text-muted">Membership number</p>
            <p className="mt-1 font-mono text-xl font-bold text-brand-forest">
              {membership.membership_number}
            </p>
            <p className="mt-3 text-sm">
              Status:{" "}
              <span className="font-semibold capitalize">
                {membership.status.replaceAll("_", " ")}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted">
              Member since{" "}
              {new Date(membership.created_at).toLocaleDateString("en-NG", { dateStyle: "long" })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/portal/id-card" className="button-primary">
              View ID card
            </Link>
            <Link href="/api/cards/download" className="button-quiet">
              Download PDF
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-4 border border-line bg-surface p-5">
          <p>
            Your account does not have an active membership record yet. Contact member support for
            help.
          </p>
          <Link href="/portal/support" className="button-quiet mt-4">
            Contact support
          </Link>
        </section>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.3fr_.7fr]">
        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Upcoming events</h2>
            <Link
              className="text-sm font-semibold text-brand-forest underline"
              href="/portal/events"
            >
              Browse all
            </Link>
          </div>
          {(upcoming ?? []).length ? (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {upcoming?.map((event) => (
                <li key={event.id} className="py-4">
                  <Link href={`/events/${event.slug}`} className="font-semibold text-ink underline">
                    {event.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {new Date(event.start_date).toLocaleString("en-NG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    · {event.venue} · {event.state_code}
                  </p>
                  <p className="mt-1 text-xs text-brand-forest">
                    {registered.has(event.id) ? "You’re registered" : "Registration available"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 border border-line p-4 text-sm text-muted">
              There are no published upcoming events right now.
            </p>
          )}
        </section>
        <aside className="border border-line bg-surface p-5">
          <h2 className="text-lg font-bold">Your account</h2>
          <ul className="mt-3 space-y-3 text-sm">
            <li>
              <Link className="font-semibold text-brand-forest underline" href="/portal/profile">
                Review your profile
              </Link>
            </li>
            <li>
              <Link
                className="font-semibold text-brand-forest underline"
                href="/portal/preferences"
              >
                Set communication choices
              </Link>
            </li>
            <li>
              <Link className="font-semibold text-brand-forest underline" href="/portal/privacy">
                View or submit a privacy request
              </Link>
            </li>
          </ul>
          <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
            {openSupport ?? 0} support request{openSupport === 1 ? "" : "s"} awaiting a response.
          </p>
        </aside>
      </div>
    </div>
  );
}
