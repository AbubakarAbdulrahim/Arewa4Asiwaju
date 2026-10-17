"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, CalendarPlus, Download, MapPin } from "lucide-react";
import type { PublicEvent } from "@/lib/content/public-content";
import { NORTHERN_STATES } from "@/lib/geo-data";

function createIcsDataUri(event: PublicEvent) {
  const start = new Date(event.start_date).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const end = new Date(event.end_date).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Arewa4Asiwaju//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@arewa4asiwaju.org`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title.replaceAll("\n", " ")}`,
    `DESCRIPTION:${(event.description || "").replaceAll("\n", " ")}`,
    `LOCATION:${(event.is_virtual ? "Online Gathering" : `${event.venue}, ${event.state_code}`).replaceAll("\n", " ")}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return `data:text/calendar;charset=utf8,${encodeURIComponent(icsLines)}`;
}

export function EventsDirectory({ events }: { events: PublicEvent[] }) {
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Extract unique months from events
  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    for (const event of events) {
      const date = new Date(event.start_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(key);
    }
    return Array.from(months).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (selectedState !== "all" && event.state_code !== selectedState) {
        return false;
      }
      if (selectedMonth !== "all") {
        const date = new Date(event.start_date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (key !== selectedMonth) return false;
      }
      return true;
    });
  }, [events, selectedState, selectedMonth]);

  return (
    <div>
      {/* Filter Bar */}
      <div className="mb-8 flex flex-col gap-4 rounded-md border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* State Filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="state-filter"
              className="text-xs font-bold uppercase tracking-wider text-muted"
            >
              State:
            </label>
            <select
              id="state-filter"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="rounded-xs border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold text-ink focus-visible:outline-2"
            >
              <option value="all">All 19 states + FCT</option>
              {NORTHERN_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          {monthOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="month-filter"
                className="text-xs font-bold uppercase tracking-wider text-muted"
              >
                Month:
              </label>
              <select
                id="month-filter"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-xs border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold text-ink focus-visible:outline-2"
              >
                <option value="all">All upcoming dates</option>
                {monthOptions.map((m) => {
                  const [year, month] = m.split("-");
                  const date = new Date(Number(year), Number(month) - 1, 1);
                  const label = date.toLocaleDateString("en-NG", {
                    month: "long",
                    year: "numeric",
                  });
                  return (
                    <option key={m} value={m}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        <p className="text-xs font-semibold text-muted">
          Showing {filteredEvents.length} {filteredEvents.length === 1 ? "gathering" : "gatherings"}
        </p>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-md border border-line bg-surface p-8 text-center sm:p-12">
          <Calendar className="mx-auto h-8 w-8 text-brand-forest" aria-hidden="true" />
          <h3 className="mt-3 text-lg font-bold text-ink sm:text-xl">
            No campus events match your selected filters.
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
            Interested in organising a student town hall, symposium, or chapter meeting? Contact the
            coordination desk to submit an event.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/contact?subject=Host-Campus-Event" className="button-primary text-sm">
              <CalendarPlus aria-hidden="true" className="h-4 w-4" />
              <span>Request a campus meet-up</span>
            </Link>
            {(selectedState !== "all" || selectedMonth !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedState("all");
                  setSelectedMonth("all");
                }}
                className="button-secondary text-sm"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const start = new Date(event.start_date);
            const dayNum = start.getDate();
            const monthStr = start.toLocaleDateString("en-NG", {
              month: "short",
              timeZone: "Africa/Lagos",
            });
            const locationStr = event.is_virtual
              ? "Online Gathering"
              : [event.venue, event.state_code].filter(Boolean).join(", ");
            const icsUri = createIcsDataUri(event);

            return (
              <article
                key={event.id}
                className="flex flex-col gap-4 rounded-md border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between shadow-xs transition-colors hover:border-brand-forest"
              >
                {/* Date Block & Details */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center rounded-xs border border-line bg-paper px-3 py-2 text-center shrink-0">
                    <span className="font-mono text-xs font-bold uppercase text-brand-forest">
                      {monthStr}
                    </span>
                    <span className="font-mono text-2xl font-black text-ink leading-tight">
                      {dayNum}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold uppercase tracking-wider text-brand-forest">
                        {event.category.replaceAll("_", " ")}
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-muted">
                        {event.is_virtual ? "Virtual" : event.state_code}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-ink sm:text-xl">
                      <Link href={`/events/${event.slug}`} className="hover:text-brand-forest">
                        {event.title}
                      </Link>
                    </h3>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                      <MapPin
                        aria-hidden="true"
                        className="h-3.5 w-3.5 text-brand-forest shrink-0"
                      />
                      <span>{locationStr}</span>
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center gap-2.5 sm:self-center border-t border-line/60 pt-3 sm:border-t-0 sm:pt-0">
                  <a
                    href={icsUri}
                    download={`${event.slug}.ics`}
                    className="button-secondary text-xs inline-flex items-center gap-1.5"
                    title="Add to your calendar"
                  >
                    <Download aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>Add to calendar (.ics)</span>
                  </a>
                  <Link
                    href={`/events/${event.slug}`}
                    className="button-primary text-xs inline-flex items-center gap-1"
                  >
                    <span>RSVP / Details</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
