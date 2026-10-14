import { AdminActionForm, AdminDataTable } from "@/components/admin/AdminActionForm";
import { getAdminSession } from "@/lib/admin/server";

export default async function SupportAdminPage() {
  const { supabase } = await getAdminSession();
  const { data, error } = await supabase.rpc("admin_list_support", {
    p_status: null,
    p_page: 1,
    p_page_size: 50,
  });
  const result = Array.isArray(data)
    ? (data[0] as { items?: Record<string, unknown>[] } | undefined)
    : undefined;
  const rows = !error && Array.isArray(result?.items) ? result.items : [];
  return (
    <div>
      <p className="eyebrow">Member services</p>
      <h2 className="section-title mt-2">Support requests</h2>
      <p className="mt-2 text-sm text-muted">
        Review each member request, update its progress, and record a response. Contact details are
        only shown to authorised membership staff.
      </p>
      {error && (
        <p role="status" className="notice mt-4">
          Support requests are not available right now. Refresh this page or contact the system
          administrator.
        </p>
      )}
      <div className="mt-5">
        <AdminDataTable
          columns={["name", "subject", "category", "status", "created_at"]}
          rows={rows}
        />
      </div>
      <div className="mt-6">
        <AdminActionForm
          title="Update a support request"
          action="support.update"
          records={rows}
          fields={[
            {
              name: "id",
              label: "Request to update",
              type: "select",
              required: true,
              options: rows.map((row) => ({
                value: String(row.id),
                label: `${String(row.name)} · ${String(row.subject)} · ${String(row.created_at).slice(0, 10)}`,
              })),
            },
            {
              name: "status",
              label: "Status",
              type: "select",
              required: true,
              options: ["open", "in_progress", "resolved", "closed"],
            },
            { name: "response", label: "Response", type: "textarea" },
          ]}
        />
      </div>
    </div>
  );
}
