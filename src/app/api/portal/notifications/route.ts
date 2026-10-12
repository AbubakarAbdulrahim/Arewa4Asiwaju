import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasTrustedOrigin } from "@/lib/security/same-origin";

const notificationIdSchema = z.object({ id: z.string().uuid() });

export async function PATCH(request: NextRequest) {
  if (!hasTrustedOrigin(request))
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = notificationIdSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid notification." }, { status: 400 });
  const { error } = await supabase
    .from("in_app_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", parsed.data.id)
    .is("read_at", null);
  if (error)
    return NextResponse.json({ error: "Notification could not be updated." }, { status: 503 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
