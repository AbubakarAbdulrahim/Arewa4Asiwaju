import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { buildRegistrationNotice } from "@/lib/registration-notice";

export async function GET() {
  if (
    !env.REGISTRATION_ENABLED ||
    !env.REGISTRATION_CONSENT_NOTICE ||
    !env.REGISTRATION_CONSENT_VERSION
  ) {
    return NextResponse.json({ enabled: false }, { headers: { "Cache-Control": "no-store" } });
  }
  const notice = buildRegistrationNotice(env.REGISTRATION_CONSENT_NOTICE);
  return NextResponse.json(
    {
      enabled: true,
      notice,
      version: env.REGISTRATION_CONSENT_VERSION,
      sha256: createHash("sha256").update(notice, "utf8").digest("hex"),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
