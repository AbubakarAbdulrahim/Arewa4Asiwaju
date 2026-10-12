import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { canAdminister } from "@/lib/admin/server";
import { hasTrustedOrigin } from "@/lib/security/same-origin";
import type { UserRole } from "@/types/database";

const exportSchema = z.object({
  purpose: z.string().trim().min(12).max(500),
  status: z
    .enum(["pending_verification", "active", "suspended", "flagged", "revoked"])
    .nullable()
    .optional(),
  stateCode: z.string().trim().max(10).nullable().optional(),
});

function csvCell(value: unknown) {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: "Export permission is required." }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Provide an export purpose." }, { status: 400 });
  }
  const parsed = exportSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Provide a specific purpose of at least 12 characters." },
      { status: 400 },
    );
  const { data: firstPage, error: searchError } = await supabase.rpc("admin_search_members", {
    p_query: null,
    p_status: parsed.data.status ?? null,
    p_state_code: parsed.data.stateCode ?? null,
    p_org_unit_id: null,
    p_page: 1,
    p_page_size: 100,
  });
  if (searchError)
    return NextResponse.json(
      { error: "Export data is unavailable until the admin database migration is applied." },
      { status: 503 },
    );
  const first = Array.isArray(firstPage)
    ? (firstPage[0] as { total_count: number; members: Record<string, unknown>[] })
    : null;
  const total = Math.min(Number(first?.total_count ?? 0), 5000);
  const rows = [...(first?.members ?? [])];
  for (let page = 2; rows.length < total; page += 1) {
    const { data, error } = await supabase.rpc("admin_search_members", {
      p_query: null,
      p_status: parsed.data.status ?? null,
      p_state_code: parsed.data.stateCode ?? null,
      p_org_unit_id: null,
      p_page: page,
      p_page_size: 100,
    });
    if (error)
      return NextResponse.json({ error: "Export could not be completed." }, { status: 503 });
    const pageResult = Array.isArray(data)
      ? (data[0] as { members: Record<string, unknown>[] })
      : null;
    rows.push(...(pageResult?.members ?? []));
  }
  const { error: auditError } = await supabase.rpc("admin_log_member_export", {
    p_row_count: rows.length,
    p_purpose: parsed.data.purpose,
    p_status: parsed.data.status ?? null,
    p_state_code: parsed.data.stateCode ?? null,
  });
  if (auditError)
    return NextResponse.json(
      { error: "Export could not be recorded, so no file was created." },
      { status: 503 },
    );
  const columns = [
    "membership_number",
    "full_name",
    "email",
    "phone",
    "state_code",
    "org_unit_name",
    "status",
    "created_at",
  ];
  const csv = [
    columns.map(csvCell).join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")),
  ].join("\r\n");
  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="a4a-members-export.csv"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
