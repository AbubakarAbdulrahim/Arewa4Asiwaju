import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasTrustedOrigin } from "@/lib/security/same-origin";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request))
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Sign-out is temporarily unavailable." }, { status: 503 });
  }
}
