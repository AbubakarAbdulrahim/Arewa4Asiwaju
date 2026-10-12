import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const intent = request.nextUrl.searchParams.get("intent");
  const requestedNext = request.nextUrl.searchParams.get("next");
  const isAdminPasswordReset = requestedNext === "/admin-login/reset";
  const failure = new URL(
    intent
      ? "/register?verification=failed"
      : isAdminPasswordReset
        ? "/admin-login/reset/error"
        : "/auth/login?verification=failed",
    request.url,
  );
  if (!code || (intent && !uuidPattern.test(intent))) return NextResponse.redirect(failure);

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user?.email_confirmed_at) return NextResponse.redirect(failure);
    const next = requestedNext;
    const safeNext =
      next &&
      !next.includes("\\") &&
      (next === "/portal" ||
        next.startsWith("/portal/") ||
        next === "/admin-login/reset")
        ? next
        : "/portal";
    const destination = intent
      ? new URL(`/register/complete?intent=${encodeURIComponent(intent)}`, request.url)
      : new URL(safeNext, request.url);
    return NextResponse.redirect(destination, {
      headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
    });
  } catch {
    return NextResponse.redirect(failure);
  }
}
