import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenText, Landmark, MapPinned, UsersRound } from "lucide-react";
import { PublicPage } from "@/components/public/PublicPage";

export const metadata: Metadata = {
  title: "About the Arewa for Asiwaju Student Wing",
  description:
    "Learn about the purpose, priorities, and grassroots structure of the Arewa for Asiwaju Student Wing.",
  alternates: { canonical: "/about" },
};

const priorities = [
  {
    number: "01",
    title: "Organise locally",
    description:
      "Build connected state, local government, ward, and campus structures that give students and communities a clear way to participate.",
    icon: MapPinned,
  },
  {
    number: "02",
    title: "Explain policy",
    description:
      "Make public policy easier to understand by connecting national priorities with the everyday questions people raise in their communities.",
    icon: BookOpenText,
  },
  {
    number: "03",
    title: "Include young people",
    description:
      "Create practical opportunities for students and young people to contribute to advocacy, community activity, and leadership.",
    icon: UsersRound,
  },
];

const focusAreas = [
  ["Education and opportunity", "Support informed participation by students and young people."],
  ["Agriculture and food security", "Share clear information about policies affecting northern livelihoods."],
  ["Infrastructure and connectivity", "Help communities understand public projects and their local relevance."],
  ["Civic information", "Encourage respectful discussion grounded in verifiable public information."],
];

export default function AboutPage() {
  return (
    <PublicPage>
      <header className="relative isolate overflow-hidden rounded-xl bg-brand-forest px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
        <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-gradient-to-l from-[#034d28] to-transparent" />
        <p className="text-xs font-bold uppercase tracking-[.18em] text-white/75">
          About the movement
        </p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              A student wing connecting policy, people, and local action.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              Arewa for Asiwaju Student Wing is part of the wider Arewa for Asiwaju movement. It
              focuses on student participation, grassroots organisation, and making public
              priorities easier to discuss across Northern Nigeria.
            </p>
          </div>
          <div className="border-l border-white/25 pl-5 lg:justify-self-end lg:max-w-xs">
            <p className="text-sm font-semibold text-white/70">Our organising footprint</p>
            <p className="mt-2 text-2xl font-bold">19 northern states + FCT</p>
            <p className="mt-2 text-sm leading-6 text-white/75">
              A framework for state, LGA, ward, student, and community engagement.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/register" className="button-primary button-on-dark">
            Join the Student Wing <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link
            href="/leadership"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-white/45 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
          >
            Explore the structure
          </Link>
        </div>
      </header>

      <section className="grid gap-8 py-12 lg:grid-cols-[.75fr_1.25fr] lg:py-16">
        <div>
          <p className="eyebrow">Our purpose</p>
          <h2 className="section-title mt-3">Make participation clear, local, and meaningful.</h2>
        </div>
        <div className="space-y-4 text-base leading-7 text-muted">
          <p>
            The Student Wing helps young people take part in the movement through organised
            communication, public engagement, and opportunities to contribute ideas and energy.
            Its work links student communities with the wider grassroots structure.
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
        <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
          {priorities.map(({ number, title, description, icon: Icon }) => (
            <article key={number} className="bg-surface p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-brand-ochre">{number}</span>
                <Icon aria-hidden="true" className="h-5 w-5 text-brand-forest" />
              </div>
              <h3 className="mt-7 text-xl font-bold text-ink">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
            </article>
          ))}
        </div>
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

      <section className="rounded-lg border border-line bg-[#f1f5f1] p-6 sm:p-8" aria-labelledby="structure-title">
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <Landmark aria-hidden="true" className="h-6 w-6 text-brand-forest" />
            <p className="eyebrow mt-4">How we are organised</p>
            <h2 id="structure-title" className="section-title mt-2">
              Connected from national coordination to local communities.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink">
            {["National", "Zone", "State", "LGA", "Ward", "Campus & community"].map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                <span className="rounded-sm border border-line bg-white px-3 py-2">{item}</span>
                {index < 5 && <span aria-hidden="true" className="text-brand-ochre">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
