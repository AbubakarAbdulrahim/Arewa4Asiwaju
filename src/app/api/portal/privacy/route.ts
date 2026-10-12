import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { dataRequestSchema } from "@/lib/validation/portal-schemas";
import { hasTrustedOrigin } from "@/lib/security/same-origin";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request))
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Sign in to submit a privacy request." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Choose a valid request type." }, { status: 400 });
  }
  const parsed = dataRequestSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Choose a valid request type." }, { status: 400 });
  const { data, error } = await supabase.rpc("submit_member_data_request", {
    p_request_type: parsed.data.requestType,
    p_details: parsed.data.details ?? null,
  });
  if (error)
    return NextResponse.json(
      { error: "Request could not be submitted. An open request of this type may already exist." },
      { status: 409 },
    );
  return NextResponse.json(
    { ok: true, id: data, message: "Your privacy request has been submitted for review." },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
