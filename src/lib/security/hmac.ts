import "server-only";
import { createHmac } from "node:crypto";
import { env } from "@/lib/env";

export function hashPrivateValue(value: string) {
  if (!env.REGISTRATION_RATE_LIMIT_SECRET) throw new Error("Private hashing is not configured.");
  return createHmac("sha256", env.REGISTRATION_RATE_LIMIT_SECRET).update(value).digest("hex");
}
