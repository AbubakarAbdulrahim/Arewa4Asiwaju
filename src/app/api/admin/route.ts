import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasTrustedOrigin } from "@/lib/security/same-origin";
import { canAdminister } from "@/lib/admin/server";
import type { UserRole } from "@/types/database";

const uuid = z.string().uuid();
const optionalUuid = uuid.nullable().optional();
const unitSchema = z.object({
  action: z.literal("unit.save"),
  id: optionalUuid,
  name: z.string().trim().min(2).max(160),
  code: z.string().trim().min(2).max(50),
  type: z.enum(["national", "zone", "state", "lga", "ward", "campus_chapter", "support_group"]),
  parentId: optionalUuid,
  stateCode: z.string().trim().max(10).nullable().optional(),
  lgaName: z.string().trim().max(100).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
});
const eventSchema = z.object({
  action: z.literal("event.save"),
  id: optionalUuid,
  title: z.string().trim().min(3).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(255),
  description: z.string().trim().min(10).max(12000),
  category: z.enum(["rally", "symposium", "training", "outreach", "meeting"]),
  venue: z.string().trim().min(2).max(300),
  stateCode: z.string().trim().min(2).max(10),
  lgaName: z.string().trim().max(100).nullable().optional(),
  isVirtual: z.boolean(),
  virtualLink: z.string().url().max(1000).nullable().optional(),
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }),
  capacity: z.number().int().positive().nullable().optional(),
  isPublished: z.boolean(),
  orgUnitId: optionalUuid,
});
const contentSchema = z.object({
  action: z.literal("content.save"),
  id: optionalUuid,
  title: z.string().trim().min(3).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(255),
  excerpt: z.string().trim().min(5).max(500),
  content: z.string().trim().min(10).max(30000),
  category: z.enum(["announcement", "press_release", "campaign", "editorial"]),
  coverImage: z.string().url().max(1000).nullable().optional(),
  isPublished: z.boolean(),
  authorName: z.string().trim().min(2).max(150),
});
const supportSchema = z.object({
  action: z.literal("support.update"),
  id: uuid,
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  response: z.string().max(4000).default(""),
});
const attendanceSchema = z.object({
  action: z.literal("attendance.update"),
  id: uuid,
  attended: z.boolean(),
});
const roleSchema = z.object({
  action: z.literal("role.assign"),
  userId: uuid,
  role: z.enum([
    "event_manager",
    "chapter_coordinator",
    "lga_coordinator",
    "state_coordinator",
    "content_editor",
    "membership_officer",
    "data_protection_officer",
    "auditor",
  ]),
  orgUnitId: optionalUuid,
});
const revokeSchema = z.object({ action: z.literal("role.revoke"), assignmentId: uuid });
const leadershipSchema = z.object({
  action: z.literal("leadership.save"),
  id: optionalUuid,
  fullName: z.string().trim().min(2).max(160),
  title: z.string().trim().min(2).max(160),
  biography: z.string().max(4000).default(""),
  photoUrl: z.string().url().max(1000).nullable().optional(),
  orgUnitId: optionalUuid,
  displayOrder: z.number().int().min(0).max(10000),
  isPublished: z.boolean(),
});
const mediaSchema = z.object({
  action: z.literal("media.save"),
  id: optionalUuid,
  title: z.string().trim().min(2).max(160),
  altText: z.string().trim().min(3).max(300),
  description: z.string().max(1500).default(""),
  assetUrl: z.string().url().startsWith("https://").max(1000),
  assetType: z.enum(["image", "video", "document"]),
  isPublished: z.boolean(),
});
const privacySchema = z.object({
  action: z.literal("privacy.update"),
  id: uuid,
  status: z.enum(["processing", "completed", "rejected"]),
});
const actionSchema = z.discriminatedUnion("action", [
  unitSchema,
  eventSchema,
  contentSchema,
  supportSchema,
  attendanceSchema,
  roleSchema,
  revokeSchema,
  leadershipSchema,
  mediaSchema,
  privacySchema,
]);

const neededRoles: Record<z.infer<typeof actionSchema>["action"], UserRole[]> = {
  "unit.save": ["super_admin"],
  "event.save": ["super_admin", "event_manager", "state_coordinator"],
  "content.save": ["super_admin", "content_editor"],
  "support.update": ["super_admin", "membership_officer"],
  "attendance.update": [
    "super_admin",
    "event_manager",
    "state_coordinator",
    "lga_coordinator",
    "chapter_coordinator",
  ],
  "role.assign": ["super_admin"],
  "role.revoke": ["super_admin"],
  "leadership.save": ["super_admin", "content_editor"],
  "media.save": ["super_admin", "content_editor"],
  "privacy.update": ["super_admin", "data_protection_officer"],
};

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request))
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Check the submitted fields." }, { status: 400 });
  const { data: assignments } = await supabase
    .from("role_assignments")
    .select("role")
    .eq("user_id", auth.user.id);
  const roles = (assignments ?? []).map((item) => item.role as UserRole);
  if (!canAdminister(roles, neededRoles[parsed.data.action]))
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  let result: { data: unknown; error: { message: string } | null };
  const input = parsed.data;
  switch (input.action) {
    case "unit.save":
      result = await supabase.rpc("admin_save_org_unit", {
        p_id: input.id ?? null,
        p_name: input.name,
        p_code: input.code,
        p_type: input.type,
        p_parent_id: input.parentId ?? null,
        p_state_code: input.stateCode ?? null,
        p_lga_name: input.lgaName ?? null,
        p_description: input.description ?? null,
      });
      break;
    case "event.save":
      result = await supabase.rpc("admin_save_event", {
        p_id: input.id ?? null,
        p_title: input.title,
        p_slug: input.slug,
        p_description: input.description,
        p_category: input.category,
        p_venue: input.venue,
        p_state_code: input.stateCode,
        p_lga_name: input.lgaName ?? null,
        p_is_virtual: input.isVirtual,
        p_virtual_link: input.virtualLink ?? null,
        p_start_date: input.startDate,
        p_end_date: input.endDate,
        p_capacity: input.capacity ?? null,
        p_is_published: input.isPublished,
        p_org_unit_id: input.orgUnitId ?? null,
      });
      break;
    case "content.save":
      result = await supabase.rpc("admin_save_announcement", {
        p_id: input.id ?? null,
        p_title: input.title,
        p_slug: input.slug,
        p_excerpt: input.excerpt,
        p_content: input.content,
        p_category: input.category,
        p_cover_image: input.coverImage ?? null,
        p_is_published: input.isPublished,
        p_author_name: input.authorName,
      });
      break;
    case "support.update":
      result = await supabase.rpc("admin_update_support_request", {
        p_request_id: input.id,
        p_status: input.status,
        p_response: input.response,
      });
      break;
    case "attendance.update":
      result = await supabase.rpc("admin_set_attendance", {
        p_registration_id: input.id,
        p_attended: input.attended,
      });
      break;
    case "role.assign":
      result = await supabase.rpc("assign_user_role", {
        p_user_id: input.userId,
        p_role: input.role,
        p_org_unit_id: input.orgUnitId ?? null,
      });
      break;
    case "role.revoke":
      result = await supabase.rpc("revoke_user_role", { p_assignment_id: input.assignmentId });
      break;
    case "leadership.save":
      result = await supabase.rpc("admin_save_leadership", {
        p_id: input.id ?? null,
        p_full_name: input.fullName,
        p_title: input.title,
        p_biography: input.biography,
        p_photo_url: input.photoUrl ?? null,
        p_org_unit_id: input.orgUnitId ?? null,
        p_display_order: input.displayOrder,
        p_is_published: input.isPublished,
      });
      break;
    case "media.save":
      result = await supabase.rpc("admin_save_media", {
        p_id: input.id ?? null,
        p_title: input.title,
        p_alt_text: input.altText,
        p_description: input.description,
        p_asset_url: input.assetUrl,
        p_asset_type: input.assetType,
        p_is_published: input.isPublished,
      });
      break;
    case "privacy.update":
      result = await supabase.rpc("admin_update_data_request", {
        p_id: input.id,
        p_status: input.status,
      });
      break;
  }
  if (result.error)
    return NextResponse.json(
      { error: "The change could not be saved. Check the role scope and retry." },
      { status: 409 },
    );
  return NextResponse.json(
    { ok: true, data: result.data },
    { headers: { "Cache-Control": "no-store" } },
  );
}
