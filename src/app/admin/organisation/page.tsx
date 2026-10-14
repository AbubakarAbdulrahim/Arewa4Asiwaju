import { AdminActionForm, AdminDataTable } from "@/components/admin/AdminActionForm";
import { getAdminSession, canAdminister } from "@/lib/admin/server";

export default async function OrganisationPage() {
  const { supabase, roles } = await getAdminSession();
  const { data, error } = await supabase.rpc("admin_list_units");
  const units = !error && Array.isArray(data) ? (data as unknown as Record<string, unknown>[]) : [];
  const unitNames = new Map(units.map((unit) => [String(unit.id), String(unit.name)]));
  const displayUnits = units.map((unit) => ({
    ...unit,
    parent_name: unit.parent_id ? (unitNames.get(String(unit.parent_id)) ?? "Parent group") : "—",
  }));
  const canCreate = canAdminister(roles, ["super_admin"]);
  return (
    <div>
      <p className="eyebrow">Organisation</p>
      <h2 className="section-title mt-2">Organisational hierarchy</h2>
      <p className="mt-2 text-sm text-muted">
        Manage the national-to-local structure. Choose a parent group from its name; the system
        checks the hierarchy when you save.
      </p>
      {error && (
        <p role="status" className="notice mt-4">
          Group information is not available right now. Refresh this page or contact the system
          administrator.
        </p>
      )}
      <div className="mt-5">
        <AdminDataTable
          columns={["name", "code", "type", "parent_name", "state_code", "lga_name"]}
          rows={displayUnits}
        />
      </div>
      {canCreate && (
        <div className="mt-6">
          <AdminActionForm
            title="Create or update a group"
            action="unit.save"
            records={units}
            fields={[
              {
                name: "id",
                label: "Group to update (leave blank to create)",
                type: "select",
                options: units.map((unit) => ({
                  value: String(unit.id),
                  label: `${String(unit.name)} · ${String(unit.type).replaceAll("_", " ")}`,
                })),
              },
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
              {
                name: "parentId",
                label: "Parent group",
                type: "select",
                options: units.map((unit) => ({
                  value: String(unit.id),
                  label: `${String(unit.name)} · ${String(unit.type).replaceAll("_", " ")}`,
                })),
              },
              { name: "stateCode", label: "State abbreviation", placeholder: "e.g. KN" },
              { name: "lgaName", label: "Local government area" },
              { name: "description", label: "Description", type: "textarea" },
            ]}
          />
        </div>
      )}
    </div>
  );
}
