import Link from "next/link";
import { ArrowRight, CalendarDays, CircleHelp, FileText, UsersRound } from "lucide-react";
import { getAdminSession, canAdminister } from "@/lib/admin/server";
import type { UserRole } from "@/types/database";

export default async function AdminOverviewPage() {
  const { supabase, roles } = await getAdminSession();
  const { data, error } = await supabase.rpc("admin_overview");
  const overview =
    !error && data && typeof data === "object" ? (data as Record<string, number | null>) : null;
  const cards = [
    {
      label: "Members",
      value: overview?.members,
      href: "/admin/members",
      roles: [
        "super_admin",
        "membership_officer",
        "state_coordinator",
        "lga_coordinator",
        "chapter_coordinator",
      ],
      icon: UsersRound,
      note: "View member records",
    },
    {
      label: "Active members",
      value: overview?.active_members,
      href: "/admin/members?status=active",
      roles: [
        "super_admin",
        "membership_officer",
        "state_coordinator",
        "lga_coordinator",
        "chapter_coordinator",
      ],
      icon: UsersRound,
      note: "Currently active",
    },
    {
      label: "Awaiting review",
      value: overview?.pending_members,
      href: "/admin/members?status=pending_verification",
      roles: [
        "super_admin",
        "membership_officer",
        "state_coordinator",
        "lga_coordinator",
        "chapter_coordinator",
      ],
      icon: CircleHelp,
      note: "Membership follow-up",
    },
    {
      label: "Upcoming events",
      value: overview?.events,
      href: "/admin/events",
      roles: [
        "super_admin",
        "event_manager",
        "state_coordinator",
        "lga_coordinator",
        "chapter_coordinator",
      ],
      icon: CalendarDays,
      note: "Scheduled activities",
    },
    {
      label: "Open support requests",
      value: overview?.open_support,
      href: "/admin/support",
      roles: ["super_admin", "membership_officer"],
      icon: CircleHelp,
      note: "Need a response",
    },
    {
      label: "Local groups",
      value: overview?.units,
      href: "/admin/organisation",
      roles: ["super_admin"],
      icon: UsersRound,
      note: "Organisation structure",
    },
  ].map((card) => ({ ...card, roles: card.roles as UserRole[] }));
  const quickLinks = [
    {
      label: "Add a news update",
      href: "/admin/content",
      icon: FileText,
      roles: ["super_admin", "content_editor"],
    },
    {
      label: "Create an event",
      href: "/admin/events",
      icon: CalendarDays,
      roles: ["super_admin", "event_manager", "state_coordinator"],
    },
    {
      label: "Find a member",
      href: "/admin/members",
      icon: UsersRound,
      roles: [
        "super_admin",
        "membership_officer",
        "state_coordinator",
        "lga_coordinator",
        "chapter_coordinator",
      ],
    },
  ].map((item) => ({ ...item, roles: item.roles as UserRole[] }));

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Today at a glance</p>
          <h2 className="section-title mt-2">Welcome to your workspace</h2>
          <p className="mt-2 text-sm text-muted">
            Review activity and get to common tasks quickly.
          </p>
        </div>
        <p className="text-xs text-muted">Figures reflect the records you are allowed to manage.</p>
      </div>
      {!overview && (
        <div role="status" className="mt-5 rounded-md border border-[#ead6a5] bg-[#fffaf0] p-4">
          <p className="font-bold text-ink">Dashboard information is temporarily unavailable</p>
          <p className="mt-1 text-sm text-muted">
            No sample figures are displayed. Check the database connection or contact your system
            administrator.
          </p>
        </div>
      )}
      <section
        aria-label="Workspace summary"
        className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {cards
          .filter((card) => canAdminister(roles, card.roles))
          .map(({ label, value, href, icon: Icon, note }) => (
            <Link
              key={label}
              href={href}
              className="group rounded-md border border-line bg-white p-4 no-underline transition-shadow hover:shadow-md sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-muted">{label}</span>
                <Icon aria-hidden="true" className="h-4 w-4 text-brand-forest" />
              </div>
              <strong className="mt-3 block text-3xl font-bold tracking-tight text-ink">
                {overview ? Number(value ?? 0).toLocaleString() : "—"}
              </strong>
              <span className="mt-1 block text-xs text-muted">{note}</span>
              <span className="mt-4 flex items-center gap-1 text-sm font-bold text-brand-forest">
                Open {label.toLowerCase()}{" "}
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
      </section>
      <section className="mt-8 border-t border-line pt-6">
        <h3 className="text-base font-bold text-ink">Common tasks</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks
            .filter((item) => canAdminister(roles, item.roles))
            .map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex min-h-12 items-center gap-3 rounded-md border border-line px-4 py-3 text-sm font-semibold text-ink no-underline hover:border-brand-forest hover:bg-[#f7faf7]"
              >
                <Icon aria-hidden="true" className="h-4 w-4 text-brand-forest" />
                {label}
                <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4 text-muted" />
              </Link>
            ))}
        </div>
      </section>
      <p className="mt-7 border-t border-line pt-5 text-xs leading-5 text-muted">
        Access to member records and administrative actions is limited by your assigned role and
        organisational area. Sensitive changes are recorded for accountability.
      </p>
    </div>
  );
}
