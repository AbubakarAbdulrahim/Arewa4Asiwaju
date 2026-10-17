import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, MapPin, Users, Mail, UserCheck } from "lucide-react";
import { PublicPage, PageHeading } from "@/components/public/PublicPage";
import { getPublicLeadership } from "@/lib/content/public-content";

export const metadata: Metadata = {
  title: "Leadership and organisation",
  description:
    "Student wing leadership and grassroots governance structure across Northern Nigeria.",
  alternates: { canonical: "/leadership" },
  openGraph: {
    title: "Leadership and organisation | Arewa for Asiwaju",
    description: "Structure and coordinators of the A4A Student Wing across Northern Nigeria.",
  },
};

const tiers = [
  {
    tier: "01",
    title: "National executive",
    text: "Provides overall movement direction, student advocacy strategy, and alignment with national policy priorities.",
    icon: Building2,
  },
  {
    tier: "02",
    title: "Zonal coordination",
    text: "Leads collaboration across the North-West, North-East, and North-Central regions, linking states with shared regional priorities.",
    icon: MapPin,
  },
  {
    tier: "03",
    title: "State chapters",
    text: "Directs state executive councils across all 19 northern states and the FCT, organising campus-wide mobilisations.",
    icon: Users,
  },
  {
    tier: "04",
    title: "Local government councils",
    text: "Coordinates student delegates in 419 local councils, connecting town and gown initiatives.",
    icon: Building2,
  },
  {
    tier: "05",
    title: "Ward networks",
    text: "Organises grassroots student outreach, voter education, and community advocacy at ward levels.",
    icon: MapPin,
  },
  {
    tier: "06",
    title: "Campus units",
    text: "Campus student committees inside universities, polytechnics, and colleges of education across the North.",
    icon: Users,
  },
];

export default async function LeadershipPage() {
  const leaders = await getPublicLeadership();

  return (
    <PublicPage>
      <PageHeading
        eyebrow="Leadership & governance"
        title="Students in every northern state, organised ward by ward"
        intro="A4A connects student leadership from national strategic direction through zonal, state, local government, ward, and campus units."
      />

      {/* Directory Section */}
      <section className="pb-12 sm:pb-16" aria-labelledby="directory-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-line pb-4">
          <div>
            <p className="eyebrow">Directory</p>
            <h2 id="directory-heading" className="section-title mt-2">
              State and zonal coordinators
            </h2>
          </div>
          <p className="text-sm text-muted">
            Verified student leaders and regional representatives.
          </p>
        </div>

        {leaders.length === 0 ? (
          <div className="mt-8 rounded-md border border-line bg-surface p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#e8f2ea] text-brand-forest">
                <UserCheck aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-ink sm:text-xl">
                  Leadership structure in place across 19 northern states and the FCT
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                  Chapters are active across every northern geopolitical zone. If you are an active
                  student or youth delegate interested in coordinating activities on your campus or
                  in your state, contact our national coordination desk.
                </p>
                <div className="mt-5">
                  <Link
                    href="/contact?subject=State-Coordinator-Application"
                    className="button-primary inline-flex items-center gap-2 text-sm"
                  >
                    <span>Interested in coordinating your state? Contact us</span>
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {leaders.map((leader) => (
              <article
                key={leader.id}
                className="overflow-hidden rounded-md border border-line bg-surface shadow-xs transition-shadow hover:shadow-sm"
              >
                {leader.photo_url ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper">
                    <Image
                      src={leader.photo_url}
                      alt={leader.full_name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-28 items-center justify-center bg-[#e8f2ea] text-brand-forest">
                    <span className="font-mono text-xl font-bold">
                      {leader.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-forest">
                    {leader.unit_name || "Movement Leadership"}
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-ink">{leader.full_name}</h3>
                  <p className="mt-0.5 text-sm font-semibold text-muted">{leader.title}</p>
                  {leader.biography && (
                    <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-3">
                      {leader.biography}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Governance Framework Diagram */}
      <section className="border-t border-line py-12 sm:py-16" aria-labelledby="framework-heading">
        <div className="max-w-2xl">
          <p className="eyebrow">Governance structure</p>
          <h2 id="framework-heading" className="section-title mt-2">
            Organised from national oversight to campus units
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Our multi-tier structure ensures accountable communication, regional representation, and
            swift mobilization.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map(({ tier, title, text }) => (
            <div
              key={title}
              className="rounded-md border border-line bg-surface p-5 sm:p-6 shadow-xs"
            >
              <span className="font-mono text-xs font-bold text-brand-forest">{tier}</span>
              <h3 className="mt-2 text-base font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coordinator Call to Action Banner */}
      <section className="rounded-md bg-brand-forest p-6 text-white sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Lead on your campus or in your community
            </h2>
            <p className="mt-2 text-sm text-white/85 sm:text-base leading-relaxed">
              We are actively appointing campus ambassadors and ward executives across Northern
              Nigeria.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contact?subject=Coordinator-Enquiry"
              className="button-primary button-on-dark font-bold text-sm"
            >
              <Mail aria-hidden="true" className="h-4 w-4" />
              <span>Contact coordinator desk</span>
            </Link>
            <Link href="/register" className="button-secondary button-on-green text-sm">
              <span>Join as member</span>
            </Link>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
