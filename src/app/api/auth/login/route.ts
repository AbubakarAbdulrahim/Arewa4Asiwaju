import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { hasTrustedOrigin } from "@/lib/security/same-origin";

const schema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),
  next: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request))
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Member sign-in is temporarily unavailable." },
      { status: 503 },
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const response = NextResponse.json(
    { ok: true, message: "If this address belongs to an account, a sign-in link will be sent." },
    {
      status: 202,
      headers: { "Cache-Control": "no-store" },
    },
  );
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    },
  );
  const next =
    parsed.data.next &&
    !parsed.data.next.includes("\\") &&
    (parsed.data.next === "/portal" || parsed.data.next.startsWith("/portal/"))
      ? parsed.data.next
      : "/portal";
  const redirectTo = new URL(
    `/auth/callback?next=${encodeURIComponent(next)}`,
    env.NEXT_PUBLIC_APP_URL,
  ).toString();
  try {
    await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
    });
  } catch {
    // Keep unknown-account and provider errors indistinguishable to the caller.
  }
  return response;
}
