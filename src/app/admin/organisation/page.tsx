import { AdminActionForm, AdminDataTable } from "@/components/admin/AdminActionForm";
import { getAdminSession, canAdminister } from "@/lib/admin/server";

export default async function OrganisationPage() {
  const { supabase, roles } = await getAdminSession();
  const { data, error } = await supabase.rpc("admin_list_units");
  const units = !error && Array.isArray(data) ? (data as unknown as Record<string, unknown>[]) : [];
  const canCreate = canAdminister(roles, ["super_admin"]);
  return (
    <div>
      <p className="eyebrow">Organisation</p>
      <h2 className="section-title mt-2">Organisational hierarchy</h2>
      <p className="mt-2 text-sm text-muted">
        National, zone, state, LGA, ward, campus chapter, and support group units. Parent and state
        consistency are enforced by database constraints.
      </p>
      {error && (
        <p role="status" className="notice mt-4">
          Organisational records are unavailable until the Phase 7 migration is applied.
        </p>
      )}
      <div className="mt-5">
        <AdminDataTable
          columns={["id", "name", "code", "type", "parent_id", "state_code", "lga_name"]}
          rows={units}
        />
      </div>
      {canCreate && (
        <div className="mt-6">
          <AdminActionForm
            title="Create an organisational unit"
            action="unit.save"
            fields={[
              { name: "id", label: "Unit UUID when updating" },
              { name: "name", label: "Unit name", required: true },
              { name: "code", label: "Unique unit code", required: true },
              {
                name: "type",
                label: "Unit type",
                type: "select",
                required: true,
                options: [
                  "national",
                  "zone",
                  "state",
                  "lga",
                  "ward",
                  "campus_chapter",
                  "support_group",
                ],
              },
              { name: "parentId", label: "Parent unit UUID" },
              { name: "stateCode", label: "State code" },
              { name: "lgaName", label: "LGA name" },
              { name: "description", label: "Description", type: "textarea" },
            ]}
          />
        </div>
      )}
    </div>
  );
}
