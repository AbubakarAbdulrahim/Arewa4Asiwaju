import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupportRequestForm } from "@/components/portal/PortalActions";

export const instant = false;

export default async function MemberSupportPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase
    .from("memberships")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  const { data: requests, error } = membership
    ? await supabase
        .from("support_requests")
        .select("id,subject,category,status,response,responded_at,created_at")
        .eq("membership_id", membership.id)
        .order("created_at", { ascending: false })
        .limit(30)
    : { data: [], error: null };
  return (
    <section>
      <h2 className="text-xl font-bold">Member support</h2>
      <p className="mt-2 text-sm text-muted">
        Send a request and follow its status here. Replies are visible only to you and authorised
        support staff.
      </p>
      <div className="mt-6 max-w-2xl border border-line bg-surface p-5">
        <h3 className="mb-4 font-bold">New request</h3>
        {membership ? (
          <SupportRequestForm />
        ) : (
          <p className="text-sm">A membership record is required to contact member support.</p>
        )}
      </div>
      <h3 className="mt-8 text-lg font-bold">Your requests</h3>
      {error ? (
        <p className="mt-4 text-sm text-red-800" role="alert">
          Support history is unavailable.
        </p>
      ) : !requests?.length ? (
        <p className="mt-4 text-sm text-muted">You have not submitted a support request.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {requests.map((item) => (
            <li key={item.id} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-semibold">{item.subject}</h4>
                <span className="text-xs font-bold uppercase text-muted">
                  {item.status.replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {item.category} ·{" "}
                {new Date(item.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}
              </p>
              {item.response && (
                <div className="mt-3 border-l-2 border-brand-forest pl-3 text-sm leading-6">
                  <p className="text-xs font-bold uppercase text-muted">Support reply</p>
                  <p className="mt-1 whitespace-pre-line">{item.response}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
