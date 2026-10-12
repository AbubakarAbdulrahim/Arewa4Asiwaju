import { AdminActionForm, AdminDataTable } from "@/components/admin/AdminActionForm";
import { getAdminSession } from "@/lib/admin/server";

export default async function AdminPrivacyPage() {
  const { supabase } = await getAdminSession();
  const { data, error } = await supabase.rpc("admin_list_data_requests", {
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
      <p className="eyebrow">Data protection</p>
      <h2 className="section-title mt-2">Privacy requests</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Review access, rectification, erasure, and restriction requests. Completion still requires
        the organisation’s approved identity and retention procedure.
      </p>
      {error && (
        <p role="status" className="notice mt-4">
          Privacy operations are pending the Phase 8 migration.
        </p>
      )}
      <div className="mt-5">
        <AdminDataTable
          columns={["id", "request_type", "status", "membership_number", "full_name", "created_at"]}
          rows={rows}
        />
      </div>
      <div className="mt-6">
        <AdminActionForm
          title="Update a privacy request"
          action="privacy.update"
          fields={[
            { name: "id", label: "Request UUID", required: true },
            {
              name: "status",
              label: "Status",
              type: "select",
              required: true,
              options: ["processing", "completed", "rejected"],
            },
          ]}
        />
      </div>
    </div>
  );
}
