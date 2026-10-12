import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EventRegistrationAction } from "@/components/portal/PortalActions";

export const instant = false;

export default async function MemberEventsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase
    .from("memberships")
    .select("id,status")
    .eq("profile_id", user.id)
    .maybeSingle();
  const { data: events, error } = await supabase
    .from("events")
    .select("id,title,slug,description,venue,state_code,start_date,end_date,capacity,is_virtual")
    .eq("is_published", true)
    .gt("end_date", new Date().toISOString())
    .order("start_date")
    .limit(50);
  const { data: registrations } =
    membership?.status === "active"
      ? await supabase
          .from("event_registrations")
          .select("event_id")
          .eq("membership_id", membership.id)
      : { data: [] };
  const registered = new Set((registrations ?? []).map((item) => item.event_id));
  return (
    <section>
      <h2 className="text-xl font-bold">Events and activities</h2>
      <p className="mt-2 text-sm text-muted">
        Browse published events and manage your own registration.
      </p>
      {error ? (
        <p className="mt-5 border border-red-300 bg-red-50 p-4 text-sm text-red-900" role="alert">
          Events could not be loaded right now.
        </p>
      ) : !events?.length ? (
        <p className="mt-5 border border-line p-5 text-sm text-muted">
          No published upcoming events are available.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {events.map((event) => (
            <li key={event.id} className="py-5">
              <h3 className="font-bold">{event.title}</h3>
              <p className="mt-1 text-sm text-muted">
                {new Date(event.start_date).toLocaleString("en-NG", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                – {new Date(event.end_date).toLocaleTimeString("en-NG", { timeStyle: "short" })} ·{" "}
                {event.is_virtual ? "Online" : `${event.venue}, ${event.state_code}`}
              </p>
              <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6">
                {event.description}
              </p>
              {membership?.status === "active" ? (
                <EventRegistrationAction eventId={event.id} registered={registered.has(event.id)} />
              ) : (
                <p className="mt-3 text-sm text-muted">
                  Active membership is required to register.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
