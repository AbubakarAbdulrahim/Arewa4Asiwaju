import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileLock2, MessageCircle, Phone, UserRound } from "lucide-react";
import { PublicPage } from "@/components/public/PublicPage";

export const metadata: Metadata = {
  title: "Contact and support",
  description: "Contact the Arewa for Asiwaju Student Wing for membership and general support.",
  alternates: { canonical: "/contact" },
};

const contacts = [
  { number: "09122628654", href: "tel:09122628654", label: "Primary support line" },
  { number: "09013113304", href: "tel:09013113304", label: "Additional support line" },
];

export default function ContactPage() {
  return (
    <PublicPage>
      <header className="grid gap-8 border-b border-line pb-10 lg:grid-cols-[1fr_.6fr] lg:items-end">
        <div>
          <p className="eyebrow">We&apos;re here to help</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Contact the Student Wing
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-muted">
            Reach the movement for help with registration, membership records, participation, or a
            general enquiry.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-lg bg-[#f1f5f1] p-5">
          <MessageCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-forest" />
          <p className="text-sm leading-6 text-muted">
            For a quick message, start a WhatsApp chat with our primary support line.
          </p>
        </div>
      </header>

      <section
        className="grid gap-8 py-10 lg:grid-cols-[1.15fr_.85fr] lg:py-14"
        aria-labelledby="support-heading"
      >
        <div>
          <p className="eyebrow">Contact options</p>
          <h2 id="support-heading" className="section-title mt-2">
            Choose how to reach us
          </h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {contacts.map((contact) => (
              <a
                key={contact.number}
                href={contact.href}
                className="group flex items-center justify-between gap-4 py-5 no-underline"
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7f1e9] text-brand-forest">
                    <Phone aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-[.12em] text-muted">
                      {contact.label}
                    </span>
                    <span className="mt-1 block text-xl font-bold text-ink group-hover:text-brand-forest">
                      {contact.number}
                    </span>
                  </span>
                </span>
                <ArrowUpRight aria-hidden="true" className="h-5 w-5 text-brand-forest" />
              </a>
            ))}
          </div>
          <a
            href="https://wa.me/2349122628654?text=Hello%2C%20Arewa%20for%20Asiwaju%20Student%20Wing."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#128c4a] px-4 py-2 text-sm font-bold text-white hover:bg-[#0d753d]"
          >
            <MessageCircle aria-hidden="true" className="h-4 w-4 text-white" stroke="white" />{" "}
            Message on WhatsApp
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-white" stroke="white" />
          </a>
        </div>

        <aside
          className="rounded-lg border border-line bg-surface p-6 sm:p-7"
          aria-labelledby="contact-topics"
        >
          <p className="eyebrow">How we can help</p>
          <h2 id="contact-topics" className="mt-2 text-xl font-bold text-ink">
            Support topics
          </h2>
          <ul className="mt-5 space-y-4">
            {[
              [
                UserRound,
                "Registration and membership",
                "Help with the registration form, membership number, or ID card.",
              ],
              [
                FileLock2,
                "Personal information",
                "Ask about accessing, correcting, or requesting removal of your personal information.",
              ],
              [
                MessageCircle,
                "Movement participation",
                "Ask how to learn about activities and local participation routes.",
              ],
            ].map(([Icon, title, detail]) => {
              const TopicIcon = Icon as typeof UserRound;
              return (
                <li key={title as string} className="flex gap-3 border-t border-line pt-4">
                  <TopicIcon
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-brand-forest"
                  />
                  <div>
                    <h3 className="font-bold text-ink">{title as string}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">{detail as string}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <Link
            href="/privacy"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-forest underline-offset-4 hover:underline"
          >
            Read the privacy notice <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </aside>
      </section>

      <section className="border-t border-line py-9" aria-labelledby="before-contact">
        <h2 id="before-contact" className="text-lg font-bold text-ink">
          When contacting support
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Tell us what you need help with and include the contact details you used to register when
          necessary. Never send your password or one-time sign-in codes. We will use the information
          you provide only to respond to your request, in line with the privacy notice.
        </p>
      </section>
    </PublicPage>
  );
}
