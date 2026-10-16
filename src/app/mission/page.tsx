import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, MapPinned, UsersRound } from "lucide-react";
import { PublicPage, PageHeading } from "@/components/public/PublicPage";

export const metadata: Metadata = {
  title: "Mission and objectives",
  description:
    "The grassroots mobilisation, policy advocacy, and participation objectives of Arewa for Asiwaju.",
  alternates: { canonical: "/mission" },
  openGraph: {
    title: "Mission and objectives | Arewa for Asiwaju",
    description: "How A4A connects policy communication and community participation.",
  },
};

const objectives = [
  {
    title: "Grassroots mobilisation",
    text: "Build state, local government, ward, and community structures that connect movement activity with local voices.",
    icon: MapPinned,
  },
  {
    title: "Policy advocacy and translation",
    text: "Explain federal policy priorities, including the Renewed Hope Agenda, in clear language and relevant local contexts.",
    icon: BookOpen,
  },
  {
    title: "Youth and student participation",
    text: "Create meaningful opportunities for young people and students to take part in civic learning, advocacy, and leadership.",
    icon: UsersRound,
  },
];

export default function MissionPage() {
  return (
    <PublicPage>
      <PageHeading
        eyebrow="Mission and objectives"
        title="Connect public priorities with local participation"
        intro="Arewa for Asiwaju is a political mobilisation and advocacy movement working across Northern Nigeria. Its strategic framework focuses on grassroots organisation, policy communication, public information, and youth inclusion."
      />
      <section aria-labelledby="objectives" className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
        <div>
          <h2 id="objectives" className="section-title">
            What guides our work
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            This summary reflects the movement overview provided for the platform. Public claims
            about specific government outcomes require separate sourcing.
          </p>
        </div>
        <ol className="divide-y divide-line border-y border-line">
          {objectives.map(({ title, text, icon: Icon }, i) => (
            <li key={title} className="flex gap-4 py-5">
              <span className="font-mono text-sm font-bold text-brand-ochre">0{i + 1}</span>
              <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-forest" />
              <div>
                <h3 className="font-bold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-12 border-t border-line pt-8">
        <h2 className="section-title">Regional context</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          The supplied movement framework identifies the Renewed Hope Agenda as its central policy
          reference and notes region-specific frameworks such as HEARTS in North Central. These
          references describe A4A&apos;s advocacy approach; they do not constitute independent
          evaluation of policy results.
        </p>
        <Link className="button-primary mt-6" href="/about">
          About the movement <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </section>
    </PublicPage>
  );
}
