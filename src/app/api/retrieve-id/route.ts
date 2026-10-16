import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPrivateValue } from "@/lib/security/hmac";
import { hasTrustedOrigin } from "@/lib/security/same-origin";

const schema = z.object({
  identifier: z.string().trim().min(4).max(254),
  password: z.string().min(8).max(128),
});
const membershipNumberPattern =
  /^A4A-[0-9]{4}-[A-Z0-9]{2,10}-(?:[A-Z0-9]{3,5}[0-9]{3,}|[0-9]{6,})$/i;

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
    return respond({ error: "Enter your login details." }, 400);
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success)
    return respond({ error: "Enter your email or membership number and password." }, 400);

  const identifier = parsed.data.identifier.trim();
  const normalized = identifier.toLowerCase();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  const isMembershipNumber = membershipNumberPattern.test(identifier);
  if (!isEmail && !isMembershipNumber) {
    return respond({ error: "We couldn't sign you in. Check your details and try again." }, 401);
  }

  try {
    const admin = createAdminClient();
    const ipAddress = request.headers.get("x-real-ip")?.trim() || "unknown-client";
    const limit = await admin.rpc("consume_registration_rate_limit", {
      p_key_hashes: [
        hashPrivateValue(`member-login-ip:${ipAddress}`),
        hashPrivateValue(`member-login-identifier:${normalized}`),
      ],
      p_limit: 8,
      p_window_seconds: 900,
    });
    if (limit.error) return respond({ error: "Member access is temporarily unavailable." }, 503);
    if (!limit.data) return respond({ error: "Too many attempts. Try again in 15 minutes." }, 429);

    let profileQuery = admin.from("profiles").select("id,email");
    if (isEmail) profileQuery = profileQuery.eq("email", normalized);
    else {
      const membership = await admin
        .from("memberships")
        .select("profile_id")
        .eq("membership_number", identifier.toUpperCase())
        .eq("status", "active")
        .maybeSingle();
      if (membership.error || !membership.data?.profile_id) {
        return respond(
          { error: "We couldn't sign you in. Check your details and try again." },
          401,
        );
      }
      profileQuery = profileQuery.eq("id", membership.data.profile_id);
    }
    const profile = await profileQuery.maybeSingle();
    if (profile.error || !profile.data?.id || !profile.data.email) {
      return respond({ error: "We couldn't sign you in. Check your details and try again." }, 401);
    }
    const membership = await admin
      .from("memberships")
      .select("id")
      .eq("profile_id", profile.data.id)
      .eq("status", "active")
      .maybeSingle();
    if (membership.error || !membership.data) {
      return respond({ error: "We couldn't sign you in. Check your details and try again." }, 401);
    }

    const response = respond({ ok: true });
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookies) =>
            cookies.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            ),
        },
      },
    );
    const { data, error } = await supabase.auth.signInWithPassword({
      email: profile.data.email,
      password: parsed.data.password,
    });
    if (error || data.user?.id !== profile.data.id) {
      return respond({ error: "We couldn't sign you in. Check your details and try again." }, 401);
    }
    return response;
  } catch {
    return respond({ error: "Member access is temporarily unavailable." }, 503);
  }
}
