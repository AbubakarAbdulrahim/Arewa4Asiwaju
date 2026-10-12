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
        Request text and contact details are visible only to authorised membership staff. Record a
        status and response to close the loop.
      </p>
      {error && (
        <p role="status" className="notice mt-4">
          Support management data is pending the Phase 7 migration.
        </p>
      )}
      <div className="mt-5">
        <AdminDataTable
          columns={["id", "name", "subject", "category", "status", "created_at"]}
          rows={rows}
        />
      </div>
      <div className="mt-6">
        <AdminActionForm
          title="Update a support request"
          action="support.update"
          fields={[
            { name: "id", label: "Request UUID", required: true },
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
