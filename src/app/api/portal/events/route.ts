import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { eventActionSchema } from "@/lib/validation/portal-schemas";
import { hasTrustedOrigin } from "@/lib/security/same-origin";

export async function POST(request: NextRequest) {
  return eventAction(request, "register_member_for_event");
}
export async function DELETE(request: NextRequest) {
  return eventAction(request, "cancel_member_event_registration");
}
async function eventAction(
  request: NextRequest,
  rpc: "register_member_for_event" | "cancel_member_event_registration",
) {
  if (!hasTrustedOrigin(request))
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Sign in to manage event registration." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Choose a valid event." }, { status: 400 });
  }
  const parsed = eventActionSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Choose a valid event." }, { status: 400 });
  const { data, error } = await supabase.rpc(rpc, { p_event_id: parsed.data.eventId });
  if (error)
    return NextResponse.json(
      { error: "This event could not be updated. Check your membership and try again." },
      { status: 409 },
    );
  return NextResponse.json({ ok: true, data }, { headers: { "Cache-Control": "no-store" } });
}
