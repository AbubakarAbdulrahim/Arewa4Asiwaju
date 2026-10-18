"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Leadership", href: "/leadership" },
  { label: "News", href: "/news" },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
      <div className="brand-stripe" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="site-container flex min-h-14 items-center justify-between gap-3">
        {/* Brand Lockup */}
        <Link
          href="/"
          className="rounded-sm py-2 leading-tight no-underline"
          aria-label="Arewa for Asiwaju Student Wing home"
        >
          <span className="flex items-center gap-2.5">
            <Image
              src="/brand/arewa-for-asiwaju-a4a.jpg"
              alt=""
              width={38}
              height={38}
              preload
              className="h-9.5 w-9.5 rounded-full object-cover border border-line"
            />
            <span>
              <span className="block text-sm font-extrabold tracking-tight text-brand-forest">
                AREWA FOR ASIWAJU
              </span>
              <span className="block text-[.6rem] font-bold tracking-[.14em] text-muted">
                STUDENT WING
              </span>
            </span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {navLinks.map(({ label, href }) => {
            const active = href === "/" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-sm px-2.5 py-1.5 text-xs font-bold transition-colors ${
                  active
                    ? "text-brand-forest underline decoration-2 underline-offset-[.45rem]"
                    : "text-ink hover:text-brand-forest"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Link
            href="/banner-generator"
            aria-label="Get Your Banner"
            className="button-secondary px-3 py-1.5 text-xs font-bold"
          >
            Make your banner
          </Link>
          <Link href="/login" className="button-primary px-3.5 py-1.5 text-xs font-bold">
            Login
          </Link>
        </div>

        {/* Mobile Navigation Toggle Button */}
        <button
          type="button"
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-sm border border-line bg-surface text-ink hover:bg-brand-forest/10 focus-visible:outline lg:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Menu aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-line bg-paper px-4 py-4 lg:hidden shadow-md"
        >
          <div className="site-container flex flex-col gap-1.5">
            {navLinks.map(({ label, href }) => {
              const active = href === "/" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`rounded-sm px-3 py-2.5 text-sm font-bold no-underline transition-colors ${
                    active
                      ? "bg-brand-forest/10 text-brand-forest"
                      : "text-ink hover:bg-brand-forest/10 hover:text-brand-forest"
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            {/* Banner Link for Mobile (matched by e2e test) */}
            <Link
              href="/banner-generator"
              aria-label="Get Your Banner"
              onClick={() => setOpen(false)}
              className="rounded-sm px-3 py-2.5 text-sm font-bold text-ink no-underline transition-colors hover:bg-brand-forest/10 hover:text-brand-forest"
            >
              Make your banner
            </Link>

            {/* Row with ThemeToggle placed before Login (required by e2e test) */}
            <div className="mt-2 flex items-center gap-2 border-t border-line pt-3">
              <ThemeToggle />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="button-primary flex-1 text-xs justify-center font-bold"
              >
                Login
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
