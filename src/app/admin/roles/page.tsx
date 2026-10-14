import { AdminActionForm, AdminDataTable } from "@/components/admin/AdminActionForm";
import { getAdminSession } from "@/lib/admin/server";

type MemberChoice = {
  profile_id: string;
  membership_number: string;
  full_name: string;
  org_unit_name: string | null;
};

export default async function AdminRolesPage() {
  const { supabase } = await getAdminSession();
  const [{ data: assignmentData, error }, { data: unitData }, { data: memberData }] =
    await Promise.all([
      supabase
        .from("role_assignments")
        .select("id,user_id,role,org_unit_id,state_code,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.rpc("admin_list_units"),
      supabase.rpc("admin_search_members", { p_page: 1, p_page_size: 100 }),
    ]);
  const assignments = !error
    ? ((assignmentData ?? []) as unknown as Record<string, unknown>[])
    : [];
  const units = Array.isArray(unitData) ? (unitData as Record<string, unknown>[]) : [];
  const memberEnvelope = Array.isArray(memberData)
    ? (memberData[0] as { members?: MemberChoice[] } | undefined)
    : undefined;
  const members = Array.isArray(memberEnvelope?.members) ? memberEnvelope.members : [];
  const memberById = new Map(members.map((member) => [member.profile_id, member]));
  const unitById = new Map(units.map((unit) => [String(unit.id), String(unit.name)]));
  const displayRows = assignments.map((assignment) => ({
    member_name: memberById.get(String(assignment.user_id))?.full_name ?? "Staff account",
    membership_number: memberById.get(String(assignment.user_id))?.membership_number ?? "—",
    role: String(assignment.role).replaceAll("_", " "),
    area: assignment.org_unit_id
      ? (unitById.get(String(assignment.org_unit_id)) ??
        String(assignment.state_code ?? "Assigned area"))
      : "All areas",
    created_at: assignment.created_at,
  }));

  return (
    <div>
      <p className="text-sm leading-6 text-muted">
        Give staff only the access they need. Coordinator roles must be assigned to an area; role
        changes require strong administrator sign-in and are recorded.
      </p>
      {error && (
        <p role="status" className="notice mt-4">
          Role assignments are unavailable right now.
        </p>
      )}
      {!memberData && (
        <p role="status" className="notice mt-4">
          Member choices could not be loaded, so new assignments are unavailable.
        </p>
      )}
      <section className="mt-5" aria-label="Current staff access">
        <h2 className="mb-3 text-base font-bold">Current access</h2>
        <AdminDataTable
          columns={["member_name", "membership_number", "role", "area", "created_at"]}
          rows={displayRows}
        />
      </section>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <AdminActionForm
          title="Assign access to a staff member"
          action="role.assign"
          fields={[
            {
              name: "userId",
              label: "Staff member",
              type: "select",
              required: true,
              options: members.map((member) => ({
                value: member.profile_id,
                label: `${member.full_name} · ${member.membership_number}`,
              })),
            },
            {
              name: "role",
              label: "Access level",
              type: "select",
              required: true,
              options: [
                "event_manager",
                "chapter_coordinator",
                "lga_coordinator",
                "state_coordinator",
                "content_editor",
                "membership_officer",
                "data_protection_officer",
                "auditor",
              ],
            },
            {
              name: "orgUnitId",
              label: "Assigned area (required for coordinators)",
              type: "select",
              options: units.map((unit) => ({
                value: String(unit.id),
                label: `${String(unit.name)} · ${String(unit.type).replaceAll("_", " ")}`,
              })),
            },
          ]}
        />
        <AdminActionForm
          title="Remove a staff role"
          action="role.revoke"
          fields={[
            {
              name: "assignmentId",
              label: "Role to remove",
              type: "select",
              required: true,
              options: assignments.map((assignment) => ({
                value: String(assignment.id),
                label: `${memberById.get(String(assignment.user_id))?.full_name ?? "Staff account"} · ${String(assignment.role).replaceAll("_", " ")}`,
              })),
            },
          ]}
        />
      </div>
    </div>
  );
}
