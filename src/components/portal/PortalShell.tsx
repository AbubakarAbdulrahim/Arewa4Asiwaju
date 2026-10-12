import Link from "next/link";
import { SignOutButton } from "@/components/portal/PortalActions";

const portalLinks = [
  ["Overview", "/portal"],
  ["Digital ID card", "/portal/id-card"],
  ["Events", "/portal/events"],
  ["Announcements", "/portal/announcements"],
  ["Profile", "/portal/profile"],
  ["Notifications", "/portal/notifications"],
  ["Communication preferences", "/portal/preferences"],
  ["Support", "/portal/support"],
  ["Privacy requests", "/portal/privacy"],
] as const;

export function PortalShell({
  children,
  memberName,
}: {
  children: React.ReactNode;
  memberName: string;
}) {
  return (
    <main className="site-container min-h-[70vh] py-8 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.15em] text-brand-forest">
            Member portal
          </p>
          <h1 className="mt-1 text-2xl font-bold">Welcome, {memberName}</h1>
        </div>
        <SignOutButton />
      </header>
      <div className="grid gap-8 py-7 lg:grid-cols-[210px_1fr]">
        <nav
          aria-label="Member portal"
          className="flex gap-1 overflow-x-auto border-b border-line pb-3 lg:flex-col lg:overflow-visible lg:border-0 lg:pb-0"
        >
          {portalLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 rounded-sm px-3 py-2 text-sm font-semibold text-ink hover:bg-[#e9eee9]"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
