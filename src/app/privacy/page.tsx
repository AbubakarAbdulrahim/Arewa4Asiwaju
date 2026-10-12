import type { Metadata } from "next";
import { PublicPage, PageHeading } from "@/components/public/PublicPage";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "Draft privacy information for Arewa for Asiwaju website users.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <PublicPage>
      <PageHeading
        eyebrow="Privacy"
        title="Privacy notice"
        intro="This proposed notice explains how membership information is used and how to contact the Students’ Wing about it."
      />
      <div className="notice mb-8 max-w-3xl">
        <p className="font-bold text-ink">Proposed notice · staging version a4a-staging-v1</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This wording is a working draft for staging, as requested by the organisation. Confirm the
          responsible legal entity and retention period before using it for a public launch.
        </p>
      </div>
      <div className="max-w-3xl space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-lg font-bold text-ink">Information and use</h2>
          <p className="mt-2">
            We use your name, email address, state and Local Government Area to create and manage
            membership, issue and verify your digital membership card, and respond to membership or
            support requests. Access is limited to authorised team members and service providers who
            operate the platform. Public card checks show validity only; they do not display your
            name or contact details.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-ink">Retention and requests</h2>
          <p className="mt-2">
            Membership and consent records are kept while membership is active and for up to 24
            months after it ends, then securely deleted or de-identified unless a legal requirement
            or unresolved claim requires longer. You can ask about your information or request
            access, correction or deletion by calling 09122628654 or 009013113304.
          </p>
        </section>
        <p>
          Registration is intended to remain open continuously; there is no registration closing
          date.
        </p>
      </div>
    </PublicPage>
  );
}
