import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPrivateValue } from "@/lib/security/hmac";
import { hasTrustedOrigin } from "@/lib/security/same-origin";

const identifierSchema = z.string().trim().min(4).max(254);
const genericResponse = {
  ok: true,
  message:
    "If these details match an active membership, a secure sign-in link will be sent to its registered email address.",
};

function respond(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, private",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return respond({ error: "Request origin is not allowed." }, 403);
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return respond({ error: "Member access is temporarily unavailable." }, 503);
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return respond({ error: "Enter one membership identifier." }, 400);
  }
  const parsed = z.object({ identifier: identifierSchema }).safeParse(payload);
  if (!parsed.success) return respond({ error: "Enter one membership identifier." }, 400);
  const identifier = parsed.data.identifier.trim();
  const normalized = identifier.toLowerCase();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  const isMemberNumber = /^A4A-[0-9]{4}-[A-Z0-9]{2,10}-[0-9]{6,}$/i.test(identifier);
  const isQrToken = /^[a-f0-9]{64}$/i.test(identifier);
  if (!isEmail && !isMemberNumber && !isQrToken) return respond(genericResponse, 202);

  try {
    const admin = createAdminClient();
    const ipAddress = request.headers.get("x-real-ip") ?? "unknown-client";
    const limit = await admin.rpc("consume_registration_rate_limit", {
      p_key_hashes: [
        hashPrivateValue(`id-retrieval-ip:${ipAddress}`),
        hashPrivateValue(`id-retrieval-identifier:${normalized}`),
      ],
      p_limit: 5,
      p_window_seconds: 3600,
    });
    if (limit.error) return respond({ error: "Member access is temporarily unavailable." }, 503);
    if (!limit.data) return respond({ error: "Too many attempts. Try again later." }, 429);

    let memberProfileId: string | null = null;
    if (isEmail) {
      const profile = await admin
        .from("profiles")
        .select("id")
        .eq("email", normalized)
        .maybeSingle();
      memberProfileId = profile.data?.id ?? null;
    } else if (isMemberNumber) {
      const membership = await admin
        .from("memberships")
        .select("profile_id")
        .eq("membership_number", identifier.toUpperCase())
        .eq("status", "active")
        .maybeSingle();
      memberProfileId = membership.data?.profile_id ?? null;
    } else {
      const card = await admin
        .from("id_cards")
        .select("membership_id")
        .eq("verification_token", normalized)
        .eq("status", "active")
        .maybeSingle();
      if (card.data?.membership_id) {
        const membership = await admin
          .from("memberships")
          .select("profile_id")
          .eq("id", card.data.membership_id)
          .eq("status", "active")
          .maybeSingle();
        memberProfileId = membership.data?.profile_id ?? null;
      }
    }
    if (!memberProfileId) return respond(genericResponse, 202);

    const member = await admin
      .from("memberships")
      .select("id")
      .eq("profile_id", memberProfileId)
      .eq("status", "active")
      .maybeSingle();
    if (!member.data) return respond(genericResponse, 202);
    const activeCard = await admin
      .from("id_cards")
      .select("id")
      .eq("membership_id", member.data.id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();
    if (!activeCard.data) return respond(genericResponse, 202);

    const profile = await admin
      .from("profiles")
      .select("email")
      .eq("id", memberProfileId)
      .maybeSingle();
    if (!profile.data?.email) return respond(genericResponse, 202);

    const auth = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const redirectTo = new URL(
      "/auth/callback?next=%2Fportal%2Fid-card",
      env.NEXT_PUBLIC_APP_URL,
    ).toString();
    await auth.auth.signInWithOtp({
      email: profile.data.email,
      options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
    });
    return respond(genericResponse, 202);
  } catch {
    // Never expose whether an email, member number, or QR token has a record.
    return respond(genericResponse, 202);
  }
}
