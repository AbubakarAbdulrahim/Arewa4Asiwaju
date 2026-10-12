import type { Metadata } from "next";
import { PublicPage, PageHeading } from "@/components/public/PublicPage";

export const metadata: Metadata = {
  title: "Website terms",
  description: "Draft terms for use of the Arewa for Asiwaju website.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <PublicPage>
      <PageHeading
        eyebrow="Terms"
        title="Website terms of use"
        intro="This draft explains the intended scope of the public website and requires organisational and legal approval before publication as binding terms."
      />
      <div className="notice mb-8 max-w-3xl">
        <p className="font-bold text-ink">Draft — pending approval</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The organisation has not supplied its legal identity, governing contact details, or
          approved terms. These draft terms are informational and should not be treated as a final
          agreement.
        </p>
      </div>
      <div className="max-w-3xl space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-lg font-bold text-ink">Using this website</h2>
          <p className="mt-2">
            Use public information lawfully and do not attempt to access accounts, records, or
            services you are not authorised to use. Published movement content represents the
            information approved for public display at the time it appears.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-ink">Membership and verification</h2>
          <p className="mt-2">
            Membership registration and card services are subject to their published availability
            and verification requirements. A public card check confirms limited card status only; it
            is not an identity document or proof of any other status.
          </p>
        </section>
        <p>Last updated: 10 October 2026. Draft status: not approved.</p>
      </div>
    </PublicPage>
  );
}
