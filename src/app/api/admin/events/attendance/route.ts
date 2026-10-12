import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { canAdminister } from "@/lib/admin/server";
import type { UserRole } from "@/types/database";

const eventIdSchema = z.string().uuid();
export async function GET(request: NextRequest) {
  const eventId = eventIdSchema.safeParse(request.nextUrl.searchParams.get("eventId"));
  if (!eventId.success)
    return NextResponse.json({ error: "Choose a valid event." }, { status: 400 });
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
      "event_manager",
      "state_coordinator",
      "lga_coordinator",
      "chapter_coordinator",
    ])
  )
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  const page = Math.min(
    Math.max(Number(request.nextUrl.searchParams.get("page") || "1") || 1, 1),
    10000,
  );
  const { data, error } = await supabase.rpc("admin_list_event_attendance", {
    p_event_id: eventId.data,
    p_page: page,
    p_page_size: 50,
  });
  if (error)
    return NextResponse.json(
      { error: "Attendance is unavailable or outside your assigned scope." },
      { status: 403, headers: { "Cache-Control": "private, no-store" } },
    );
  const result = Array.isArray(data) ? data[0] : null;
  return NextResponse.json(
    { registrations: result?.items ?? [], total: Number(result?.total_count ?? 0), page },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
