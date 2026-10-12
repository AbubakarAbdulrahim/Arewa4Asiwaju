import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PrivacyRequestForm } from "@/components/portal/PortalActions";

export const instant = false;

const labels: Record<string, string> = {
  access: "Access my data",
  rectification: "Correct my data",
  erasure: "Request erasure",
  restriction: "Restrict processing",
};

export default async function MemberPrivacyPage() {
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
        .from("data_requests")
        .select("id,request_type,status,details,created_at,completed_at")
        .eq("membership_id", membership.id)
        .order("created_at", { ascending: false })
        .limit(30)
    : { data: [], error: null };
  return (
    <section>
      <h2 className="text-xl font-bold">Privacy and account requests</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
        Use this form to request access, correction, restriction, or erasure. The data protection
        team will review the request and update its status here. Erasure requests may require review
        to meet legal retention obligations.
      </p>
      <div className="mt-6 max-w-2xl border border-line bg-surface p-5">
        <h3 className="mb-4 font-bold">Submit a request</h3>
        {membership ? (
          <PrivacyRequestForm />
        ) : (
          <p className="text-sm">A membership record is required to submit an account request.</p>
        )}
      </div>
      <h3 className="mt-8 text-lg font-bold">Request history</h3>
      {error ? (
        <p className="mt-4 text-sm text-red-800" role="alert">
          Privacy request history is unavailable.
        </p>
      ) : !requests?.length ? (
        <p className="mt-4 text-sm text-muted">You have not submitted a privacy request.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {requests.map((item) => (
            <li key={item.id} className="py-4">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-semibold">
                  {labels[item.request_type] ?? item.request_type}
                </span>
                <span className="text-xs font-bold uppercase text-muted">{item.status}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Submitted{" "}
                {new Date(item.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}
              </p>
              {item.details && <p className="mt-2 text-sm">{item.details}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
