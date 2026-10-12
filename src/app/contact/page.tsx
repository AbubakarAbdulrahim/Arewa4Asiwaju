import type { Metadata } from "next";
import { PublicPage, PageHeading } from "@/components/public/PublicPage";

export const metadata: Metadata = {
  title: "Contact and support",
  description: "Contact information and support options for Arewa for Asiwaju.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PublicPage>
      <PageHeading
        eyebrow="Contact"
        title="Contact and support"
        intro="For questions about membership or your personal information, contact the Arewa for Asiwaju Students’ Wing using either published support number."
      />
      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        <a
          className="surface p-5 transition-colors hover:border-brand-forest"
          href="tel:09122628654"
        >
          <span className="text-xs font-bold uppercase tracking-wide text-muted">Call support</span>
          <span className="mt-2 block text-xl font-bold text-brand-forest">09122628654</span>
        </a>
        <a
          className="surface p-5 transition-colors hover:border-brand-forest"
          href="tel:009013113304"
        >
          <span className="text-xs font-bold uppercase tracking-wide text-muted">Call support</span>
          <span className="mt-2 block text-xl font-bold text-brand-forest">009013113304</span>
        </a>
      </div>
    </PublicPage>
  );
}
