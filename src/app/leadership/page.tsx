import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, MapPinned, ShieldCheck, UsersRound } from "lucide-react";
import { PublicPage } from "@/components/public/PublicPage";
import { getPublicLeadership } from "@/lib/content/public-content";

export const metadata: Metadata = {
  title: "Leadership and organisation",
  description:
    "Explore the governance and grassroots structure of Arewa for Asiwaju and its Student Wing.",
  alternates: { canonical: "/leadership" },
};

const tiers = [
  {
    title: "National leadership",
    text: "Provides movement-wide direction, strategic coordination, and alignment around shared priorities.",
    icon: Building2,
  },
  {
    title: "Zonal and state coordination",
    text: "Connects regional context with state chapters and helps coordinate activity across state lines.",
    icon: MapPinned,
  },
  {
    title: "LGA, ward, and student structures",
    text: "Creates local routes for communication, participation, and community-level engagement.",
    icon: UsersRound,
  },
];

export default async function LeadershipPage() {
  const leaders = await getPublicLeadership();
  return (
    <PublicPage>
      <header className="grid gap-8 border-b border-line pb-10 lg:grid-cols-[1fr_.65fr] lg:items-end">
        <div>
          <p className="eyebrow">Leadership & organisation</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            A coordinated movement with a local presence.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-7 text-muted">
            A4A&apos;s framework describes leadership and coordination from national oversight through
            regional, state, local government, ward, and student structures.
          </p>
        </div>
        <div className="border-l-2 border-brand-ochre pl-5">
          <p className="text-sm font-bold text-ink">Public leadership directory</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Names and biographies appear here only after they are approved for public display by
            an authorised publisher.
          </p>
        </div>
      </header>

      <section className="py-11 sm:py-14" aria-labelledby="directory-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Directory</p>
            <h2 id="directory-heading" className="section-title mt-2">Movement leadership</h2>
          </div>
          <p className="text-sm text-muted">Official appointments are subject to confirmation.</p>
        </div>
        {leaders.length === 0 ? (
          <div className="mt-6 grid gap-6 rounded-lg border border-line bg-[#f1f5f1] p-6 sm:grid-cols-[auto_1fr] sm:p-8">
            <ShieldCheck aria-hidden="true" className="h-7 w-7 text-brand-forest" />
            <div>
              <h3 className="text-lg font-bold text-ink">Roster confirmation in progress</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                The movement overview supplied for this website identifies some office titles and
                proposed appointments. The public directory will show individual names once the
                current roster and publication approval are confirmed.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {leaders.map((leader) => (
              <article key={leader.id} className="rounded-lg border border-line bg-surface p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[.12em] text-brand-ochre">
                  {leader.unit_name || "Movement leadership"}
                </p>
                <h3 className="mt-2 text-xl font-bold text-ink">{leader.full_name}</h3>
                <p className="mt-1 font-semibold text-brand-forest">{leader.title}</p>
                {leader.biography && <p className="mt-4 text-sm leading-6 text-muted">{leader.biography}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-line py-11 sm:py-14" aria-labelledby="tiers-heading">
        <p className="eyebrow">Organisational framework</p>
        <h2 id="tiers-heading" className="section-title mt-2 max-w-2xl">
          Clear responsibilities at every level
        </h2>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {tiers.map(({ title, text, icon: Icon }, index) => (
            <article key={title} className="border-t-2 border-brand-forest pt-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-ochre">LEVEL 0{index + 1}</span>
                <Icon aria-hidden="true" className="h-5 w-5 text-brand-forest" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-col gap-4 rounded-lg bg-brand-forest p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-xl font-bold">Take part in your local structure</h2>
          <p className="mt-1 text-sm text-white/80">Register to express your interest in joining the Student Wing.</p>
        </div>
        <Link href="/register" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-white px-4 py-2 text-sm font-bold text-brand-forest hover:bg-white/90">
          Register now <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </PublicPage>
  );
}
