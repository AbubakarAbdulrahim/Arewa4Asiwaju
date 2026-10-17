"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Shield, Users } from "lucide-react";
import { NORTHERN_STATES, type NorthernState } from "@/lib/geo-data";

type Zone = "All" | "North-West" | "North-East" | "North-Central";

interface StatePathData {
  code: string;
  label: string;
  d: string;
  labelX: number;
  labelY: number;
}

// Optimized topological layout representing the 19 northern states and the FCT
const STATE_PATHS: StatePathData[] = [
  // North-West
  {
    code: "SO",
    label: "Sokoto",
    d: "M 110,40 L 195,35 L 210,95 L 180,140 L 125,130 L 95,95 Z",
    labelX: 152,
    labelY: 82,
  },
  {
    code: "KB",
    label: "Kebbi",
    d: "M 55,90 L 110,85 L 125,130 L 135,210 L 80,240 L 50,165 Z",
    labelX: 90,
    labelY: 155,
  },
  {
    code: "ZA",
    label: "Zamfara",
    d: "M 180,140 L 210,95 L 265,105 L 275,185 L 210,195 L 175,170 Z",
    labelX: 225,
    labelY: 145,
  },
  {
    code: "KT",
    label: "Katsina",
    d: "M 265,105 L 345,75 L 370,125 L 340,195 L 275,185 Z",
    labelX: 312,
    labelY: 135,
  },
  {
    code: "KN",
    label: "Kano",
    d: "M 345,75 L 435,90 L 440,175 L 375,205 L 340,195 L 370,125 Z",
    labelX: 395,
    labelY: 145,
  },
  {
    code: "JI",
    label: "Jigawa",
    d: "M 435,90 L 525,75 L 535,145 L 465,170 L 440,175 Z",
    labelX: 475,
    labelY: 118,
  },
  {
    code: "KD",
    label: "Kaduna",
    d: "M 275,185 L 375,205 L 420,225 L 410,310 L 330,320 L 280,265 Z",
    labelX: 345,
    labelY: 255,
  },

  // North-East
  {
    code: "YO",
    label: "Yobe",
    d: "M 525,75 L 640,65 L 650,170 L 575,190 L 535,145 Z",
    labelX: 585,
    labelY: 120,
  },
  {
    code: "BO",
    label: "Borno",
    d: "M 640,65 L 795,70 L 785,185 L 710,240 L 650,170 Z",
    labelX: 715,
    labelY: 135,
  },
  {
    code: "BA",
    label: "Bauchi",
    d: "M 420,225 L 465,170 L 575,190 L 570,270 L 495,295 L 425,275 Z",
    labelX: 495,
    labelY: 235,
  },
  {
    code: "GO",
    label: "Gombe",
    d: "M 575,190 L 650,170 L 665,250 L 595,270 L 570,270 Z",
    labelX: 615,
    labelY: 225,
  },
  {
    code: "AD",
    label: "Adamawa",
    d: "M 665,250 L 710,240 L 760,330 L 705,410 L 645,340 Z",
    labelX: 700,
    labelY: 325,
  },
  {
    code: "TA",
    label: "Taraba",
    d: "M 570,270 L 645,340 L 675,445 L 595,475 L 545,370 Z",
    labelX: 610,
    labelY: 385,
  },

  // North-Central
  {
    code: "KW",
    label: "Kwara",
    d: "M 80,240 L 165,260 L 195,355 L 135,395 L 85,325 Z",
    labelX: 135,
    labelY: 320,
  },
  {
    code: "NI",
    label: "Niger",
    d: "M 135,210 L 280,265 L 330,320 L 285,385 L 195,355 L 165,260 Z",
    labelX: 235,
    labelY: 300,
  },
  {
    code: "FC",
    label: "FCT",
    d: "M 330,320 L 375,325 L 370,375 L 325,370 Z",
    labelX: 350,
    labelY: 348,
  },
  {
    code: "NA",
    label: "Nasarawa",
    d: "M 375,325 L 475,320 L 490,380 L 400,410 L 370,375 Z",
    labelX: 430,
    labelY: 360,
  },
  {
    code: "PL",
    label: "Plateau",
    d: "M 425,275 L 495,295 L 545,370 L 475,375 L 475,320 Z",
    labelX: 485,
    labelY: 325,
  },
  {
    code: "KO",
    label: "Kogi",
    d: "M 195,355 L 285,385 L 325,370 L 370,430 L 280,480 L 210,435 Z",
    labelX: 275,
    labelY: 420,
  },
  {
    code: "BE",
    label: "Benue",
    d: "M 370,430 L 490,380 L 545,410 L 515,485 L 395,490 Z",
    labelX: 455,
    labelY: 445,
  },
];

const ZONE_THEMES = {
  "North-West": {
    fillLight: "#046735",
    fillDark: "#1f7a45",
    bgLight: "bg-[#046735]/10",
    textLight: "text-[#046735]",
    borderLight: "border-[#046735]",
  },
  "North-East": {
    fillLight: "#087358",
    fillDark: "#1f8a6c",
    bgLight: "bg-[#087358]/10",
    textLight: "text-[#087358]",
    borderLight: "border-[#087358]",
  },
  "North-Central": {
    fillLight: "#2c6b41",
    fillDark: "#3d8a57",
    bgLight: "bg-[#2c6b41]/10",
    textLight: "text-[#2c6b41]",
    borderLight: "border-[#2c6b41]",
  },
} as const;

export function NorthernMap() {
  const mapId = useId();
  const [selectedCode, setSelectedCode] = useState<string>("KN"); // Default to Kano, high density hub
  const [activeZone, setActiveZone] = useState<Zone>("All");
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  const selectedState: NorthernState =
    NORTHERN_STATES.find((s) => s.code === selectedCode) ?? NORTHERN_STATES[0];

  const highlightedCode = hoveredCode ?? selectedCode;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start lg:gap-10">
      {/* Visual SVG Map Pane */}
      <div className="flex flex-col">
        {/* Zone Filter Chips */}
        <div
          className="mb-4 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter states by geopolitical zone"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-muted">Filter:</span>
          {(["All", "North-West", "North-East", "North-Central"] as Zone[]).map((zone) => {
            const isActive = activeZone === zone;
            return (
              <button
                key={zone}
                type="button"
                onClick={() => setActiveZone(zone)}
                className={`rounded-sm px-2.5 py-1 text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-brand-forest text-white"
                    : "border border-line bg-surface text-ink hover:border-brand-forest"
                }`}
                aria-pressed={isActive}
              >
                {zone === "All" ? "All 19 states + FCT" : zone}
              </button>
            );
          })}
        </div>

        {/* SVG Interactive Map */}
        <div className="relative overflow-hidden rounded-md border border-line bg-surface p-3 shadow-xs sm:p-5">
          <svg
            viewBox="30 20 780 490"
            className="h-auto w-full max-w-full select-none"
            role="region"
            aria-label="Interactive map of Northern Nigeria and the Federal Capital Territory"
          >
            <defs>
              <filter id={`${mapId}-shadow`} x="-5%" y="-5%" width="110%" height="110%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Render State Polygons */}
            {STATE_PATHS.map((path) => {
              const state = NORTHERN_STATES.find((s) => s.code === path.code);
              if (!state) return null;

              const isSelected = selectedCode === path.code;
              const isHovered = hoveredCode === path.code;
              const matchesZone = activeZone === "All" || state.zone === activeZone;
              const theme = ZONE_THEMES[state.zone];

              const isFaded = !matchesZone;

              return (
                <g key={path.code} className="cursor-pointer transition-all duration-200">
                  <path
                    d={path.d}
                    id={`${mapId}-${path.code}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`${state.name}, ${state.zone}. Capital: ${state.capital}. ${state.lgas.length} local government areas.`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCode(path.code)}
                    onMouseEnter={() => setHoveredCode(path.code)}
                    onMouseLeave={() => setHoveredCode(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedCode(path.code);
                      }
                    }}
                    fill={theme.fillLight}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                    className={`transition-all duration-200 focus-visible:outline-none ${
                      isSelected
                        ? "fill-brand-forest filter-[url(#" +
                          mapId +
                          "-shadow)] stroke-[#f3ca61] z-20"
                        : isHovered
                          ? "opacity-90 stroke-white"
                          : isFaded
                            ? "opacity-30"
                            : "opacity-85 hover:opacity-100"
                    }`}
                  />
                  {/* State Text Label */}
                  <text
                    x={path.labelX}
                    y={path.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                    className={`select-none text-[10px] font-extrabold tracking-tight transition-opacity ${
                      isSelected
                        ? "fill-[#f3ca61] font-black"
                        : isFaded
                          ? "fill-white/40"
                          : "fill-white"
                    }`}
                  >
                    {path.code}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive instruction hint */}
          <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-[0.75rem] text-muted">
            <span>Tap or hover over any state to inspect local chapter details.</span>
            <span className="font-mono font-semibold">
              {highlightedCode} ·{" "}
              {NORTHERN_STATES.find((s) => s.code === highlightedCode)?.name ?? ""}
            </span>
          </div>
        </div>
      </div>

      {/* Selected State Side Panel */}
      <div
        className="rounded-md border border-line bg-surface p-5 sm:p-6"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <span className="inline-block rounded-xs bg-[#e8f2ea] px-2 py-0.5 font-mono text-xs font-bold text-brand-forest">
              {selectedState.zone}
            </span>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {selectedState.name}
            </h3>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-brand-forest font-mono text-lg font-bold text-white">
            {selectedState.code}
          </span>
        </div>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-line/60 py-1.5">
            <dt className="flex items-center gap-2 text-muted">
              <MapPin aria-hidden="true" className="h-4 w-4 text-brand-forest" /> State capital
            </dt>
            <dd className="font-bold text-ink">{selectedState.capital}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-line/60 py-1.5">
            <dt className="flex items-center gap-2 text-muted">
              <Shield aria-hidden="true" className="h-4 w-4 text-brand-forest" /> Local governments
            </dt>
            <dd className="font-mono font-bold text-ink">{selectedState.lgas.length} LGAs</dd>
          </div>
          <div className="flex items-center justify-between border-b border-line/60 py-1.5">
            <dt className="flex items-center gap-2 text-muted">
              <Users aria-hidden="true" className="h-4 w-4 text-brand-forest" /> Student chapter
            </dt>
            <dd className="font-semibold text-brand-forest">Active Mobilisation</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href={`/register?state=${selectedState.code}`}
            className="button-primary w-full justify-between text-sm"
          >
            <span>Join {selectedState.name} Chapter</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link
            href={`/contact?subject=Coordinator-${selectedState.code}`}
            className="button-secondary w-full justify-center text-sm"
          >
            Contact State Coordinator
          </Link>
        </div>

        {/* Selected LGA sample preview */}
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-xs font-bold text-muted uppercase tracking-wider">
            Sample Local Governments
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            {selectedState.lgas.slice(0, 6).join(", ")}
            {selectedState.lgas.length > 6 ? `, and ${selectedState.lgas.length - 6} more` : ""}.
          </p>
        </div>
      </div>

      {/* Screen reader text list fallback */}
      <details className="lg:col-span-2 border-t border-line pt-4 text-sm text-muted">
        <summary className="cursor-pointer font-semibold text-ink hover:text-brand-forest focus-visible:outline-2">
          View full text list of all 19 northern states and the FCT
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {(["North-West", "North-East", "North-Central"] as const).map((zone) => (
            <div key={zone} className="rounded-sm border border-line bg-paper p-3.5">
              <h4 className="font-bold text-ink">{zone}</h4>
              <ul className="mt-2 space-y-1 text-xs">
                {NORTHERN_STATES.filter((s) => s.zone === zone).map((s) => (
                  <li key={s.code} className="flex justify-between">
                    <span className="font-medium text-ink">{s.name}</span>
                    <span className="font-mono text-muted">{s.lgas.length} LGAs</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
