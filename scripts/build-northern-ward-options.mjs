import { readFile, writeFile } from "node:fs/promises";

const inputPath = process.argv[2] ?? "tmp/inec-wards-source.json";
const geoSource = await readFile("src/lib/geo-data.ts", "utf8");
const wardRows = JSON.parse(await readFile(inputPath, "utf8"));
const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const aliases = new Map([
  ["bauchi|damban", "DAMBAM"],
  ["borno|maiduguri", "MAIDUGURI M. C."],
  ["gombe|yamaltudeba", "YALMALTU/ DEBA"],
  ["jigawa|kirikasama", "KIRIKA SAMMA"],
  ["jigawa|biriniwa", "BIRNIWA"],
  ["kano|dambatta", "DANBATA"],
  ["kano|dawakinkudu", "DAWAKI KUDU"],
  ["kano|dawakintofa", "DAWAKI TOFA"],
  ["kano|garunmallam", "GARUN MALAM"],
  ["katsina|malumfashi", "MALUFASHI"],
  ["kebbi|aleiro", "ALIERO"],
  ["kebbi|arewadandi", "AREWA"],
  ["kebbi|dankowasagu", "WASAGU/DANKO"],
  ["kogi|kogi", "KOGI . K. K."],
  ["kogi|mopamuro", "MOPA MORO"],
  ["kogi|ogorimagongo", "OGORI MANGOGO"],
  ["kwara|pategi", "PATIGI"],
  ["nasarawa|nasarawaegon", "NASARAWA EGGON"],
  ["niger|edati", "EDATTI"],
  ["niger|moya", "MUNYA"],
  ["plateau|barkinladi", "BARIKIN LADI"],
  ["sokoto|gawabawa", "GWADABAWA"],
  ["sokoto|sabonbirni", "S/BIRNI"],
  ["sokoto|wamako", "WAMAKKO"],
  ["yobe|karasuwa", "KARASAWA"],
  ["zamfara|birninmagajikiyaw", "BIRNIN MAGAJI"],
  ["zamfara|chafe", "TSAFE"],
  ["fct|municipalareacouncilamac", "MUNICIPAL"],
]);

const stateBlocks = [
  ...geoSource.matchAll(
    /code:\s*"([A-Z0-9]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?lgas:\s*\[([^\]]*)\]/g,
  ),
];
const wardsByParent = new Map();
for (const row of wardRows) {
  const key = `${normalize(row.state_name)}|${normalize(row.lga_name)}`;
  const wards = wardsByParent.get(key) ?? [];
  wards.push(row.name);
  wardsByParent.set(key, wards);
}

const output = {};
const unmatched = [];
for (const block of stateBlocks) {
  const [, stateCode, stateName, lgaBlock] = block;
  const stateKey = stateCode === "FCT" ? "fct" : normalize(stateName);
  const lgas = [...lgaBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  for (const lgaName of lgas) {
    const alias = aliases.get(`${stateKey}|${normalize(lgaName)}`);
    const key = `${stateKey}|${normalize(alias ?? lgaName)}`;
    const wards = wardsByParent.get(key);
    if (!wards?.length) {
      unmatched.push(`${stateName} / ${lgaName}`);
      continue;
    }
    output[`${stateCode}|${lgaName}`] = [...new Set(wards)].sort((a, b) => a.localeCompare(b));
  }
}

if (unmatched.length) throw new Error(`Unmatched LGA entries: ${unmatched.join(", ")}`);
await writeFile("src/lib/northern-ward-options.json", `${JSON.stringify(output)}\n`);
console.log(
  `Wrote ${Object.keys(output).length} LGA entries and ${Object.values(output).reduce((sum, wards) => sum + wards.length, 0)} ward options.`,
);
