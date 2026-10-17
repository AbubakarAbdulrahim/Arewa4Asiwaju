import { NorthernMap } from "./NorthernMap";

export function RegionalReach() {
  return (
    <section
      className="border-y border-line bg-surface py-12 sm:py-16"
      aria-labelledby="regional-reach-heading"
    >
      <div className="site-container">
        {/* Section Header with Server-Rendered Static Counts */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-line pb-8">
          <div className="max-w-2xl">
            <p className="eyebrow">Regional reach</p>
            <h2 id="regional-reach-heading" className="section-title mt-2">
              Organised across 19 northern states and the FCT
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Explore local chapters across the North-West, North-East, and North-Central zones. Tap
              or click any state on the map to find your campus coordinator and join the movement.
            </p>
          </div>

          {/* Static counts: guaranteed to render instantly on server without 0 flicker */}
          <div className="flex shrink-0 items-center gap-6 sm:gap-8">
            <div className="border-l-2 border-brand-forest pl-3 sm:pl-4">
              <p className="font-mono text-3xl font-extrabold leading-none tracking-tight text-ink sm:text-4xl">
                19
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">
                Northern states
              </p>
            </div>
            <div className="border-l-2 border-brand-forest pl-3 sm:pl-4">
              <p className="font-mono text-3xl font-extrabold leading-none tracking-tight text-ink sm:text-4xl">
                1
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">
                FCT Abuja
              </p>
            </div>
            <div className="border-l-2 border-brand-forest pl-3 sm:pl-4">
              <p className="font-mono text-3xl font-extrabold leading-none tracking-tight text-ink sm:text-4xl">
                419
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">
                Ward chapters
              </p>
            </div>
          </div>
        </div>

        {/* Interactive SVG Map with Inspection Panel */}
        <div className="mt-8 sm:mt-10">
          <NorthernMap />
        </div>
      </div>
    </section>
  );
}
