import Link from "next/link";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { BannerTemplatePreview } from "@/components/banner/BannerTemplatePreview";
import { RegionalReach } from "@/components/public/RegionalReach";
import { HeroSlider, type HeroSlide } from "@/components/public/HeroSlider";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { ContentStatus } from "@/components/public/PublicPage";
import { AnnouncementCard, EventCard } from "@/components/public/ContentCards";
import { getAnnouncements, getEvents, getPublicContentTime } from "@/lib/content/public-content";

const priorities = [
  {
    title: "Organise locally",
    copy: "Build connected state, local government, and campus chapters that carry movement activity into local communities.",
  },
  {
    title: "Explain policy",
    copy: "Translate federal priorities, including the Renewed Hope Agenda, into plain information for northern students and families.",
  },
  {
    title: "Include young people",
    copy: "Create real routes for students to take part in civic learning, grassroots advocacy, and regional leadership.",
  },
];

const achievements = [
  {
    area: "Education",
    figure: "\u20A686.3bn",
    title: "Student loan disbursements",
    copy: "NELFUND reported disbursements to more than 450,000 students across 218 tertiary institutions.",
    date: "State House report \u00B7 Dec 2025",
    source:
      "https://statehouse.gov.ng/nigerias-education-budget-jumps-to-%E2%82%A63-52trn-under-president-tinubu/",
  },
  {
    area: "Infrastructure",
    figure: "279+",
    title: "Federal roads reported completed",
    copy: "A presidential address reported over 279 completed roads alongside ongoing regional corridors.",
    date: "Presidential address \u00B7 Jun 2025",
    source:
      "https://statehouse.gov.ng/president-tinubus-address-at-the-32nd-afreximbank-annual-meetings-abuja-nigeria/",
  },
  {
    area: "Primary healthcare",
    figure: "8,800",
    title: "Primary health centres included",
    copy: "The administration reported \u20A645.9bn committed to upgrade 8,800 primary health facilities.",
    date: "Presidential address \u00B7 Jun 2025",
    source:
      "https://statehouse.gov.ng/president-tinubus-address-at-the-32nd-afreximbank-annual-meetings-abuja-nigeria/",
  },
];

const heroSlides: HeroSlide[] = [
  {
    src: "/brand/grand-patron-tinubu-760w.jpg",
    alt: "President Bola Ahmed Tinubu, grand patron of Arewa for Asiwaju",
  },
  {
    src: "/brand/badaru.jpg",
    alt: "Mohammed Badaru Abubakar",
  },
  {
    src: "/brand/maliki.jpg",
    alt: "Maliki",
  },
  {
    src: "/brand/kalli.jpg",
    alt: "Kalli",
  },
];

async function HomeUpdates() {
  const [news, events] = await Promise.all([getAnnouncements(), getEvents()]);
  const now = await getPublicContentTime();
  const upcomingEvents =
    events.state === "ready"
      ? events.items.filter((event) => new Date(event.end_date).getTime() >= now).slice(0, 2)
      : [];

  return (
    <section className="bg-paper py-14 sm:py-20" aria-labelledby="updates-heading">
      <div className="site-container">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-line pb-4">
          <div>
            <p className="eyebrow">News & activities</p>
            <h2 id="updates-heading" className="section-title mt-2">
              Updates from campus chapters
            </h2>
          </div>
          <p className="text-sm text-muted">
            Dispatches, policy briefs, and verified community announcements.
          </p>
        </div>

        {/* Latest News */}
        <section className="mt-8" aria-labelledby="latest-news-heading">
          <div className="mb-4 flex items-center justify-between">
            <h3 id="latest-news-heading" className="text-lg font-bold text-ink">
              Latest news
            </h3>
            <Link
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-forest hover:underline"
              href="/news"
            >
              All stories <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          {news.state !== "ready" ? (
            <ContentStatus state={news.state} kind="news" />
          ) : news.items.length === 0 ? (
            <ContentStatus state="empty" kind="news" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {news.items.slice(0, 2).map((item) => (
                <AnnouncementCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Events */}
        <section
          className="mt-12 border-t border-line pt-8"
          aria-labelledby="upcoming-events-heading"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 id="upcoming-events-heading" className="text-lg font-bold text-ink">
              Upcoming events
            </h3>
            <Link
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-forest hover:underline"
              href="/events"
            >
              All events <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          {events.state !== "ready" ? (
            <ContentStatus state={events.state} kind="events" />
          ) : upcomingEvents.length === 0 ? (
            <ContentStatus state="empty" kind="events" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} item={event} />
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function HomeUpdatesLoading() {
  return (
    <section className="bg-paper py-14 sm:py-20" aria-busy="true">
      <div className="site-container">
        <p className="eyebrow">News & activities</p>
        <h2 className="section-title mt-2">Updates from campus chapters</h2>
        <p className="mt-3 text-sm text-muted">Loading latest dispatches...</p>
        <div className="mt-6 h-1 w-full max-w-sm animate-pulse bg-line" />
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-line bg-paper py-8 sm:py-12 lg:py-14">
          <div className="site-container grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
            <div className="max-w-2xl">
              <span className="inline-block rounded-xs bg-[#e8f2ea] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-forest">
                Arewa for Asiwaju Student Wing
              </span>
              <h1 className="display-title home-hero-title mt-4 max-w-2xl text-ink">
                Connect Northern Students with Policy for Renewed Hope Agenda 2027
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                Organising students across 19 northern states and the FCT through grassroots civic
                engagement, policy translation, and direct youth participation.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link className="button-primary" href="/register">
                  Join the Student Wing <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link className="button-secondary" href="/about">
                  Discover the Movement
                </Link>
              </div>
            </div>

            {/* Carousel kept intact as required */}
            <HeroSlider slides={heroSlides} />
          </div>
        </section>

        {/* Northern Nigeria Interactive Map & Regional Reach */}
        <RegionalReach />

        {/* Compact Three-Line Priorities */}
        <section
          className="border-b border-line bg-paper py-12 sm:py-16"
          aria-labelledby="priorities-heading"
        >
          <div className="site-container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-14">
            <div>
              <p className="eyebrow">Our focus</p>
              <h2 id="priorities-heading" className="section-title mt-2">
                What the movement does
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Three clear priorities guide student activity across every campus and local ward.
              </p>
            </div>

            {/* Quiet, compact three-line list without numbers */}
            <ul className="space-y-4 border-l-2 border-brand-forest pl-5 sm:pl-7">
              {priorities.map(({ title, copy }) => (
                <li key={title} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-brand-forest"
                    />
                    <h3 className="font-bold text-ink sm:text-lg">{title}</h3>
                  </div>
                  <p className="pl-6 text-sm leading-relaxed text-muted sm:text-base">{copy}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Verified Sourced Achievements: Quiet Horizontal Table Band */}
        <section
          className="border-b border-line bg-surface py-12 sm:py-16"
          aria-labelledby="achievements-heading"
        >
          <div className="site-container">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-line pb-4">
              <div>
                <p className="eyebrow">Renewed Hope Agenda</p>
                <h2 id="achievements-heading" className="section-title mt-2">
                  Verified policy progress
                </h2>
              </div>
              <p className="text-xs text-muted max-w-sm">
                Figures are from official State House statements; dates shown.
              </p>
            </div>

            <div className="mt-8 grid gap-6 divide-y divide-line sm:grid-cols-3 sm:gap-8 sm:divide-y-0 sm:divide-x">
              {achievements.map(({ area, figure, title, copy, date, source }, i) => (
                <article key={area} className={i > 0 ? "pt-6 sm:pt-0 sm:pl-8" : ""}>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-forest">
                    {area}
                  </span>
                  <p className="mt-1 font-mono text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                    {figure}
                  </p>
                  <h3 className="mt-2 text-base font-bold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{copy}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted">
                    <span>{date}</span>
                    <a
                      href={source}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-brand-forest underline-offset-4 hover:underline"
                    >
                      Source <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Banner Promo */}
        <section className="bg-paper py-12 sm:py-16" aria-labelledby="banner-heading">
          <div className="site-container">
            <div className="grid overflow-hidden rounded-md border border-line bg-surface lg:grid-cols-[1.1fr_0.9fr]">
              <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
                <span className="inline-block rounded-xs bg-[#e8f2ea] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-forest self-start">
                  Student Identity
                </span>
                <h2
                  id="banner-heading"
                  className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl lg:text-4xl"
                >
                  Make your movement banner in seconds.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  Add your photo and campus designation to the official A4A Student Wing banner.
                  Download an instant high-resolution PNG to share across WhatsApp and social
                  channels.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link href="/banner-generator" className="button-primary">
                    Create your banner <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
                <p className="mt-3 text-xs text-muted">Your photo never leaves your phone.</p>
              </div>

              {/* Real example banner preview */}
              <div className="flex items-center justify-center border-t border-line bg-[#044d28] p-6 sm:p-8 lg:border-t-0 lg:border-l">
                <div className="flex flex-col items-center">
                  <BannerTemplatePreview />
                  <p className="mt-3 text-center text-xs font-semibold text-white/80">
                    Official 1528 × 2160 HD template
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic News and Events Preview */}
        <Suspense fallback={<HomeUpdatesLoading />}>
          <HomeUpdates />
        </Suspense>

        {/* Bottom Call to Action */}
        <section className="border-t border-line bg-brand-forest py-12 text-white sm:py-14">
          <div className="site-container flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Be part of the student movement.
              </h2>
              <p className="mt-2 text-sm text-white/85 sm:text-base">
                Join thousands of students and youth delegates organising for the Renewed Hope
                Agenda across Northern Nigeria.
              </p>
            </div>
            <Link className="button-primary button-on-dark shrink-0 font-bold" href="/register">
              Join the Student Wing <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer reserveFloatingActionSpace />
      <WhatsAppFab />
    </div>
  );
}
