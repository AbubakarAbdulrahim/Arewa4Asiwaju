"use client";

import { useEffect, useRef, useState } from "react";
import { NORTHERN_STATES } from "@/lib/geo-data";

const coverage = NORTHERN_STATES.filter((state) => state.name !== "FCT (Abuja)");
const zones = ["North-West", "North-East", "North-Central"] as const;

function useCountUp(target: number, active: boolean, duration = 850) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      const frame = window.requestAnimationFrame(() => setCount(target));
      return () => window.cancelAnimationFrame(frame);
    }

    let frame = 0;
    let startTime = 0;
    const update = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) frame = window.requestAnimationFrame(update);
    };
    frame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame);
  }, [active, duration, target]);

  return count;
}

export function RegionalReach() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const stateCount = useCountUp(coverage.length, active);
  const fctCount = useCountUp(1, active);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="border-y border-line bg-surface py-12 sm:py-16"
      aria-labelledby="regional-reach-heading"
    >
      <div className="site-container">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14">
          <div>
            <p className="eyebrow">Our regional framework</p>
            <h2 id="regional-reach-heading" className="section-title mt-3 max-w-lg">
              A student wing connected across Northern Nigeria
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
              A4A&apos;s organising framework covers the 19 northern states and the Federal Capital
              Territory, with a structure designed to connect state, local, and ward activity.
            </p>

            <div className="mt-7 grid max-w-lg grid-cols-2 overflow-hidden rounded-lg border border-line bg-paper">
              <div className="border-r border-line px-5 py-4 sm:px-6 sm:py-5">
                <p className="font-mono text-4xl font-bold leading-none tracking-tight text-brand-forest sm:text-5xl" aria-hidden="true">
                  {stateCount}
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">Northern states</p>
                <span className="sr-only">19 northern states in scope</span>
              </div>
              <div className="px-5 py-4 sm:px-6 sm:py-5">
                <p className="font-mono text-4xl font-bold leading-none tracking-tight text-brand-forest sm:text-5xl" aria-hidden="true">
                  {fctCount}
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">Federal Capital Territory</p>
                <span className="sr-only">1 Federal Capital Territory in scope</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-brand-forest p-5 text-white sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/20 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-white/70">
                  Coverage
                </p>
                <h3 className="mt-1 text-xl font-bold sm:text-2xl">19 states + FCT</h3>
              </div>
              <p className="text-sm text-white/75">Grouped by geopolitical zone</p>
            </div>

            <div className="mt-5 grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
              {zones.map((zone) => {
                const states = coverage.filter((state) => state.zone === zone);
                return (
                  <div key={zone}>
                    <h4 className="text-xs font-bold uppercase tracking-[.12em] text-[#f3ca61]">
                      {zone}
                    </h4>
                    <ul className="mt-3 space-y-2 text-sm text-white/90">
                      {states.map((state) => (
                        <li key={state.code}>{state.name}</li>
                      ))}
                      {zone === "North-Central" && <li>FCT (Abuja)</li>}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
