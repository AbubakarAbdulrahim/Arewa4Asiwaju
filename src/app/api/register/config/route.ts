import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  if (
    !env.REGISTRATION_ENABLED ||
    !env.REGISTRATION_CONSENT_NOTICE ||
    !env.REGISTRATION_CONSENT_VERSION
  ) {
    return NextResponse.json({ enabled: false }, { headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json(
    {
      enabled: true,
      notice: env.REGISTRATION_CONSENT_NOTICE,
      version: env.REGISTRATION_CONSENT_VERSION,
      sha256: createHash("sha256").update(env.REGISTRATION_CONSENT_NOTICE, "utf8").digest("hex"),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
