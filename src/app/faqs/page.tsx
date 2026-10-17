import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { PublicPage, PageHeading } from "@/components/public/PublicPage";
import { FaqAccordion } from "@/components/public/FaqAccordion";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Find answers about A4A Student Wing registration, digital ID card verification, membership numbers, and data privacy.",
  alternates: { canonical: "/faqs" },
  openGraph: {
    title: "Frequently asked questions | Arewa for Asiwaju Student Wing",
    description: "Guidance on cards, verification, membership numbers, and privacy.",
  },
};

export default function FAQsPage() {
  return (
    <PublicPage>
      <PageHeading
        eyebrow="Help center"
        title="Frequently asked questions"
        intro="Clear answers regarding student registration, membership numbers, ID card verification, and privacy protections across the 19 northern states and the FCT."
      />

      <section aria-labelledby="faqs-accordion-heading">
        <h2 id="faqs-accordion-heading" className="sr-only">
          Questions and answers
        </h2>
        <FaqAccordion />
      </section>

      {/* Still need help callout */}
      <section className="mt-12 rounded-md border border-line bg-paper p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">Have a question not listed here?</h3>
            <p className="mt-1 text-sm text-muted">
              Our student support team is available on WhatsApp and telephone to assist you.
            </p>
          </div>
          <Link
            href="/contact"
            className="button-primary inline-flex items-center gap-2 text-sm shrink-0"
          >
            <MessageCircle aria-hidden="true" className="h-4 w-4" />
            <span>Contact support desk</span>
          </Link>
        </div>
      </section>
    </PublicPage>
  );
}
