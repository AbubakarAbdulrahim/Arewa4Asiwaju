"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarDays,
  FileText,
  Image,
  LayoutDashboard,
  LockKeyhole,
  Map,
  MessageSquareText,
  ShieldCheck,
  UserRoundCog,
  UsersRound,
} from "lucide-react";
import { SignOutButton } from "@/components/portal/PortalActions";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { UserRole } from "@/types/database";

const links: {
  label: string;
  href: string;
  roles: UserRole[];
  group: string;
  icon: typeof LayoutDashboard;
}[] = [
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
    group: "Workspace",
    icon: LayoutDashboard,
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
    group: "People",
    icon: UsersRound,
  },
  {
    label: "Organisation",
    href: "/admin/organisation",
    roles: ["super_admin", "state_coordinator", "lga_coordinator", "chapter_coordinator"],
    group: "People",
    icon: Map,
  },
  {
    label: "Roles and access",
    href: "/admin/roles",
    roles: ["super_admin"],
    group: "People",
    icon: UserRoundCog,
  },
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
    group: "Publishing",
    icon: CalendarDays,
  },
  {
    label: "News and notices",
    href: "/admin/content",
    roles: ["super_admin", "content_editor"],
    group: "Publishing",
    icon: FileText,
  },
  {
    label: "Leadership",
    href: "/admin/leadership",
    roles: ["super_admin", "content_editor"],
    group: "Publishing",
    icon: ShieldCheck,
  },
  {
    label: "Media library",
    href: "/admin/media",
    roles: ["super_admin", "content_editor"],
    group: "Publishing",
    icon: Image,
  },
  {
    label: "Support requests",
    href: "/admin/support",
    roles: ["super_admin", "membership_officer"],
    group: "Operations",
    icon: MessageSquareText,
  },
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
    group: "Operations",
    icon: Activity,
  },
  {
    label: "Privacy requests",
    href: "/admin/privacy",
    roles: ["super_admin", "data_protection_officer"],
    group: "Operations",
    icon: LockKeyhole,
  },
  {
    label: "Activity log",
    href: "/admin/audit",
    roles: ["super_admin", "auditor", "data_protection_officer"],
    group: "Operations",
    icon: ShieldCheck,
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
  const pathname = usePathname();
  const visibleLinks = links.filter((link) => roles.some((role) => link.roles.includes(role)));
  const activeLink = visibleLinks.find((link) => link.href === pathname) ?? visibleLinks[0];
  const groups = [...new Set(visibleLinks.map((link) => link.group))];

  return (
    <main id="main-content" className="min-h-[75vh] bg-[#f5f7f5]">
      <header className="border-b border-line bg-white">
        <div className="site-container flex min-h-[4.5rem] items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-3 no-underline">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-forest text-sm font-extrabold text-white">
              A4A
            </span>
            <span>
              <span className="block text-sm font-bold text-ink">A4A workspace</span>
              <span className="block text-xs text-muted">Administration</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:block">{name}</span>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="site-container py-5 sm:py-8">
        <div className="mb-4 overflow-x-auto lg:hidden">
          <nav aria-label="Administration" className="flex min-w-max gap-2 pb-1">
            {visibleLinks.map(({ label, href }) => {
              const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-2 text-sm font-semibold no-underline ${active ? "bg-brand-forest text-white" : "border border-line bg-white text-ink"}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="grid gap-5 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
          <aside className="hidden lg:block">
            <nav
              aria-label="Administration"
              className="sticky top-6 space-y-5 rounded-lg border border-line bg-white p-3"
            >
              {groups.map((group) => (
                <div key={group}>
                  <h2 className="px-3 pb-1 text-[0.65rem] font-bold uppercase tracking-[.14em] text-muted">
                    {group}
                  </h2>
                  <ul className="space-y-0.5">
                    {visibleLinks
                      .filter((link) => link.group === group)
                      .map(({ label, href, icon: Icon }) => {
                        const active =
                          href === "/admin" ? pathname === href : pathname.startsWith(href);
                        return (
                          <li key={href}>
                            <Link
                              href={href}
                              aria-current={active ? "page" : undefined}
                              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium no-underline ${active ? "bg-[#eaf2eb] text-brand-forest" : "text-ink hover:bg-[#f4f6f4]"}`}
                            >
                              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                              {label}
                            </Link>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
          <section className="min-w-0 rounded-lg border border-line bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="text-xs font-semibold text-muted">
                  A4A workspace / {activeLink?.group}
                </p>
                <h1 className="mt-1 text-lg font-bold text-ink">{activeLink?.label}</h1>
              </div>
              <span className="hidden rounded-full bg-[#eaf2eb] px-3 py-1 text-xs font-semibold text-brand-forest sm:inline">
                Secure workspace
              </span>
            </div>
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
