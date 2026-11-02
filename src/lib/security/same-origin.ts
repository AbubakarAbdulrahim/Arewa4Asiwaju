import type { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { isTrustedOrigin } from "./origin-policy";

export function hasTrustedOrigin(request: NextRequest): boolean {
  const configuredOrigins = [
    env.NEXT_PUBLIC_APP_URL,
    env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter((origin): origin is string => Boolean(origin));

  return isTrustedOrigin(request.headers.get("origin"), request.nextUrl.origin, configuredOrigins);
}
