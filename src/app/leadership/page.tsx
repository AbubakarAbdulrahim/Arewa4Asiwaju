import type { Metadata } from "next";
import { PublicPage, PageHeading } from "@/components/public/PublicPage";
import { getPublicLeadership } from "@/lib/content/public-content";

export const metadata: Metadata = {
  title: "Leadership",
  description: "Leadership information for Arewa for Asiwaju.",
  alternates: { canonical: "/leadership" },
};

export default async function LeadershipPage() {
  const leaders = await getPublicLeadership();
  return (
    <PublicPage>
      <PageHeading
        eyebrow="Leadership"
        title="Leadership and structure"
        intro="A4A’s supplied strategic blueprint describes a national advisory role, executive coordination, and decentralised state structures."
      />
      {leaders.length === 0 && (
        <div className="notice mb-8">
          <p className="font-bold text-ink">Roster confirmation required</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            The source document names office holders, but the organisation has not supplied
            confirmation that these appointments are current and approved for public display. Names
            are withheld until an authorised roster is provided.
          </p>
        </div>
      )}
      {leaders.length > 0 && (
        <section
          aria-label="Published leadership roster"
          className="mb-8 divide-y divide-line border-y border-line"
        >
          {leaders.map((leader) => (
            <article key={leader.id} className="grid gap-3 py-5 sm:grid-cols-[1fr_2fr]">
              {" "}
              <div>
                <h2 className="text-lg font-bold">{leader.full_name}</h2>
                <p className="font-semibold text-brand-forest">{leader.title}</p>
                {leader.unit_name && <p className="mt-1 text-sm text-muted">{leader.unit_name}</p>}
              </div>
              <p className="text-sm text-muted">{leader.biography || ""}</p>
            </article>
          ))}
        </section>
      )}
      <section aria-labelledby="structure-heading">
        <h2 id="structure-heading" className="section-title">
          Roles described in the movement framework
        </h2>
        <dl className="mt-5 divide-y divide-line border-y border-line">
          {[
            ["Board of Trustees", "National advisory and ideological oversight"],
            ["Director-General", "Executive implementation and strategy"],
            ["Zonal coordination", "Zonal mobilisation and operational coordination"],
            ["State and grassroots executives", "State, LGA, ward, and community outreach"],
          ].map(([role, description]) => (
            <div key={role} className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr]">
              <dt className="font-bold text-ink">{role}</dt>
              <dd className="text-sm text-muted">{description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </PublicPage>
  );
}
