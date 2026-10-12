import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notificationPreferencesSchema } from "@/lib/validation/portal-schemas";
import { hasTrustedOrigin } from "@/lib/security/same-origin";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to manage preferences." }, { status: 401 });
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("email_announcements,email_event_reminders,sms_announcements,sms_event_reminders")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Preferences are unavailable." }, { status: 503 });
  return NextResponse.json(
    {
      emailAnnouncements: data?.email_announcements ?? false,
      emailEventReminders: data?.email_event_reminders ?? false,
      smsAnnouncements: data?.sms_announcements ?? false,
      smsEventReminders: data?.sms_event_reminders ?? false,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function PUT(request: NextRequest) {
  if (!hasTrustedOrigin(request))
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to manage preferences." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Check your preferences." }, { status: 400 });
  }
  const parsed = notificationPreferencesSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Check your preferences." }, { status: 400 });
  const preferences = parsed.data;
  const { error } = await supabase.from("notification_preferences").upsert(
    {
      profile_id: user.id,
      email_announcements: preferences.emailAnnouncements,
      email_event_reminders: preferences.emailEventReminders,
      sms_announcements: preferences.smsAnnouncements,
      sms_event_reminders: preferences.smsEventReminders,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile_id" },
  );
  if (error)
    return NextResponse.json({ error: "Preferences could not be saved." }, { status: 503 });
  return NextResponse.json(
    { ok: true, message: "Preferences saved." },
    { headers: { "Cache-Control": "no-store" } },
  );
}
