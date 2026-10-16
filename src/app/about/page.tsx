import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Landmark } from "lucide-react";
import { PublicPage, PageHeading } from "@/components/public/PublicPage";

export const metadata: Metadata = {
  title: "About the Arewa for Asiwaju Student Wing",
  description:
    "Learn about the purpose, priorities, and grassroots structure of the Arewa for Asiwaju Student Wing.",
  alternates: { canonical: "/about" },
};

const priorities = [
  {
    title: "Organise locally",
    description:
      "Build connected state, local government, ward, and campus structures that give students and communities a clear way to participate.",
  },
  {
    title: "Explain policy",
    description:
      "Make public policy easier to understand by connecting national priorities with the everyday questions people raise in their communities.",
  },
  {
    title: "Include young people",
    description:
      "Create practical opportunities for students and young people to contribute to advocacy, community activity, and leadership.",
  },
];

const focusAreas = [
  ["Education and opportunity", "Support informed participation by students and young people."],
  [
    "Agriculture and food security",
    "Share clear information about policies affecting northern livelihoods.",
  ],
  [
    "Infrastructure and connectivity",
    "Help communities understand public projects and their local relevance.",
  ],
  [
    "Civic information",
    "Encourage respectful discussion grounded in verifiable public information.",
  ],
];

export default function AboutPage() {
  return (
    <PublicPage>
      <PageHeading
        eyebrow="About the movement"
        title="A student wing connecting policy, people, and local action"
        intro="Arewa for Asiwaju Student Wing is part of the wider Arewa for Asiwaju movement. It focuses on student participation, grassroots organisation, and making public priorities easier to discuss across Northern Nigeria."
      />

      <section className="border-b border-line py-5 sm:py-6" aria-label="Organisational framework">
        <div className="grid gap-2 sm:grid-cols-[12rem_1fr] sm:items-center sm:gap-6">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-brand-forest">
            Organising framework
          </p>
          <p className="text-sm leading-6 text-muted">
            The supplied framework describes a presence across the 19 northern states and the FCT,
            organised through state, LGA, ward, student, and community structures. This describes
            the intended framework, not verified live chapter coverage.
          </p>
        </div>
      </section>

      <section className="grid gap-8 py-12 lg:grid-cols-[.75fr_1.25fr] lg:py-16">
        <div>
          <p className="eyebrow">Our purpose</p>
          <h2 className="section-title mt-3">Make participation clear, local, and meaningful.</h2>
        </div>
        <div className="space-y-4 text-base leading-7 text-muted">
          <p>
            The Student Wing helps young people take part in the movement through organised
            communication, public engagement, and opportunities to contribute ideas and energy. Its
            work links student communities with the wider grassroots structure.
          </p>
          <p>
            The movement framework aligns its advocacy with the Renewed Hope Agenda. The Student
            Wing can support that work by explaining policy in accessible language, listening to
            local concerns, and pointing people to reliable public information.
          </p>
        </div>
      </section>

      <section className="border-y border-line py-12 lg:py-16" aria-labelledby="priorities-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Our priorities</p>
            <h2 id="priorities-title" className="section-title mt-3 max-w-2xl">
              A practical approach to student mobilisation
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted">
            These priorities guide how the Student Wing communicates and builds participation.
          </p>
        </div>
        <ol className="mt-7 divide-y divide-line border-y border-line">
          {priorities.map(({ title, description }, index) => (
            <li
              key={title}
              className="grid gap-2 py-5 sm:grid-cols-[3rem_0.8fr_1.2fr] sm:items-baseline sm:gap-5"
            >
              <span className="font-mono text-sm font-bold text-brand-ochre">0{index + 1}</span>
              <h3 className="font-bold text-ink">{title}</h3>
              <p className="text-sm leading-6 text-muted">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-8 py-12 lg:grid-cols-[.75fr_1.25fr] lg:py-16">
        <div>
          <p className="eyebrow">Policy and community</p>
          <h2 className="section-title mt-3">Topics that matter across the region</h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            These are areas named in the movement framework. Published claims about specific
            government projects should include reliable sources and clear dates.
          </p>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {focusAreas.map(([title, description]) => (
            <article key={title} className="grid gap-2 py-4 sm:grid-cols-[.8fr_1.2fr] sm:gap-6">
              <h3 className="font-bold text-ink">{title}</h3>
              <p className="text-sm leading-6 text-muted">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line py-8 sm:py-10" aria-labelledby="structure-title">
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <Landmark aria-hidden="true" className="h-6 w-6 text-brand-forest" />
            <p className="eyebrow mt-4">How we are organised</p>
            <h2 id="structure-title" className="section-title mt-2">
              Connected from national coordination to local communities.
            </h2>
          </div>
          <ol className="grid grid-cols-2 gap-x-5 sm:grid-cols-3">
            {["National", "Zone", "State", "LGA", "Ward", "Campus and community"].map(
              (item, index) => (
                <li
                  key={item}
                  className="flex min-h-12 items-center gap-3 border-b border-line py-2 text-sm font-semibold text-ink"
                >
                  <span className="font-mono text-xs text-brand-forest">0{index + 1}</span>
                  {item}
                </li>
              ),
            )}
          </ol>
        </div>
      </section>

      <div className="flex flex-col gap-3 py-10 sm:flex-row">
        <Link href="/register" className="button-primary">
          Join the Student Wing <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
        <Link href="/leadership" className="button-secondary">
          Explore the leadership structure
        </Link>
      </div>
    </PublicPage>
  );
}
