import { AdminActionForm, AdminDataTable } from "@/components/admin/AdminActionForm";
import { getAdminSession } from "@/lib/admin/server";

export default async function LeadershipAdminPage() {
  const { supabase } = await getAdminSession();
  const { data, error } = await supabase.rpc("admin_list_leadership");
  const rows = !error && Array.isArray(data) ? (data as unknown as Record<string, unknown>[]) : [];
  const { data: unitsData } = await supabase.rpc("admin_list_units");
  const units = Array.isArray(unitsData) ? (unitsData as Record<string, unknown>[]) : [];
  return (
    <div>
      <p className="eyebrow">Public information</p>
      <h2 className="section-title mt-2">Leadership roster</h2>
      <p className="mt-2 text-sm text-muted">
        Publish only appointments confirmed by the movement. Published profiles appear on the public
        leadership page.
      </p>
      {error && (
        <p role="status" className="notice mt-4">
          Leadership information is not available right now. Refresh this page or contact the system
          administrator.
        </p>
      )}
      <div className="mt-5">
        <AdminDataTable
          columns={["full_name", "title", "is_published", "display_order"]}
          rows={rows}
        />
      </div>
      <div className="mt-6">
        <AdminActionForm
          title="Create or update a leadership profile"
          action="leadership.save"
          records={rows}
          fields={[
            {
              name: "id",
              label: "Profile to update (leave blank to create)",
              type: "select",
              options: rows.map((row) => ({
                value: String(row.id),
                label: `${String(row.full_name)} · ${String(row.title)}`,
              })),
            },
            { name: "fullName", label: "Full name", required: true },
            { name: "title", label: "Official title", required: true },
            {
              name: "orgUnitId",
              label: "Organisational area",
              type: "select",
              options: units.map((unit) => ({ value: String(unit.id), label: String(unit.name) })),
            },
            { name: "displayOrder", label: "Display order", type: "number", required: true },
            { name: "photoUrl", label: "Approved photo URL", type: "url" },
            { name: "isPublished", label: "Publish after verification", type: "checkbox" },
            { name: "biography", label: "Approved biography", type: "textarea" },
          ]}
        />
      </div>
    </div>
  );
}
