import React from "react";
import Link from "next/link";
import { Shield, MapPin, Mail, Phone, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#E2E6E2] bg-[#121713] text-[#FBF9F5]/90">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B4619] text-[#C59B27] font-bold text-lg border border-[#C59B27]/30">
                A4A
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                AREWA<span className="text-[#C59B27]">4</span>ASIWAJU
              </span>
            </div>
            <p className="text-sm text-[#FBF9F5]/70 max-w-sm leading-relaxed">
              The premier grassroots civic movement and student mobilization wing across the 19 Northern Nigerian States and the Federal Capital Territory. Fostering youth development, digital identity, and progressive governance.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-[#C59B27] font-medium">
              <Shield className="h-4 w-4" />
              <span>NDPR & Data Protection Compliant Platform</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">
              Organisation
            </h3>
            <ul className="space-y-2 text-sm text-[#FBF9F5]/80">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Movement
                </Link>
              </li>
              <li>
                <Link href="/leadership" className="hover:text-white transition-colors">
                  Leadership Council
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-white transition-colors">
                  Press Releases
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition-colors">
                  Events & Rallies
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Media Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Services & Verification */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">
              Membership
            </h3>
            <ul className="space-y-2 text-sm text-[#FBF9F5]/80">
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Register Supporter
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-white transition-colors">
                  Member Portal
                </Link>
              </li>
              <li>
                <Link href="/verify-card" className="hover:text-white transition-colors">
                  Verify Digital ID Card
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors text-xs text-[#FBF9F5]/50 hover:text-[#C59B27]">
                  Executive Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Governance */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">
              Contact Desk
            </h3>
            <ul className="space-y-2 text-sm text-[#FBF9F5]/70">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#C59B27] shrink-0 mt-0.5" />
                <span>National Secretariat, Central Business District, Abuja, Nigeria</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#C59B27] shrink-0" />
                <a href="mailto:secretariat@arewa4asiwaju.org" className="hover:text-white">
                  secretariat@arewa4asiwaju.org
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#C59B27] shrink-0" />
                <span>+234 (0) 800-AREWA-4A</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FBF9F5]/60">
          <p>© {new Date().getFullYear()} Arewa4Asiwaju Movement. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#C59B27] transition-colors">
              Privacy Notice (NDPR)
            </Link>
            <Link href="/terms" className="hover:text-[#C59B27] transition-colors">
              Terms of Membership
            </Link>
            <span className="text-[#C59B27] font-semibold">Hausa Localisation Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
