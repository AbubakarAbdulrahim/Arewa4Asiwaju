import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Landmark, MapPinned, Megaphone, UsersRound } from "lucide-react";

export const metadata: Metadata = {
  title: "About the Arewa for Asiwaju Student Wing",
  description:
    "The purpose, objectives, and organising structure of the Arewa for Asiwaju Student Wing.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About the Arewa for Asiwaju Student Wing",
    description: "The purpose, objectives, and organising structure of the Student Wing.",
  },
};

const objectives = [
  [
    "Grassroots mobilisation",
    "Develop movement structures down to ward level across the 19 northern states and the FCT.",
  ],
  [
    "Policy advocacy",
    "Explain federal programmes and the Renewed Hope Agenda in ways that connect with local priorities.",
  ],
  [
    "Public information",
    "Share information about federal activity in infrastructure, agriculture, security, and other areas, with clear sourcing for published claims.",
  ],
  [
    "Youth and student inclusion",
    "Support youth and student participation, civic learning, and leadership development within the movement.",
  ],
];

const structure = [
  {
    title: "State chapters",
    text: "Coordinate movement activity and provide a consistent structure across state lines.",
    icon: MapPinned,
  },
  {
    title: "Youth and student wings",
    text: "Create participation routes for young people through town halls, rallies, and digital awareness work.",
    icon: UsersRound,
  },
  {
    title: "Grassroots wards",
    text: "Bring campaign information into communities and support communication in relevant local languages.",
    icon: Megaphone,
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="site-container flex-1 py-12 sm:py-16">
        <header className="max-w-3xl border-b border-line pb-9">
          <p className="eyebrow">Movement overview</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Arewa for Asiwaju Student Wing
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            The Student Wing is part of Arewa for Asiwaju, a political mobilisation and advocacy
            movement working across Northern Nigeria to connect federal priorities with grassroots
            communities.
          </p>
          <p className="mt-4 text-sm text-muted">
            Its work is aligned with the Renewed Hope Agenda and organised across the 19 northern
            states and the Federal Capital Territory.
          </p>
        </header>

        <section
          className="grid gap-10 border-b border-line py-10 lg:grid-cols-[.7fr_1.3fr]"
          aria-labelledby="objectives-title"
        >
          <div>
            <p className="eyebrow">What guides the work</p>
            <h2 id="objectives-title" className="section-title mt-3">
              Strategic objectives
            </h2>
          </div>
          <ol className="divide-y divide-line border-y border-line">
            {objectives.map(([title, text], index) => (
              <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
                <span className="pt-0.5 font-mono text-xs font-bold text-brand-ochre">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="font-bold text-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="grid gap-10 border-b border-line py-10 lg:grid-cols-[.7fr_1.3fr]"
          aria-labelledby="policy-title"
        >
          <div>
            <p className="eyebrow">Policy alignment</p>
            <h2 id="policy-title" className="section-title mt-3">
              Advocacy informed by public priorities
            </h2>
          </div>
          <div className="space-y-5 text-sm leading-relaxed text-muted">
            <div className="flex gap-3">
              <Landmark aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-brand-forest" />
              <p>
                <strong className="text-ink">Renewed Hope Agenda.</strong> A4A’s campaign framework
                centres on interpreting its policies for northern communities, including agriculture
                and food security, education initiatives, and regional infrastructure.
              </p>
            </div>
            <p>
              Regional messaging may also reflect sub-regional priorities. The movement overview
              identifies the HEARTS Agenda as one example for North Central. Specific policy claims
              on this site should be linked to reliable sources before publication.
            </p>
          </div>
        </section>

        <section className="py-10" aria-labelledby="structure-title">
          <p className="eyebrow">How A4A is organised</p>
          <h2 id="structure-title" className="section-title mt-3 max-w-2xl">
            A connected structure from state chapters to local communities
          </h2>
          <div className="mt-7 divide-y divide-line border-y border-line">
            {structure.map(({ title, text, icon: Icon }) => (
              <article key={title} className="flex gap-4 py-5">
                <Icon aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-brand-forest" />
                <div>
                  <h3 className="font-bold text-ink">{title}</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="notice mt-2 flex flex-col gap-3 rounded-r-md sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink">
            Interested in participating? Register your interest with A4A.
          </p>
          <Link className="button-primary w-full sm:w-auto" href="/register">
            Registration <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
