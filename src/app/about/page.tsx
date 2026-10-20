import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Eye } from "lucide-react";
import { PublicPage, PageHeading } from "@/components/public/PublicPage";

export const metadata: Metadata = {
  title: "About the Student Wing",
  description:
    "Purpose, mission, vision, and grassroots organising framework of the Arewa for Asiwaju Student Wing across Northern Nigeria.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About the Arewa for Asiwaju Student Wing",
    description:
      "A student-led civic mobilisation movement connecting northern youth with national policy.",
  },
};

const hierarchy = [
  {
    tier: "01",
    name: "National leadership",
    summary: "Sets movement-wide priorities, student advocacy strategy, and national alignment.",
  },
  {
    tier: "02",
    name: "Zonal coordination",
    summary:
      "Connects chapters across the North-West, North-East, and North-Central geopolitical zones.",
  },
  {
    tier: "03",
    name: "State chapters",
    summary:
      "Active state-level executives spanning all 19 northern states and the Federal Capital Territory.",
  },
  {
    tier: "04",
    name: "Local government areas",
    summary: "Coordinates student delegates across 419 northern local council areas.",
  },
  {
    tier: "05",
    name: "Ward networks",
    summary: "Grassroots outreach connecting campus students with community ward delegates.",
  },
  {
    tier: "06",
    name: "Campus units",
    summary: "Student executives inside universities, polytechnics, and colleges of education.",
  },
];

const focusAreas = [
  {
    title: "Education and opportunity",
    sentence:
      "Expand awareness of student loan financing, tertiary bursaries, and vocational training access across northern institutions.",
  },
  {
    title: "Agriculture and food security",
    sentence:
      "Connect agricultural science students and rural youth with national agrarian initiatives and regional agribusiness programs.",
  },
  {
    title: "Infrastructure and regional connectivity",
    sentence:
      "Track and explain major highway, rail, and energy investments connecting northern industrial and agricultural corridors.",
  },
  {
    title: "Civic information and youth participation",
    sentence:
      "Promote respectful, evidence-based political education and active voter participation among the emerging generation.",
  },
];

export default function AboutPage() {
  return (
    <PublicPage>
      {/* Editorial Page Header */}
      <PageHeading
        eyebrow="Movement profile"
        title="Students in every northern state, organised ward by ward"
        intro="The Arewa for Asiwaju Student Wing is a regional civic movement organising university, polytechnic, and college students across Northern Nigeria to connect young people with public policy and the Renewed Hope Agenda."
      />

      {/* Editorial Long-Form Overview */}
      <section className="border-b border-line pb-12 sm:pb-16" aria-label="Movement background">
        <div className="max-w-3xl space-y-5 text-base leading-relaxed text-muted sm:text-lg sm:leading-8">
          <p>
            Northern Nigeria is home to the country’s largest youth cohort, with millions of
            undergraduates and vocational scholars seeking practical educational support, modern
            infrastructure, and long-term economic security.
          </p>
          <p>
            A4A Student Wing builds a direct bridge between these students and federal policy. By
            establishing structured leadership from the national executive down to campus unions and
            local government councils, the movement turns national policies into local,
            understandable initiatives.
          </p>
        </div>
      </section>

      {/* Mission & Vision Pull Statements (Anchored for /mission redirects) */}
      <section
        id="mission"
        className="scroll-mt-20 border-b border-line py-12 sm:py-16"
        aria-labelledby="mission-vision-heading"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Mission Pull Statement */}
          <div className="rounded-md border border-line bg-surface p-7 sm:p-9 shadow-xs">
            <div className="flex items-center gap-2.5 text-brand-forest">
              <Compass aria-hidden="true" className="h-5 w-5" />
              <h2
                id="mission-vision-heading"
                className="text-xs font-bold uppercase tracking-wider"
              >
                Our mission
              </h2>
            </div>
            <blockquote className="mt-4 text-xl font-bold leading-snug text-ink sm:text-2xl">
              “To organise and empower students and young people across Northern Nigeria, connect
              them with civic and policy conversations, and make public priorities clear and
              relevant to local communities.”
            </blockquote>
          </div>

          {/* Vision Pull Statement */}
          <div className="rounded-md border border-line bg-surface p-7 sm:p-9 shadow-xs">
            <div className="flex items-center gap-2.5 text-brand-forest">
              <Eye aria-hidden="true" className="h-5 w-5" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Our vision</h3>
            </div>
            <blockquote className="mt-4 text-xl font-bold leading-snug text-ink sm:text-2xl">
              “A connected, informed, and active generation of northern students contributing to
              stronger communities and a more prosperous future for the region.”
            </blockquote>
          </div>
        </div>
      </section>

      {/* The Organising Hierarchy: Vertical Numbered Path (ONLY place numbers are used) */}
      <section className="border-b border-line py-12 sm:py-16" aria-labelledby="hierarchy-heading">
        <div className="max-w-2xl">
          <p className="eyebrow">Grassroots structure</p>
          <h2 id="hierarchy-heading" className="section-title mt-2">
            The organising hierarchy
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            From national oversight to campus units, our governance framework ensures every student
            delegate has a voice.
          </p>
        </div>

        <ol className="mt-8 divide-y divide-line border-y border-line">
          {hierarchy.map(({ tier, name, summary }) => (
            <li
              key={tier}
              className="grid gap-2 py-5 sm:grid-cols-[5rem_14rem_1fr] sm:items-baseline sm:gap-6 sm:py-6"
            >
              <span className="font-mono text-base font-extrabold text-brand-forest sm:text-lg">
                {tier}
              </span>
              <h3 className="text-base font-bold text-ink sm:text-lg">{name}</h3>
              <p className="text-sm leading-relaxed text-muted sm:text-base">{summary}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* What We Focus On */}
      <section className="py-12 sm:py-16" aria-labelledby="focus-heading">
        <div className="max-w-2xl">
          <p className="eyebrow">Core focus</p>
          <h2 id="focus-heading" className="section-title mt-2">
            What we focus on
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Four pillars that define student engagement and community advocacy.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {focusAreas.map(({ title, sentence }) => (
            <div
              key={title}
              className="rounded-md border border-line bg-surface p-5 sm:p-6 shadow-xs"
            >
              <h3 className="font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{sentence}</p>
            </div>
          ))}
        </div>

        <div className="responsive-cta-group mt-10 flex gap-3">
          <Link href="/register" className="button-primary">
            Join the Student Wing
          </Link>
          <Link href="/leadership" className="button-secondary">
            View Leadership Structure
          </Link>
        </div>
      </section>
    </PublicPage>
  );
}
