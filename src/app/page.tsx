import Link from "next/link";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { BannerTemplatePreview } from "@/components/banner/BannerTemplatePreview";
import { RegionalReach } from "@/components/public/RegionalReach";
import { HeroSlider, type HeroSlide } from "@/components/public/HeroSlider";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ContentStatus } from "@/components/public/PublicPage";
import { AnnouncementCard, EventCard } from "@/components/public/ContentCards";
import { getAnnouncements, getEvents, getPublicContentTime } from "@/lib/content/public-content";

const priorities = [
  {
    number: "01",
    title: "Organise locally",
    copy: "Build connected state and ward structures that carry movement activity into local communities.",
  },
  {
    number: "02",
    title: "Explain policy",
    copy: "Translate federal priorities, including the Renewed Hope Agenda, into clear information for northern communities.",
  },
  {
    number: "03",
    title: "Include young people",
    copy: "Create meaningful routes for youth and students to take part in advocacy, civic activity, and leadership.",
  },
];

const achievements = [
  {
    number: "01",
    area: "Education",
    figure: "\u20A686.3bn",
    title: "Student loan disbursements",
    copy: "NELFUND reported disbursements to more than 450,000 students across 218 tertiary institutions.",
    date: "State House report \u00B7 Dec 2025",
    source:
      "https://statehouse.gov.ng/nigerias-education-budget-jumps-to-%E2%82%A63-52trn-under-president-tinubu/",
  },
  {
    number: "02",
    area: "Infrastructure",
    figure: "279+",
    title: "Federal roads reported completed",
    copy: "A June 2025 presidential address reported more than 279 completed roads, alongside ongoing and rural road works.",
    date: "Presidential address \u00B7 Jun 2025",
    source:
      "https://statehouse.gov.ng/president-tinubus-address-at-the-32nd-afreximbank-annual-meetings-abuja-nigeria/",
  },
  {
    number: "03",
    area: "Primary healthcare",
    figure: "8,800",
    title: "Primary health centres included",
    copy: "The same address reported \u20A645.9bn spent on healthcare to upgrade 8,800 primary health centres.",
    date: "Presidential address \u00B7 Jun 2025",
    source:
      "https://statehouse.gov.ng/president-tinubus-address-at-the-32nd-afreximbank-annual-meetings-abuja-nigeria/",
  },
];

const heroSlides: HeroSlide[] = [
  {
    src: "/brand/grand-patron-tinubu-760w.jpg",
    alt: "President Bola Ahmed Tinubu, grand patron of Arewa for Asiwaju",
    tag: "Our movement",
    title: "A student wing connecting policy and people",
    description:
      "A4A focuses on grassroots organisation, policy advocacy, and student participation across Northern Nigeria.",
    objectPosition: "center 24%",
  },
  {
    src: "/brand/organising-framework.svg",
    alt: "Illustration of the A4A organising framework from national coordination to student participation",
    tag: "Illustration | organising framework",
    title: "Build clear routes to take part",
    description:
      "The movement framework describes national, state, LGA, ward, and student structures. This graphic does not represent live chapter counts.",
    objectPosition: "center",
  },
  {
    src: "/brand/policy-communication.svg",
    alt: "Illustration of education, agriculture, and infrastructure as policy communication themes",
    tag: "Illustration | advocacy themes",
    title: "Make public priorities easier to understand",
    description:
      "The supplied framework names education, agriculture and food security, infrastructure, and youth inclusion as advocacy themes.",
    objectPosition: "center",
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
        <div className="max-w-2xl">
          <p className="eyebrow">From A4A</p>
          <h2 id="updates-heading" className="section-title mt-2">
            News and activities
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
            Follow movement updates and find upcoming opportunities to take part.
          </p>
        </div>
        <section className="mt-9" aria-labelledby="latest-news-heading">
          <div className="mb-4 flex items-end justify-between gap-4 border-b border-line pb-3">
            <h3 id="latest-news-heading" className="text-xl font-bold text-ink">
              Latest news
            </h3>
            <Link
              className="inline-flex min-h-10 items-center gap-1 text-sm font-bold text-brand-forest hover:underline"
              href="/news"
            >
              All news <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          {news.state !== "ready" ? (
            <ContentStatus state={news.state} />
          ) : news.items.length === 0 ? (
            <ContentStatus state="empty" />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:gap-7">
              {news.items.slice(0, 2).map((item) => (
                <AnnouncementCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
        <section
          className="mt-14 border-t border-line bg-surface py-7 sm:mt-16 sm:py-9"
          aria-labelledby="upcoming-events-heading"
        >
          <div className="mb-4 flex items-end justify-between gap-4 border-b border-line pb-3">
            <h3 id="upcoming-events-heading" className="text-xl font-bold text-ink">
              Upcoming events
            </h3>
            <Link
              className="inline-flex min-h-10 items-center gap-1 text-sm font-bold text-brand-forest hover:underline"
              href="/events"
            >
              All events <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          {events.state !== "ready" ? (
            <ContentStatus state={events.state} />
          ) : upcomingEvents.length === 0 ? (
            <ContentStatus state="empty" />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:gap-7">
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
    <section
      className="bg-paper py-14 sm:py-20"
      aria-labelledby="updates-loading-heading"
      aria-busy="true"
    >
      <div className="site-container">
        <p className="eyebrow">From A4A</p>
        <h2 id="updates-loading-heading" className="section-title mt-2">
          News and activities
        </h2>
        <p className="mt-3 text-sm text-muted">Loading published news and upcoming events...</p>
        <div className="mt-7 h-1 w-full max-w-sm animate-pulse bg-line" />
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <section className="border-b border-line bg-paper py-8 sm:py-12 lg:py-14">
          <div className="site-container grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">AREWA FOR ASIWAJU STUDENT WING</p>
              <h1 className="display-title home-hero-title max-w-2xl text-ink">
                Connect Northern students with policy.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-relaxed">
                A4A connects young people with the Renewed Hope Agenda through grassroots
                organising, policy advocacy, and meaningful student participation.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="button-primary" href="/register">
                  Join the Student Wing <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link className="button-secondary" href="/about">
                  Discover the Movement
                </Link>
              </div>
            </div>
            <HeroSlider slides={heroSlides} />
          </div>
        </section>

        <RegionalReach />

        <section
          className="border-b border-line bg-paper py-14 sm:py-20"
          aria-labelledby="priorities-heading"
        >
          <div className="site-container grid gap-9 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
            <div className="max-w-xl">
              <p className="eyebrow">Our priorities</p>
              <h2 id="priorities-heading" className="section-title mt-3">
                A movement built to connect policy and people
              </h2>
              <p className="mt-4 text-base leading-7 text-muted">
                We focus on practical ways to organise, inform, and make room for the next
                generation.
              </p>
            </div>
            <ol className="divide-y divide-line border-y border-line">
              {priorities.map(({ number, title, copy }) => (
                <li
                  key={number}
                  className="grid gap-2 py-5 sm:grid-cols-[4.25rem_1fr] sm:items-start sm:gap-5 sm:py-6"
                >
                  <span className="font-mono text-sm font-bold tracking-[.12em] text-brand-ochre sm:pt-1">
                    {number}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold leading-snug text-ink">{title}</h3>
                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted sm:text-[0.9375rem]">
                      {copy}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="bg-brand-forest py-14 text-white sm:py-20"
          aria-labelledby="mission-vision-heading"
        >
          <div className="site-container">
            <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr] md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#f3ca61]">
                  Our purpose
                </p>
                <h2
                  id="mission-vision-heading"
                  className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
                >
                  Our mission and vision
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-white/80 sm:text-base">
                Grounded in people. Focused on the future.
              </p>
            </div>
            <div className="mt-9 grid border-y border-white/20 md:grid-cols-2">
              <article className="py-7 md:border-r md:border-white/20 md:pr-10 lg:py-9">
                <p className="font-mono text-xs font-bold tracking-[.14em] text-[#f3ca61]">
                  01 / MISSION
                </p>
                <h3 className="mt-3 text-xl font-bold">Our mission</h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
                  To organise and empower students and young people across Northern Nigeria, connect
                  them with civic and policy conversations, and make public priorities clear and
                  relevant to local communities.
                </p>
              </article>
              <article className="border-t border-white/20 py-7 md:border-t-0 md:pl-10 lg:py-9">
                <p className="font-mono text-xs font-bold tracking-[.14em] text-[#f3ca61]">
                  02 / VISION
                </p>
                <h3 className="mt-3 text-xl font-bold">Our vision</h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
                  A connected, informed, and active generation of northern students contributing to
                  stronger communities and a more prosperous future for the region.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="border-b border-line bg-paper py-14 sm:py-20"
          aria-labelledby="achievements-heading"
        >
          <div className="site-container">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow">Renewed Hope Agenda</p>
                <h2 id="achievements-heading" className="section-title mt-3">
                  President Tinubu&apos;s achievements
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-muted">
                As a support group, A4A highlights the administration&apos;s reported progress in
                education, infrastructure, and healthcare. Figures below link to official State
                House reports.
              </p>
            </div>
            <div className="mt-9 divide-y divide-line border-y border-line">
              {achievements.map(({ number, area, figure, title, copy, date, source }) => (
                <article
                  key={number}
                  className="grid gap-3 py-5 sm:grid-cols-[3rem_9rem_0.9fr_1.3fr_auto] sm:items-center sm:gap-5 sm:py-6"
                >
                  <span className="font-mono text-sm font-bold tracking-[.12em] text-brand-ochre">
                    {number}
                  </span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[.12em] text-brand-forest">
                      {area}
                    </span>
                    <p className="mt-2 font-mono text-2xl font-bold leading-none tracking-tight text-brand-forest sm:text-3xl">
                      {figure}
                    </p>
                  </div>
                  <h3 className="text-lg font-bold leading-snug text-ink">{title}</h3>
                  <p className="text-sm leading-6 text-muted">{copy}</p>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <span className="text-xs text-muted">{date}</span>
                    <a
                      href={source}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand-forest underline-offset-4 hover:underline focus-visible:underline"
                    >
                      Source <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-muted">
              Figures are reproduced from official government statements and reflect the reporting
              dates shown.
            </p>
          </div>
        </section>

        <section className="bg-paper py-14 sm:py-20" aria-labelledby="banner-heading">
          <div className="site-container">
            <div className="grid border-y border-line bg-surface lg:grid-cols-[1fr_0.92fr]">
              <div className="flex flex-col items-start justify-center py-8 sm:py-10 lg:py-12 lg:pr-12">
                <h2
                  id="banner-heading"
                  className="mt-5 max-w-xl text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl"
                >
                  Put your support in the picture.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
                  Add your name and photo to the A4A Students&apos; Wing banner. Preview your
                  design, then download a high-resolution image to share.
                </p>
                <Link href="/banner-generator" className="button-primary mt-6">
                  Create your banner <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-xs text-muted">
                  No account needed. Your photo stays on your device.
                </p>
              </div>
              <div className="flex min-h-64 items-center justify-center border-t border-line bg-brand-forest px-5 py-7 sm:px-10 lg:min-h-80 lg:border-l lg:border-t-0">
                <div className="flex w-full max-w-md items-center justify-center gap-5 sm:gap-8">
                  <div className="hidden h-40 w-px bg-white/25 sm:block" aria-hidden="true" />
                  <BannerTemplatePreview />
                  <div className="hidden max-w-32 text-sm font-semibold leading-6 text-white/90 sm:block">
                    Personalise it. Download it. Share the movement.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Suspense fallback={<HomeUpdatesLoading />}>
          <HomeUpdates />
        </Suspense>

        <section className="bg-brand-forest py-12 text-white sm:py-16">
          <div className="site-container flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.12em] text-white/75">
                Take part
              </p>
              <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
                Join the conversation and connect with A4A.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Use the registration form to share your interest in the movement.
              </p>
            </div>
            <Link
              className="button-secondary button-on-green w-full shrink-0 sm:w-auto"
              href="/register"
            >
              Register your interest <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer reserveFloatingActionSpace />
      <WhatsAppFab />
    </div>
  );
}
