import Link from "next/link";
import { getAdminSession } from "@/lib/admin/server";
import { canAdminister } from "@/lib/admin/server";

export default async function AdminOverviewPage() {
  const { supabase, roles } = await getAdminSession();
  const { data, error } = await supabase.rpc("admin_overview");
  const overview =
    !error && data && typeof data === "object" ? (data as Record<string, number | null>) : null;
  const cards = [
    [
      "Members in scope",
      overview?.members,
      "/admin/members",
      [
        "super_admin",
        "membership_officer",
        "state_coordinator",
        "lga_coordinator",
        "chapter_coordinator",
      ],
    ],
    [
      "Active members",
      overview?.active_members,
      "/admin/members?status=active",
      [
        "super_admin",
        "membership_officer",
        "state_coordinator",
        "lga_coordinator",
        "chapter_coordinator",
      ],
    ],
    [
      "Pending verification",
      overview?.pending_members,
      "/admin/members?status=pending_verification",
      [
        "super_admin",
        "membership_officer",
        "state_coordinator",
        "lga_coordinator",
        "chapter_coordinator",
      ],
    ],
    [
      "Upcoming events",
      overview?.events,
      "/admin/events",
      [
        "super_admin",
        "event_manager",
        "state_coordinator",
        "lga_coordinator",
        "chapter_coordinator",
      ],
    ],
    [
      "Open support requests",
      overview?.open_support,
      "/admin/support",
      ["super_admin", "membership_officer"],
    ],
    ["Organisation units", overview?.units, "/admin/organisation", ["super_admin"]],
  ] as const;
  return (
    <div>
      <p className="eyebrow">Administration</p>
      <h2 className="section-title mt-2">Operational overview</h2>
      {!overview && (
        <div role="status" className="notice mt-5">
          <p className="font-bold">Database integration pending</p>
          <p className="mt-1 text-sm">
            Apply the Phase 7 migration to the staging Supabase project and run the database
            security tests. No sample statistics are shown.
          </p>
        </div>
      )}
      <section
        aria-label="Current operational counts"
        className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {cards
          .filter(([, , , allowed]) => canAdminister(roles, allowed))
          .map(([label, value, href]) => (
            <Link
              key={label}
              href={href}
              className="border border-line bg-surface p-5 hover:border-brand-forest"
            >
              <span className="block text-sm text-muted">{label}</span>
              <strong className="mt-2 block text-3xl">
                {overview ? Number(value ?? 0).toLocaleString() : "—"}
              </strong>
              <span className="mt-2 block text-sm font-semibold text-brand-forest">
                Open records →
              </span>
            </Link>
          ))}
      </section>
      <section className="mt-8 border-t border-line pt-6">
        <h3 className="text-lg font-bold">Administration controls</h3>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Sensitive lists and changes are filtered in PostgreSQL by assigned role and organisational
          scope. Status updates, content publication, event changes, support actions, and role
          assignments are written through guarded database procedures and recorded in the audit log.
        </p>
      </section>
    </div>
  );
}
