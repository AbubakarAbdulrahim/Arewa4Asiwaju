import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supportRequestSchema } from "@/lib/validation/portal-schemas";
import { hasTrustedOrigin } from "@/lib/security/same-origin";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request))
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Sign in to contact member support." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Check your support request." }, { status: 400 });
  }
  const parsed = supportRequestSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Check the subject, category, and message." },
      { status: 400 },
    );
  const { data, error } = await supabase.rpc("submit_member_support_request", {
    p_subject: parsed.data.subject,
    p_message: parsed.data.message,
    p_category: parsed.data.category,
  });
  if (error)
    return NextResponse.json(
      { error: "Support request could not be submitted. Please retry." },
      { status: 503 },
    );
  return NextResponse.json(
    { ok: true, id: data, message: "Your request has been submitted." },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
