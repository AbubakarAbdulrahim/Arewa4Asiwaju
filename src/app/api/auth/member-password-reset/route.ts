import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPrivateValue } from "@/lib/security/hmac";
import { hasTrustedOrigin } from "@/lib/security/same-origin";

const schema = z.object({ identifier: z.string().trim().min(4).max(254) });
const membershipNumberPattern =
  /^A4A-[0-9]{4}-[A-Z0-9]{2,10}-(?:[A-Z0-9]{3,5}[0-9]{3,}|[0-9]{6,})$/i;
const genericMessage =
  "If the details match an active membership, password reset instructions will be sent to its registered email.";

function respond(body: object, status = 202) {
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
    return respond({ error: "Password recovery is temporarily unavailable." }, 503);
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return respond({ error: "Enter your email or membership number." }, 400);
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return respond({ error: "Enter your email or membership number." }, 400);

  try {
    const identifier = parsed.data.identifier.trim();
    const normalized = identifier.toLowerCase();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isMembershipNumber = membershipNumberPattern.test(identifier);
    if (!isEmail && !isMembershipNumber) return respond({ ok: true, message: genericMessage });

    const admin = createAdminClient();
    const ipAddress = request.headers.get("x-real-ip")?.trim() || "unknown-client";
    const limit = await admin.rpc("consume_registration_rate_limit", {
      p_key_hashes: [
        hashPrivateValue(`member-reset-ip:${ipAddress}`),
        hashPrivateValue(`member-reset-identifier:${normalized}`),
      ],
      p_limit: 5,
      p_window_seconds: 3600,
    });
    if (limit.error)
      return respond({ error: "Password recovery is temporarily unavailable." }, 503);
    if (!limit.data) return respond({ error: "Too many attempts. Try again later." }, 429);

    let profileQuery = admin.from("profiles").select("id,email");
    if (isEmail) profileQuery = profileQuery.eq("email", normalized);
    else {
      const membership = await admin
        .from("memberships")
        .select("profile_id")
        .eq("membership_number", identifier.toUpperCase())
        .eq("status", "active")
        .maybeSingle();
      if (membership.error || !membership.data?.profile_id)
        return respond({ ok: true, message: genericMessage });
      profileQuery = profileQuery.eq("id", membership.data.profile_id);
    }
    const profile = await profileQuery.maybeSingle();
    if (profile.error || !profile.data?.id || !profile.data.email)
      return respond({ ok: true, message: genericMessage });
    const membership = await admin
      .from("memberships")
      .select("id")
      .eq("profile_id", profile.data.id)
      .eq("status", "active")
      .maybeSingle();
    if (membership.error || !membership.data) return respond({ ok: true, message: genericMessage });

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const redirectTo = new URL(
      "/auth/callback?next=%2Fportal%2Freset-password",
      env.NEXT_PUBLIC_APP_URL,
    ).toString();
    await supabase.auth.resetPasswordForEmail(profile.data.email, { redirectTo });
    return respond({ ok: true, message: genericMessage });
  } catch {
    return respond({ ok: true, message: genericMessage });
  }
}
