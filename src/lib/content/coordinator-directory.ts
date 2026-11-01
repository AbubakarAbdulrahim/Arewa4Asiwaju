export type DirectoryCoordinator = {
  id: string;
  full_name: string;
  title: string;
  unit_name: string | null;
  state: string;
  biography: string;
  photo_url: string | null;
  phone?: string | null;
  email?: string | null;
};

export function deriveStateLabel(unitName: string | null, title: string) {
  const input = `${unitName ?? ""} ${title}`.trim();
  const stateMatches = [
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

  const match = stateMatches.find((state) => input.toLowerCase().includes(state.toLowerCase()));
  if (match) return match;

  if (/north[- ]?west/i.test(input)) return "North-West";
  if (/north[- ]?east/i.test(input)) return "North-East";
  if (/north[- ]?central/i.test(input)) return "North-Central";

  return "Northern Nigeria";
}

export function buildCoordinatorDirectoryFromLeadership(
  leaders: Array<{
    id: string;
    full_name: string;
    title: string;
    biography: string;
    photo_url: string | null;
    unit_name: string | null;
  }>,
): DirectoryCoordinator[] {
  return leaders
    .filter((leader) => {
      const text = `${leader.full_name} ${leader.title} ${leader.unit_name ?? ""}`.toLowerCase();
      return /state|zonal|coordinator|chapter|campus|director|mobilizer/i.test(text);
    })
    .map((leader) => ({
      id: leader.id,
      full_name: leader.full_name,
      title: leader.title,
      unit_name: leader.unit_name,
      state: deriveStateLabel(leader.unit_name, leader.title),
      biography: leader.biography,
      photo_url: leader.photo_url,
      phone: null,
      email: null,
    }))
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}
