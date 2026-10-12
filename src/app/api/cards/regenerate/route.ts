import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processMembershipCard } from "@/lib/cards/issue-card";
import { hashPrivateValue } from "@/lib/security/hmac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(env.NEXT_PUBLIC_APP_URL).origin)
        return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
    }
  }
  try {
    const auth = await createServerSupabaseClient();
    const { data: authData, error: authError } = await auth.auth.getUser();
    if (authError || !authData.user)
      return NextResponse.json({ error: "Sign in to replace your card." }, { status: 401 });

    const admin = createAdminClient();
    const limit = await admin.rpc("consume_registration_rate_limit", {
      p_key_hashes: [hashPrivateValue(`card-reissue:${authData.user.id}`)],
      p_limit: 2,
      p_window_seconds: 86400,
    });
    if (limit.error)
      return NextResponse.json(
        { error: "Card replacement is temporarily unavailable." },
        { status: 503 },
      );
    if (limit.data !== true)
      return NextResponse.json(
        { error: "Card replacements are limited. Try again tomorrow." },
        { status: 429 },
      );

    const membership = await admin
      .from("memberships")
      .select("id")
      .eq("profile_id", authData.user.id)
      .eq("status", "active")
      .maybeSingle();
    if (membership.error || !membership.data)
      return NextResponse.json(
        { error: "No active membership is available for card replacement." },
        { status: 404 },
      );
    const replaced = await admin.rpc("replace_membership_card", {
      p_auth_user_id: authData.user.id,
      p_membership_id: membership.data.id,
    });
    const card = Array.isArray(replaced.data) ? replaced.data[0] : replaced.data;
    if (replaced.error || !card?.id_card_id)
      return NextResponse.json(
        { error: "Card replacement could not be started." },
        { status: 409 },
      );

    const cardStatus = await processMembershipCard(
      authData.user.id,
      membership.data.id,
      card.id_card_id,
    ).catch(() => "failed" as const);
    return NextResponse.json(
      { ok: true, cardStatus },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Card replacement is temporarily unavailable." },
      { status: 503 },
    );
  }
}
