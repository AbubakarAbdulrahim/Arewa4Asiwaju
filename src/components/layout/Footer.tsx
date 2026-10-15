import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Phone } from "lucide-react";

const footerLinkClass =
  "inline-flex min-h-8 items-center text-sm text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:text-white";

export function Footer({ reserveFloatingActionSpace = false }: { reserveFloatingActionSpace?: boolean }) {
  return (
    <footer className="bg-[#10251a] text-white">
      <div className="site-container grid gap-10 py-12 sm:py-14 lg:grid-cols-[1.2fr_.65fr_.8fr] lg:gap-12 lg:py-16">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 rounded-sm focus-visible:outline-white">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1">
              <Image
                src="/brand/arewa-for-asiwaju-a4a.jpg"
                alt="Arewa for Asiwaju"
                width={56}
                height={56}
                sizes="56px"
                className="h-full w-full rounded-full object-cover"
              />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-extrabold uppercase leading-tight tracking-[.04em] sm:text-base">
                Arewa for Asiwaju
              </span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-[.12em] text-[#8dd5a5]">
                Student Wing
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/75">
            A student-focused support group promoting the Renewed Hope Agenda through grassroots
            mobilisation, policy advocacy, and youth participation.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-sm border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80">
              Northern Nigeria + FCT
            </span>
            <span className="flex h-10 items-center rounded-sm bg-white px-2.5 py-1">
              <Image
                src="/brand/08-logo-apc.png"
                alt="All Progressives Congress (APC)"
                width={44}
                height={36}
                sizes="44px"
                className="h-8 w-auto object-contain"
              />
            </span>
          </div>
        </div>

        <nav aria-label="Explore A4A">
          <h2 className="text-sm font-bold uppercase tracking-[.12em] text-white">Explore</h2>
          <ul className="mt-4 space-y-1">
            <li><Link className={footerLinkClass} href="/about">About the Student Wing</Link></li>
            <li><Link className={footerLinkClass} href="/mission">Mission and vision</Link></li>
            <li><Link className={footerLinkClass} href="/leadership">Leadership</Link></li>
            <li><Link className={footerLinkClass} href="/news">News and announcements</Link></li>
            <li><Link className={footerLinkClass} href="/events">Events and activities</Link></li>
            <li><Link className={footerLinkClass} href="/banner-generator">Create your banner</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[.12em] text-white">Contact and resources</h2>
          <p className="mt-4 flex items-start gap-2.5 text-sm leading-6 text-white/75">
<<<<<<< HEAD
            <MapPin aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#f3ca61]" />
            Kano State, Nigeria
=======
            <MapPin aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#8dd5a5]" />
            Kano, Nigeria
>>>>>>> 5c169eaebfbb92d54658712b11b82deb9f5e5faa
          </p>
          <ul className="mt-2 space-y-1">
            <li>
              <a className={`${footerLinkClass} gap-2.5`} href="tel:09122628654">
                <Phone aria-hidden="true" className="h-4 w-4 text-[#8dd5a5]" />
                09122628654
              </a>
            </li>
            <li>
              <a className={`${footerLinkClass} gap-2.5`} href="tel:09013113304">
                <Phone aria-hidden="true" className="h-4 w-4 text-[#8dd5a5]" />
                09013113304
              </a>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
            <Link className={footerLinkClass} href="/faqs">FAQs</Link>
            <Link className={footerLinkClass} href="/contact">Support</Link>
            <Link className={footerLinkClass} href="/verify-card">Verify a card</Link>
            <Link className={footerLinkClass} href="/privacy">Privacy</Link>
            <Link className={footerLinkClass} href="/terms">Terms</Link>
          </div>
          <Link
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-sm bg-brand-forest px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-forest-dark hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            href="/register"
          >
            Join the Student Wing <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className={`site-container flex flex-col gap-2 py-4 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between ${reserveFloatingActionSpace ? "pb-20" : ""}`}>
          <p>Arewa for Asiwaju Student Wing. All rights reserved.</p>
          <Link className={footerLinkClass} href="/ha">Hausa version</Link>
        </div>
      </div>
    </footer>
  );
}
