import { getAdminSession } from "@/lib/admin/server";

export default async function AdminReportsPage() {
  const { supabase } = await getAdminSession();
  const { data, error } = await supabase.rpc("admin_reporting_summary");
  const summary =
    !error && data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const cards: [string, number][] = [
    ["Members in scope", Number(summary?.members_in_scope ?? 0)],
    ["Active members", Number(summary?.active_members_in_scope ?? 0)],
    ["Events in next 30 days", Number(summary?.events_next_30_days ?? 0)],
    ["Registrations in next 30 days", Number(summary?.event_registrations_next_30_days ?? 0)],
    ["Open privacy requests", Number(summary?.privacy_open ?? 0)],
    ["Failed notifications", Number(summary?.notifications_failed ?? 0)],
  ];
  return (
    <div>
      <p className="eyebrow">Reporting</p>
      <h2 className="section-title mt-2">Aggregate operations report</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Counts are generated in PostgreSQL and respect the signed-in administrator’s scope. No
        individual political or contact data is included in this report.
      </p>
      {error ? (
        <p role="status" className="notice mt-5">
          Reports are pending the Phase 8 database migration.
        </p>
      ) : (
        <section
          className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          aria-label="Aggregate report"
        >
          {cards.map(([label, value]) => (
            <div key={label} className="border border-line bg-surface p-5">
              <span className="block text-sm text-muted">{label}</span>
              <strong className="mt-2 block text-3xl">{Number(value ?? 0).toLocaleString()}</strong>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
