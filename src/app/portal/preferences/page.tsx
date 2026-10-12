import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PreferencesForm } from "@/components/portal/PortalActions";

export const instant = false;

export default async function MemberPreferencesPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("email_announcements,email_event_reminders,sms_announcements,sms_event_reminders")
    .eq("profile_id", user.id)
    .maybeSingle();
  return (
    <section>
      <h2 className="text-xl font-bold">Communication preferences</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Choose the optional updates you would like to receive. Transactional account and security
        messages may still be sent when needed to operate your membership.
      </p>
      {error ? (
        <p className="mt-5 text-sm text-red-800" role="alert">
          Preferences could not be loaded. Refresh to try again.
        </p>
      ) : (
        <div className="mt-5 max-w-xl border border-line bg-surface p-5">
          <PreferencesForm initial={data} />
        </div>
      )}
    </section>
  );
}
