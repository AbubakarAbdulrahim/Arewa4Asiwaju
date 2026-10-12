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
      <p className="eyebrow">Governance</p>
      <h2 className="section-title mt-2">Audit log</h2>
      <p className="mt-2 text-sm text-muted">
        Sensitive actions are recorded as they occur. Audit access is restricted to super
        administrators, auditors, and the data-protection officer.
      </p>
      {error && (
        <p role="status" className="notice mt-4">
          Audit data is unavailable. Apply the Phase 7 migration and confirm this account’s audit
          permission.
        </p>
      )}
      <p className="my-4 text-sm">
        {Number(result?.total_count ?? 0).toLocaleString()} total records · latest 50 shown
      </p>
      <AdminDataTable
        columns={["created_at", "actor_id", "action", "target_type", "target_id", "details"]}
        rows={rows}
      />
    </div>
  );
}
