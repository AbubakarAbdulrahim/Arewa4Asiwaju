import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, MessageCircle, Phone } from "lucide-react";
import { CurrentYear } from "@/components/layout/CurrentYear";

const footerLinkClass =
  "inline-flex min-h-7 items-center text-xs text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:text-white";

export function Footer({
  reserveFloatingActionSpace = false,
}: {
  reserveFloatingActionSpace?: boolean;
}) {
  return (
    <footer className="border-t border-line/20 bg-[#0e2117] text-white">
      <div className="site-container grid gap-10 py-12 sm:py-14 lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.9fr] lg:gap-10 lg:py-16">
        {/* Brand Column */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-sm focus-visible:outline-white"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1">
              <Image
                src="/brand/arewa-for-asiwaju-a4a.jpg"
                alt="Arewa for Asiwaju"
                width={48}
                height={48}
                sizes="48px"
                className="h-full w-full rounded-full object-cover"
              />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-tight sm:text-base">
                Arewa for Asiwaju
              </span>
              <span className="text-[.65rem] font-bold tracking-[.14em] text-[#8dd5a5]">
                STUDENT WING
              </span>
            </span>
          </Link>
          <p className="max-w-sm text-xs leading-relaxed text-white/75">
            A student-led political mobilisation movement connecting youth across the 19 northern
            states and the FCT with the Renewed Hope Agenda.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="rounded-xs border border-white/20 px-2.5 py-1 text-[0.6875rem] font-semibold text-white/80">
              19 Northern States + FCT
            </span>
            <span
              className="flex h-8 items-center rounded-xs bg-white px-2 py-0.5"
              title="All Progressives Congress (APC)"
            >
              <Image
                src="/brand/08-logo-apc.png"
                alt="All Progressives Congress (APC)"
                width={36}
                height={28}
                sizes="36px"
                className="h-6 w-auto object-contain"
              />
            </span>
          </div>
        </div>

        {/* Group 1: Movement */}
        <nav aria-label="Movement navigation">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">Movement</h2>
          <ul className="mt-3.5 space-y-2">
            <li>
              <Link className={footerLinkClass} href="/about">
                About the Student Wing
              </Link>
            </li>
            <li>
              <Link className={footerLinkClass} href="/about#mission">
                Mission & vision
              </Link>
            </li>
            <li>
              <Link className={footerLinkClass} href="/leadership">
                Leadership structure
              </Link>
            </li>
            <li>
              <Link className={footerLinkClass} href="/about#hierarchy">
                Organising hierarchy
              </Link>
            </li>
          </ul>
        </nav>

        {/* Group 2: Student Tools & News */}
        <nav aria-label="Student resources">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">Student tools</h2>
          <ul className="mt-3.5 space-y-2">
            <li>
              <Link className={footerLinkClass} href="/banner-generator">
                Make your banner
              </Link>
            </li>
            <li>
              <Link className={footerLinkClass} href="/news">
                News & dispatches
              </Link>
            </li>
            <li>
              <Link className={footerLinkClass} href="/events">
                Campus events
              </Link>
            </li>
            <li>
              <Link className={footerLinkClass} href="/verify-card">
                Verify a card
              </Link>
            </li>
            <li>
              <Link className={footerLinkClass} href="/login">
                Member sign in
              </Link>
            </li>
          </ul>
        </nav>

        {/* Group 3: Direct Contact & Help */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">Support & help</h2>
          <p className="mt-3.5 flex items-start gap-2 text-xs leading-5 text-white/75">
            <MapPin aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8dd5a5]" />
            National Secretariat: Kano, Nigeria
          </p>
          <ul className="mt-2.5 space-y-1.5">
            <li>
              <a
                className={`${footerLinkClass} gap-2 text-[#8dd5a5] hover:text-white font-semibold`}
                href="https://wa.me/2349122628654"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
                <span>WhatsApp support desk</span>
              </a>
            </li>
            <li>
              <a className={`${footerLinkClass} gap-2 font-mono`} href="tel:09122628654">
                <Phone aria-hidden="true" className="h-3.5 w-3.5 text-[#8dd5a5]" />
                0912 262 8654
              </a>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <Link className={footerLinkClass} href="/faqs">
              FAQs
            </Link>
            <Link className={footerLinkClass} href="/contact">
              Contact
            </Link>
            <Link className={footerLinkClass} href="/privacy">
              Privacy
            </Link>
            <Link className={footerLinkClass} href="/terms">
              Terms
            </Link>
          </div>
          <div className="mt-5">
            <Link
              className="inline-flex min-h-9 items-center gap-1.5 rounded-sm bg-brand-forest px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-forest-dark"
              href="/register"
            >
              <span>Join the Student Wing</span>
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div
          className={`site-container flex flex-col gap-2 py-4 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between ${
            reserveFloatingActionSpace ? "pb-20" : ""
          }`}
        >
          <p>
            © <CurrentYear /> Arewa for Asiwaju Student Wing. All rights reserved.
          </p>
          <p className="text-[0.6875rem]">
            Compliant with Nigeria Data Protection Act (NDPA/NDPR).
          </p>
        </div>
      </div>
    </footer>
  );
}
