import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPrivateValue } from "@/lib/security/hmac";

function response(body: object, status = 200) {
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
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return response(
        { isValid: false, status: "invalid", message: "No active membership card was found." },
        400,
      );
    }
    const token =
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      typeof (body as { token?: unknown }).token === "string"
        ? (body as { token: string }).token.trim().toLowerCase()
        : "";
    const admin = createAdminClient();
    const ipAddress = request.headers.get("x-real-ip") ?? "unknown-client";
    const limited = await admin.rpc("consume_registration_rate_limit", {
      p_key_hashes: [hashPrivateValue(`card-verification:${ipAddress}`)],
      p_limit: 120,
      p_window_seconds: 3600,
    });
    if (limited.error)
      return response(
        {
          isValid: false,
          status: "unavailable",
          message: "Verification is temporarily unavailable.",
        },
        503,
      );
    if (limited.data !== true)
      return response(
        {
          isValid: false,
          status: "unavailable",
          message: "Too many verification attempts. Try again later.",
        },
        429,
      );
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return response(
        { isValid: false, status: "invalid", message: "No active membership card was found." },
        400,
      );
    }

    const cardResult = await admin
      .from("id_cards")
      .select("id,membership_id,status,issued_at,expires_at")
      .eq("verification_token", token)
      .maybeSingle();
    if (cardResult.error)
      return response(
        {
          isValid: false,
          status: "unavailable",
          message: "Verification is temporarily unavailable.",
        },
        503,
      );
    const card = cardResult.data;
    if (!card || card.status !== "active" || new Date(card.expires_at).getTime() <= Date.now()) {
      return response({
        isValid: false,
        status: "invalid",
        message: "No active membership card was found.",
      });
    }

    const membershipResult = await admin
      .from("memberships")
      .select("membership_number,status")
      .eq("id", card.membership_id)
      .maybeSingle();
    if (membershipResult.error)
      return response(
        {
          isValid: false,
          status: "unavailable",
          message: "Verification is temporarily unavailable.",
        },
        503,
      );
    const membership = membershipResult.data;
    if (!membership || membership.status !== "active") {
      return response({
        isValid: false,
        status: "invalid",
        message: "No active membership card was found.",
      });
    }

    const parts = membership.membership_number.split("-");
    const membershipMasked =
      parts.length >= 4
        ? `${parts.slice(0, -1).join("-")}-••••${parts.at(-1)?.slice(-2) ?? ""}`
        : "Membership record found";
    return response({
      isValid: true,
      status: "active",
      membershipMasked,
      issueYear: new Date(card.issued_at).getUTCFullYear(),
      expiresAt: card.expires_at,
      verifiedAt: new Date().toISOString(),
      message: "This card is currently active.",
    });
  } catch {
    return response(
      {
        isValid: false,
        status: "unavailable",
        message: "Verification is temporarily unavailable.",
      },
      503,
    );
  }
}
