import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasTrustedOrigin } from "@/lib/security/same-origin";
import { canAdminister } from "@/lib/admin/server";
import type { UserRole } from "@/types/database";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data: assignments } = await supabase
    .from("role_assignments")
    .select("role")
    .eq("user_id", auth.user.id);
  const roles = (assignments ?? []).map((item) => item.role as UserRole);
  if (
    !canAdminister(roles, [
      "super_admin",
      "membership_officer",
      "state_coordinator",
      "lga_coordinator",
      "chapter_coordinator",
    ])
  ) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }
  const params = request.nextUrl.searchParams;
  const page = Math.max(Number(params.get("page") || 1) || 1, 1);
  const pageSize = Math.min(Math.max(Number(params.get("pageSize") || 25) || 25, 1), 100);
  const status = params.get("status");
  const validStatus = [
    "pending_verification",
    "active",
    "suspended",
    "flagged",
    "revoked",
  ].includes(status || "")
    ? status
    : null;
  const query = (params.get("q") || "").trim().slice(0, 120) || null;
  const stateCode = (params.get("state") || "").trim().slice(0, 10) || null;
  const orgUnitId = (params.get("unit") || "").trim() || null;
  const { data, error } = await supabase.rpc("admin_search_members", {
    p_query: query,
    p_status: validStatus,
    p_state_code: stateCode,
    p_org_unit_id: orgUnitId,
    p_page: page,
    p_page_size: pageSize,
  });
  if (error)
    return NextResponse.json(
      {
        error:
          "Member data is unavailable. Confirm that the Phase 7 migration is applied and this account has the required scope.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  const result = Array.isArray(data) ? data[0] : null;
  return NextResponse.json(
    { total: result?.total_count ?? 0, members: result?.members ?? [], page, pageSize },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function PATCH(request: NextRequest) {
  if (!hasTrustedOrigin(request))
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data: assignments } = await supabase
    .from("role_assignments")
    .select("role")
    .eq("user_id", auth.user.id);
  const roles = (assignments ?? []).map((item) => item.role as UserRole);
  if (!canAdminister(roles, ["super_admin", "membership_officer"]))
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body || typeof body !== "object")
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { membershipId, status } = body as Record<string, unknown>;
  const allowedStatuses = ["pending_verification", "active", "suspended", "flagged", "revoked"];
  if (
    typeof membershipId !== "string" ||
    !/^[0-9a-f-]{36}$/i.test(membershipId) ||
    typeof status !== "string" ||
    !allowedStatuses.includes(status)
  ) {
    return NextResponse.json({ error: "Check the membership and status." }, { status: 400 });
  }
  const { data, error } = await supabase.rpc("admin_set_membership_status", {
    p_membership_id: membershipId,
    p_status: status as "active",
  });
  if (error || data !== true)
    return NextResponse.json(
      { error: "Status was not changed. Check your permission and retry." },
      { status: 409 },
    );
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
