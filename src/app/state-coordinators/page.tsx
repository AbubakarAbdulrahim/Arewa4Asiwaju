import type { Metadata } from "next";
import { PublicPage, PageHeading } from "@/components/public/PublicPage";
import { StateCoordinatorDirectory } from "@/components/public/StateCoordinatorDirectory";
import {
  buildCoordinatorDirectoryFromLeadership,
  type DirectoryCoordinator,
} from "@/lib/content/coordinator-directory";
import { getPublicLeadership, type PublicLeader } from "@/lib/content/public-content";

export const metadata: Metadata = {
  title: "State coordinators",
  description: "Directory of verified state coordinators and movement leaders across northern Nigeria.",
  alternates: { canonical: "/state-coordinators" },
  openGraph: {
    title: "State coordinators | Arewa for Asiwaju",
    description: "Search and browse the movement's state coordinators and campus chapter leaders.",
  },
};

function normaliseCoordinator(leader: PublicLeader): DirectoryCoordinator {
  return {
    id: leader.id,
    full_name: leader.full_name,
    title: leader.title,
    unit_name: leader.unit_name,
    state: (() => {
      const entry = `${leader.unit_name ?? ""} ${leader.title}`.trim();
      const states = [
        "Adamawa",
        "Bauchi",
        "Benue",
        "Borno",
        "FCT",
        "Gombe",
        "Jigawa",
        "Kaduna",
        "Kano",
        "Katsina",
        "Kebbi",
        "Kogi",
        "Kwara",
        "Nasarawa",
        "Niger",
        "Plateau",
        "Sokoto",
        "Taraba",
        "Yobe",
        "Zamfara",
      ];
      const match = states.find((state) => entry.toLowerCase().includes(state.toLowerCase()));
      if (match) return match;
      if (/north[- ]?west/i.test(entry)) return "North-West";
      if (/north[- ]?east/i.test(entry)) return "North-East";
      if (/north[- ]?central/i.test(entry)) return "North-Central";
      return "Northern Nigeria";
    })(),
    biography: leader.biography,
    photo_url: leader.photo_url,
    phone: null,
    email: null,
  };
}

export default async function StateCoordinatorsPage({
  searchParams,
}: {
  searchParams?: Promise<{ highlight?: string } | Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const highlightId = typeof params.highlight === "string" ? params.highlight : undefined;

  const leaders = await getPublicLeadership();
  const candidates = buildCoordinatorDirectoryFromLeadership(leaders);
  const coordinators = candidates.length
    ? candidates
    : leaders
        .filter((leader) => {
          const haystack = `${leader.full_name} ${leader.title} ${leader.unit_name ?? ""}`.toLowerCase();
          return /state|zonal|coordinator|campus|director|mobilizer|chapter/i.test(haystack);
        })
        .map(normaliseCoordinator);

  return (
    <PublicPage>
      <PageHeading
        eyebrow="Movement directory"
        title="State coordinators and chapter leaders"
        intro="Search the movement's state representatives, zonal leads, and campus chapter coordinators across Northern Nigeria."
      />

      <section className="rounded-md border border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Verified outreach</p>
            <h2 className="mt-2 text-2xl font-extrabold text-ink">
              A clear route to the right state representative
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/contact?subject=Coordinator-Enquiry" className="button-primary text-sm">
              Contact the desk
            </a>
            <a href="/leadership" className="button-secondary text-sm">
              Back to leadership
            </a>
          </div>
        </div>
      </section>

      <StateCoordinatorDirectory initialCoordinators={coordinators} highlightId={highlightId} />
    </PublicPage>
  );
}
