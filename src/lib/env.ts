import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);
const optionalSecret = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);
const optionalText = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);
const appEnvironment = z.preprocess(
  (value) => (value === "preview" ? "staging" : value),
  z.enum(["development", "staging", "production"]).default("development"),
);

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    APP_ENV: appEnvironment,
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_SITE_URL: optionalUrl,
    NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalSecret,
    SUPABASE_SERVICE_ROLE_KEY: optionalSecret,
    REGISTRATION_ENABLED: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    REGISTRATION_CONSENT_VERSION: optionalText,
    REGISTRATION_CONSENT_NOTICE: optionalText,
    REGISTRATION_RATE_LIMIT_SECRET: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().min(32).optional(),
    ),
    CRON_SECRET: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().min(32).optional(),
    ),
    NOTIFICATION_EMAIL_WEBHOOK_URL: optionalUrl,
    NOTIFICATION_SMS_WEBHOOK_URL: optionalUrl,
    NOTIFICATION_PROVIDER_SECRET: optionalSecret,
  })
  .superRefine((values, context) => {
    if (
      Boolean(values.NEXT_PUBLIC_SUPABASE_URL) !== Boolean(values.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Set both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or leave both unset.",
      });
    }
    if (values.REGISTRATION_ENABLED) {
      if (!values.NEXT_PUBLIC_SUPABASE_URL || !values.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        context.addIssue({
          code: "custom",
          message: "Registration requires Supabase URL and anon key.",
        });
      }
      if (!values.SUPABASE_SERVICE_ROLE_KEY) {
        context.addIssue({
          code: "custom",
          message: "Registration requires a server-only Supabase service role key.",
        });
      }
      if (!values.REGISTRATION_CONSENT_VERSION || !values.REGISTRATION_CONSENT_NOTICE) {
        context.addIssue({
          code: "custom",
          message: "Registration requires an approved privacy notice and version.",
        });
      }
      if (!values.REGISTRATION_RATE_LIMIT_SECRET) {
        context.addIssue({
          code: "custom",
          message: "Registration requires a 32-character rate-limit secret.",
        });
      }
      if (!values.CRON_SECRET) {
        context.addIssue({
          code: "custom",
          message: "Registration requires a secret for scheduled intent cleanup.",
        });
      }
    }
  });

/** Validated once at module load; provider configuration stays optional until enabled for a deployment. */
export const env = envSchema.parse(process.env);
export const hasSupabaseConfig = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
export const siteUrl =
  env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  (env.APP_ENV === "production" ? "https://a4astudentwing.vercel.app" : env.NEXT_PUBLIC_APP_URL);
