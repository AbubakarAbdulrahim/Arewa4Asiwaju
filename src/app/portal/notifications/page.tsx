import { MemberNotifications } from "@/components/portal/MemberNotifications";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function MemberNotificationsPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("in_app_notifications")
    .select("id,title,body,read_at,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <section>
      <h2 className="text-xl font-bold">Notifications</h2>
      <p className="mt-2 text-sm text-muted">Private updates for your account.</p>
      {error ? (
        <p className="notice mt-5" role="alert">
          Notifications are temporarily unavailable.
        </p>
      ) : (
        <MemberNotifications initial={data ?? []} />
      )}
    </section>
  );
}
