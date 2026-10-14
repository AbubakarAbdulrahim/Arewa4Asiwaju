import { AdminDataTable } from "@/components/admin/AdminActionForm";
import { getAdminSession } from "@/lib/admin/server";

export default async function AdminAuditPage() {
  const { supabase } = await getAdminSession();
  const { data, error } = await supabase.rpc("admin_list_audit", { p_page: 1, p_page_size: 50 });
  const result = Array.isArray(data)
    ? (data[0] as { total_count?: number; items?: Record<string, unknown>[] } | undefined)
    : undefined;
  const rows = !error && Array.isArray(result?.items) ? result.items : [];
  return (
    <div>
      <p className="text-sm leading-6 text-muted">
        Review when important changes happened, what was changed, and the action performed. Access
        is limited to authorised oversight roles.
      </p>
      {error && (
        <p role="status" className="notice mt-4">
          Activity information is not available right now. Refresh this page or contact the system
          administrator.
        </p>
      )}
      <p className="my-4 text-sm text-muted">
        Showing the latest 50 of {Number(result?.total_count ?? 0).toLocaleString()} activity
        records
      </p>
      <AdminDataTable columns={["created_at", "action", "target_type", "details"]} rows={rows} />
    </div>
  );
}
