import Link from "next/link";
import { SignOutButton } from "@/components/portal/PortalActions";
import type { UserRole } from "@/types/database";

const links: { label: string; href: string; roles: UserRole[] }[] = [
  {
    label: "Overview",
    href: "/admin",
    roles: [
      "super_admin",
      "membership_officer",
      "state_coordinator",
      "lga_coordinator",
      "chapter_coordinator",
      "event_manager",
      "content_editor",
      "auditor",
      "data_protection_officer",
    ],
  },
  {
    label: "Members",
    href: "/admin/members",
    roles: [
      "super_admin",
      "membership_officer",
      "state_coordinator",
      "lga_coordinator",
      "chapter_coordinator",
    ],
  },
  {
    label: "Organisation",
    href: "/admin/organisation",
    roles: ["super_admin", "state_coordinator", "lga_coordinator", "chapter_coordinator"],
  },
  { label: "Roles", href: "/admin/roles", roles: ["super_admin"] },
  {
    label: "Events",
    href: "/admin/events",
    roles: [
      "super_admin",
      "event_manager",
      "state_coordinator",
      "lga_coordinator",
      "chapter_coordinator",
    ],
  },
  {
    label: "News & announcements",
    href: "/admin/content",
    roles: ["super_admin", "content_editor"],
  },
  {
    label: "Leadership roster",
    href: "/admin/leadership",
    roles: ["super_admin", "content_editor"],
  },
  { label: "Media library", href: "/admin/media", roles: ["super_admin", "content_editor"] },
  { label: "Support", href: "/admin/support", roles: ["super_admin", "membership_officer"] },
  {
    label: "Reports",
    href: "/admin/reports",
    roles: [
      "super_admin",
      "membership_officer",
      "state_coordinator",
      "lga_coordinator",
      "chapter_coordinator",
      "event_manager",
      "auditor",
      "data_protection_officer",
    ],
  },
  {
    label: "Privacy requests",
    href: "/admin/privacy",
    roles: ["super_admin", "data_protection_officer"],
  },
  {
    label: "Audit log",
    href: "/admin/audit",
    roles: ["super_admin", "auditor", "data_protection_officer"],
  },
];

export function AdminShell({
  children,
  name,
  roles,
}: {
  children: React.ReactNode;
  name: string;
  roles: UserRole[];
}) {
  const visibleLinks = links.filter((link) => roles.some((role) => link.roles.includes(role)));
  return (
    <main id="main-content" className="site-container min-h-[75vh] py-8 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Arewa4Asiwaju · secure workspace</p>
          <h1 className="mt-1 text-2xl font-bold">Administration</h1>
          <p className="mt-1 text-sm text-muted">Signed in as {name}</p>
        </div>
        <SignOutButton />
      </header>
      <div className="grid gap-7 py-7 lg:grid-cols-[220px_1fr]">
        <nav
          aria-label="Administration"
          className="flex gap-1 overflow-x-auto border-b border-line pb-3 lg:flex-col lg:overflow-visible lg:border-0 lg:pb-0"
        >
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-sm px-3 py-2 text-sm font-semibold text-ink hover:bg-[#e9eee9]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
