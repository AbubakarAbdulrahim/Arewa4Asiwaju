import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { processNotificationBatch, processNotificationRetention } from "@/lib/notifications/worker";

function validSecret(request: NextRequest) {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const expected = env.CRON_SECRET ?? "";
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  return Boolean(
    expected &&
    suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer),
  );
}

export async function GET(request: NextRequest) {
  if (!validSecret(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const [batch, removed] = await Promise.all([
      processNotificationBatch(25),
      processNotificationRetention(90),
    ]);
    if (batch.statusUpdateFailures > 0) {
      return NextResponse.json(
        { error: "Some notification outcomes could not be recorded.", batch },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: true, batch, removed });
  } catch {
    return NextResponse.json({ error: "Notification processing failed." }, { status: 503 });
  }
}
