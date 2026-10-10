"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldCheck, UserCheck, ArrowRight } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Leadership", href: "/leadership" },
    { label: "News & Media", href: "/news" },
    { label: "Events", href: "/events" },
    { label: "Verify ID Card", href: "/verify-card" },
    { label: "FAQ", href: "/faq" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E6E2] bg-[#FBF9F5]/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        {/* Brand Lockup */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-[#0B4619] text-white shadow-md transition-transform group-hover:scale-105">
            <span className="font-bold text-lg tracking-wider text-[#C59B27]">A4A</span>
            <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#C59B27]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl leading-tight text-[#0B4619] tracking-tight">
              AREWA<span className="text-[#C59B27]">4</span>ASIWAJU
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
              Student & Youth Movement
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  active
                    ? "text-[#0B4619] bg-[#0B4619]/8 font-semibold"
                    : "text-[#121713]/80 hover:text-[#0B4619] hover:bg-black/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#0B4619] hover:bg-[#0B4619]/10 rounded-md transition-colors"
          >
            <UserCheck className="h-4 w-4" />
            Portal
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0B4619] hover:bg-[#06260d] rounded-lg shadow-sm hover:shadow transition-all"
          >
            Join Movement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-[#121713] hover:bg-black/5 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#E2E6E2] bg-[#FBF9F5] px-4 pt-2 pb-6 space-y-2 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                    active
                      ? "text-[#0B4619] bg-[#0B4619]/10 font-semibold"
                      : "text-[#121713] hover:bg-black/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#E2E6E2] space-y-2">
            <Link
              href="/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-semibold text-[#0B4619] border border-[#0B4619] hover:bg-[#0B4619]/5"
            >
              <UserCheck className="h-4 w-4" />
              Member Portal Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-semibold text-white bg-[#0B4619] hover:bg-[#06260d]"
            >
              Register & Get Digital ID Card
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
