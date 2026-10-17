import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle, Phone, ShieldCheck, HelpCircle } from "lucide-react";
import { PublicPage, PageHeading } from "@/components/public/PublicPage";

export const metadata: Metadata = {
  title: "Contact and student support",
  description:
    "Direct WhatsApp and phone assistance for registration, membership cards, and campus coordination.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact and support | Arewa for Asiwaju Student Wing",
    description: "Connect with the A4A student support team via WhatsApp or telephone.",
  },
};

const supportTopics = [
  {
    title: "Registration & membership numbers",
    detail: "Help retrieving your membership number, ID card password reset, or updating details.",
  },
  {
    title: "Campus coordination & gatherings",
    detail: "Inquire about launching a chapter on your campus or hosting a policy discussion.",
  },
  {
    title: "Privacy & account management",
    detail: "Questions about your personal data under NDPR compliance or account deletion.",
  },
  {
    title: "General movement inquiries",
    detail: "Media, strategic partnerships, and regional policy translation materials.",
  },
];

export default function ContactPage() {
  return (
    <PublicPage>
      <PageHeading
        eyebrow="Help & contact"
        title="We are here to support every student"
        intro="Reach out directly for membership help, campus coordination inquiries, or assistance retrieving your digital card."
      />

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-14">
        {/* Left Column: WhatsApp Primary + Phone Numbers */}
        <div className="space-y-8">
          {/* Primary Action: WhatsApp with large tap target */}
          <div className="rounded-md border-2 border-[#25D366] bg-surface p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 text-[#128C7E]">
              <MessageCircle aria-hidden="true" className="h-6 w-6 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">Fastest response</span>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold text-ink sm:text-3xl">
              Message us on WhatsApp
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Chat directly with our student support team for instant help with card generation,
              registration status, and coordinator contacts.
            </p>
            <div className="mt-6">
              <a
                href="https://wa.me/2349122628654?text=Hello%2C%20I%20need%20assistance%20from%20A4A%20Student%20Wing%20support."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-md bg-[#25D366] px-6 py-3.5 text-base font-bold text-white shadow-xs transition-colors hover:bg-[#1EBE5D] sm:w-auto"
              >
                <MessageCircle aria-hidden="true" className="h-5 w-5" />
                <span>Start WhatsApp chat</span>
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Secondary Action: Direct Phone Lines */}
          <section aria-labelledby="phone-lines-heading">
            <h2
              id="phone-lines-heading"
              className="text-sm font-bold uppercase tracking-wider text-muted"
            >
              Direct telephone lines
            </h2>
            <div className="mt-3 divide-y divide-line rounded-md border border-line bg-surface">
              <div className="flex items-center justify-between p-4 sm:p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">
                    Primary desk
                  </p>
                  <p className="mt-0.5 font-mono text-lg font-bold text-ink sm:text-xl">
                    0912 262 8654
                  </p>
                </div>
                <a
                  href="tel:09122628654"
                  className="button-secondary text-xs inline-flex items-center gap-1.5"
                >
                  <Phone aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Call line</span>
                </a>
              </div>
              <div className="flex items-center justify-between p-4 sm:p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">
                    Secondary desk
                  </p>
                  <p className="mt-0.5 font-mono text-lg font-bold text-ink sm:text-xl">
                    0901 311 3304
                  </p>
                </div>
                <a
                  href="tel:09013113304"
                  className="button-secondary text-xs inline-flex items-center gap-1.5"
                >
                  <Phone aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Call line</span>
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Support Topics as a Simple List */}
        <div className="space-y-6">
          <section
            aria-labelledby="topics-heading"
            className="rounded-md border border-line bg-surface p-6 sm:p-7 shadow-xs"
          >
            <h2 id="topics-heading" className="text-xl font-bold text-ink">
              Support topics
            </h2>
            <p className="mt-1 text-xs text-muted">Common requests handled by our desk:</p>

            <ul className="mt-5 space-y-4 divide-y divide-line border-t border-line">
              {supportTopics.map(({ title, detail }) => (
                <li key={title} className="pt-4 first:border-t-0 first:pt-0">
                  <h3 className="font-bold text-ink text-sm sm:text-base">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">{detail}</p>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-line pt-4">
              <Link
                href="/faqs"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-forest hover:underline"
              >
                <HelpCircle aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Browse frequently asked questions</span>
              </Link>
            </div>
          </section>

          {/* Privacy Note */}
          <div className="rounded-md border border-line bg-paper p-4 text-xs text-muted leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-ink">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-brand-forest" />
              <span>Data safety reminder</span>
            </div>
            <p className="mt-1">
              Never share your account password or SMS codes with anyone. Support agents will only
              ask for your registered email address or membership ID.
            </p>
          </div>
        </div>
      </div>
    </PublicPage>
  );
}
