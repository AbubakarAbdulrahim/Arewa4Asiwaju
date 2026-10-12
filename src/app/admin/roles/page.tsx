import { AdminActionForm, AdminDataTable } from "@/components/admin/AdminActionForm";
import { getAdminSession } from "@/lib/admin/server";

export default async function AdminRolesPage() {
  const { supabase } = await getAdminSession();
  const { data, error } = await supabase
    .from("role_assignments")
    .select("id,user_id,role,org_unit_id,state_code,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const assignments = !error ? ((data ?? []) as unknown as Record<string, unknown>[]) : [];
  return (
    <div>
      <p className="eyebrow">Access control</p>
      <h2 className="section-title mt-2">Role assignments</h2>
      <p className="mt-2 text-sm text-muted">
        Only super administrators can grant or revoke roles. Coordinator assignments must match the
        organisational unit type, and these rules are checked inside PostgreSQL. The initial or
        replacement super-administrator grant remains a controlled service-side operation.
      </p>
      {error && (
        <p role="status" className="notice mt-4">
          Role assignments are unavailable.
        </p>
      )}
      <div className="mt-5">
        <AdminDataTable
          columns={["user_id", "role", "org_unit_id", "state_code", "created_at"]}
          rows={assignments}
        />
      </div>
      <div className="mt-6">
        <AdminActionForm
          title="Assign a role"
          action="role.assign"
          fields={[
            { name: "userId", label: "Member profile UUID", required: true },
            {
              name: "role",
              label: "Role",
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
            { name: "orgUnitId", label: "Scope unit UUID (required for coordinator roles)" },
          ]}
        />
      </div>
      <div className="mt-6">
        <AdminActionForm
          title="Revoke a role"
          action="role.revoke"
          fields={[{ name: "assignmentId", label: "Role assignment UUID", required: true }]}
        />
      </div>
    </div>
  );
}
