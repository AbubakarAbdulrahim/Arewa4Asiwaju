import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const expected = env.CRON_SECRET ?? "";
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  if (
    !expected ||
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();
  const [pending, completed, limits] = await Promise.all([
    admin
      .from("registration_intents")
      .delete({ count: "exact" })
      .eq("status", "pending")
      .lt("expires_at", new Date(now - 24 * 60 * 60 * 1000).toISOString()),
    admin
      .from("registration_intents")
      .delete({ count: "exact" })
      .eq("status", "completed")
      .lt("created_at", new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()),
    admin
      .from("registration_rate_limits")
      .delete({ count: "exact" })
      .lt("window_started_at", new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString()),
  ]);
  const failure = pending.error ?? completed.error ?? limits.error;
  if (failure) return NextResponse.json({ error: "Cleanup failed." }, { status: 503 });
  return NextResponse.json({
    ok: true,
    removed: {
      expiredIntents: pending.count ?? 0,
      completedIntents: completed.count ?? 0,
      rateLimitRows: limits.count ?? 0,
    },
  });
}
