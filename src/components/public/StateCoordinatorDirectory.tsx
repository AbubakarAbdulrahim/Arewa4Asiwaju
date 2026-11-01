"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DirectoryCoordinator } from "@/lib/content/coordinator-directory";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((piece) => piece[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function StateCoordinatorDirectory({
  initialCoordinators,
  highlightId,
}: {
  initialCoordinators: DirectoryCoordinator[];
  highlightId?: string;
}) {
  const [coordinators] = useState<DirectoryCoordinator[]>(initialCoordinators);
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState(() => {
    if (!highlightId) return "all";
    const coordinator = initialCoordinators.find((person) => person.id === highlightId);
    return coordinator?.state ?? "all";
  });

  const selectedCoordinator = useMemo(
    () => coordinators.find((person) => person.id === highlightId),
    [coordinators, highlightId],
  );

  const availableStates = useMemo(
    () => ["all", ...new Set(coordinators.map((person) => person.state).filter(Boolean))],
    [coordinators],
  );

  const filteredCoordinators = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    return coordinators.filter((person) => {
      const matchesQuery =
        trimmedQuery.length === 0 ||
        `${person.full_name} ${person.title} ${person.state} ${person.unit_name ?? ""}`
          .toLowerCase()
          .includes(trimmedQuery);
      const matchesState = stateFilter === "all" || person.state === stateFilter;
      return matchesQuery && matchesState;
    });
  }, [coordinators, query, stateFilter]);

  useEffect(() => {
    if (!highlightId) return;
    const target = document.getElementById(highlightId);
    if (!target) return;

    const frameId = window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.focus();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [highlightId]);

  return (
    <section className="mt-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-md border border-line bg-surface pl-10 pr-3 text-sm text-ink placeholder:text-muted focus:border-brand-forest focus:outline-none"
            placeholder="Search coordinator name"
            aria-label="Search coordinator by name"
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-muted">
          <span>State</span>
          <select
            value={stateFilter}
            onChange={(event) => setStateFilter(event.target.value)}
            className="h-11 min-w-[180px] rounded-md border border-line bg-surface px-3 text-sm text-ink focus:border-brand-forest focus:outline-none"
            aria-label="Filter coordinators by state"
          >
            {availableStates.map((state) => (
              <option key={state} value={state}>
                {state === "all" ? "All states" : state}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredCoordinators.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-surface p-8 text-center">
          <h3 className="text-lg font-bold text-ink">No coordinators match this search.</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Check the state filter or contact the movement desk to request a verified coordinator profile.
          </p>
          <Link href="/contact?subject=Coordinator-Directory-Request" className="button-primary mt-5 inline-flex items-center gap-2 text-sm">
            <span>Request directory update</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCoordinators.map((person) => (
            <article
              key={person.id}
              id={person.id}
              tabIndex={selectedCoordinator?.id === person.id ? 0 : -1}
              className={`overflow-hidden rounded-md border bg-surface shadow-xs transition-all hover:shadow-sm ${
                selectedCoordinator?.id === person.id
                  ? "border-brand-forest ring-2 ring-brand-forest/25"
                  : "border-line"
              }`}
            >
              {person.photo_url ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper">
                  <Image
                    src={person.photo_url}
                    alt={person.full_name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-36 items-center justify-center bg-[#e8f2ea] text-brand-forest">
                  <span className="font-mono text-xl font-bold">{getInitials(person.full_name)}</span>
                </div>
              )}

              <div className="space-y-4 p-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-forest">
                    {person.unit_name ?? "Movement leadership"}
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-ink">{person.full_name}</h3>
                  <p className="mt-1 text-sm font-semibold text-muted">{person.title}</p>
                </div>

                <div className="space-y-2 text-sm text-muted">
                  <div className="flex items-start gap-2">
                    <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-forest" />
                    <span>{person.state}</span>
                  </div>
                  {person.phone && (
                    <div className="flex items-center gap-2">
                      <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-forest" />
                      <a href={`tel:${person.phone}`} className="hover:text-brand-forest hover:underline">
                        {person.phone}
                      </a>
                    </div>
                  )}
                  {person.email && (
                    <div className="flex items-center gap-2 break-all">
                      <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-forest" />
                      <a href={`mailto:${person.email}`} className="hover:text-brand-forest hover:underline">
                        {person.email}
                      </a>
                    </div>
                  )}
                </div>

                {person.biography && (
                  <p className="text-sm leading-relaxed text-muted line-clamp-3">{person.biography}</p>
                )}

                <div className="pt-1">
                  <Link href="/contact?subject=Coordinator-Contact-Request" className="inline-flex items-center gap-2 text-sm font-bold text-brand-forest hover:underline">
                    <span>Contact</span>
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

