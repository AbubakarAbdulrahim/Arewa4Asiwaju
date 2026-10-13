import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BannerTemplatePreview } from "@/components/banner/BannerTemplatePreview";
import { PhotoCarousel } from "@/components/public/PhotoCarousel";
import { RegionalReach } from "@/components/public/RegionalReach";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Eye,
  Map,
  Target,
  UsersRound,
} from "lucide-react";
import { ContentStatus } from "@/components/public/PublicPage";
import { AnnouncementCard, EventCard } from "@/components/public/ContentCards";
import { getAnnouncements, getEvents } from "@/lib/content/public-content";

const priorities = [
  {
    number: "01",
    title: "Organise locally",
    copy: "Build connected state and ward structures that carry movement activity into local communities.",
    icon: Map,
  },
  {
    number: "02",
    title: "Explain policy",
    copy: "Translate federal priorities, including the Renewed Hope Agenda, into clear information for northern communities.",
    icon: BookOpen,
  },
  {
    number: "03",
    title: "Include young people",
    copy: "Create meaningful routes for youth and students to take part in advocacy, civic activity, and leadership.",
    icon: UsersRound,
  },
];

const achievements = [
  {
    number: "01",
    area: "Education",
    figure: "₦86.3bn",
    title: "Student loan disbursements",
    copy: "NELFUND reported disbursements to more than 450,000 students across 218 tertiary institutions.",
    date: "State House report · Dec 2025",
    source: "https://statehouse.gov.ng/nigerias-education-budget-jumps-to-%E2%82%A63-52trn-under-president-tinubu/",
  },
  {
    number: "02",
    area: "Infrastructure",
    figure: "279+",
    title: "Federal roads reported completed",
    copy: "A June 2025 presidential address reported more than 279 completed roads, alongside ongoing and rural road works.",
    date: "Presidential address · Jun 2025",
    source: "https://statehouse.gov.ng/president-tinubus-address-at-the-32nd-afreximbank-annual-meetings-abuja-nigeria/",
  },
  {
    number: "03",
    area: "Primary healthcare",
    figure: "8,800",
    title: "Primary health centres included",
    copy: "The same address reported ₦45.9bn spent on healthcare to upgrade 8,800 primary health centres.",
    date: "Presidential address · Jun 2025",
    source: "https://statehouse.gov.ng/president-tinubus-address-at-the-32nd-afreximbank-annual-meetings-abuja-nigeria/",
  },
];

const featuredPhotos = [
  {
    src: "/brand/grand-patron-tinubu-760w.jpg",
    alt: "Arewa for Asiwaju grand patron Bola Ahmed Tinubu",
    objectPosition: "center 26%",
  },
];

export default async function HomePage() {
  const [news, events] = await Promise.all([getAnnouncements(), getEvents()]);
  const upcomingEvents =
    events.state === "ready"
      ? events.items.filter((event) => new Date(event.end_date) >= new Date()).slice(0, 2)
      : [];
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <section className="border-b border-line bg-paper py-10 sm:py-14 lg:py-16">
          <div className="site-container grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="max-w-3xl">
              <p className="eyebrow mb-5">AREWA FOR ASIWAJU STUDENT WING</p>
              <h1 className="display-title max-w-3xl text-ink">
                Organising Northern students to make policy matter locally.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
                A4A connects young people with the Renewed Hope Agenda through grassroots organising,
                policy advocacy, and meaningful student participation.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="button-primary" href="/register">
                  Join the Student Wing <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link className="button-secondary" href="/about">
                  Learn about the Student Wing
                </Link>
              </div>
            </div>
            <PhotoCarousel slides={featuredPhotos} />
          </div>
        </section>

        <RegionalReach />

        <section className="border-b border-line bg-paper py-14 sm:py-20" aria-labelledby="priorities-heading">
          <div className="site-container grid gap-9 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
            <div className="max-w-xl">
              <p className="eyebrow">Our priorities</p>
              <h2 id="priorities-heading" className="section-title mt-3">
                A movement built to connect policy and people
              </h2>
              <p className="mt-4 text-base leading-7 text-muted">
                We focus on practical ways to organise, inform, and make room for the next generation.
              </p>
            </div>
            <ol className="divide-y divide-line border-y border-line">
              {priorities.map(({ number, title, copy, icon: Icon }) => (
                <li key={number} className="grid gap-3 py-5 sm:grid-cols-[3.5rem_2.75rem_1fr] sm:items-start sm:gap-4 sm:py-6">
                  <span className="font-mono text-sm font-bold tracking-[.12em] text-brand-ochre sm:pt-1">
                    {number}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-brand-forest ring-1 ring-line">
                    <Icon aria-hidden="true" className="h-5 w-5" />
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

        <section className="bg-brand-forest py-14 text-white sm:py-20" aria-labelledby="mission-vision-heading">
          <div className="site-container">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[#f3ca61]">
                Our purpose
              </p>
              <h2 id="mission-vision-heading" className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Grounded in people. Focused on the future.
              </h2>
            </div>
            <div className="mt-9 grid border-y border-white/20 md:grid-cols-2">
              <article className="py-7 md:border-r md:border-white/20 md:pr-10 lg:py-9">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-[#f3ca61]">
                    <Target aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h3 className="text-xl font-bold">Our mission</h3>
                </div>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
                  To organise and empower students and young people across Northern Nigeria, connect
                  them with civic and policy conversations, and make public priorities clear and
                  relevant to local communities.
                </p>
              </article>
              <article className="border-t border-white/20 py-7 md:border-t-0 md:pl-10 lg:py-9">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-[#f3ca61]">
                    <Eye aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h3 className="text-xl font-bold">Our vision</h3>
                </div>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
                  A connected, informed, and active generation of northern students contributing to
                  stronger communities and a more prosperous future for the region.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-paper py-14 sm:py-20" aria-labelledby="achievements-heading">
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
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {achievements.map(({ number, area, figure, title, copy, date, source }) => (
                <article key={number} className="flex min-h-full flex-col border border-line bg-surface p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-[.12em] text-brand-forest">
                      {area}
                    </span>
                    <span className="font-mono text-xs font-bold tracking-[.12em] text-brand-ochre">
                      {number}
                    </span>
                  </div>
                  <p className="mt-6 font-mono text-4xl font-bold leading-none tracking-tight text-brand-forest sm:text-[2.75rem]">
                    {figure}
                  </p>
                  <h3 className="mt-3 text-lg font-bold leading-snug text-ink">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted">{copy}</p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
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
              Figures are reproduced from official government statements and reflect the reporting dates shown.
            </p>
          </div>
        </section>

        <section className="bg-paper py-14 sm:py-20" aria-labelledby="banner-heading">
          <div className="site-container">
            <div className="grid overflow-hidden rounded-xl border border-line bg-surface shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
              <div className="flex flex-col items-start justify-center p-6 sm:p-9 lg:p-12">
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-bold uppercase tracking-[.08em] text-brand-forest">
                  A4A Student Wing <span aria-hidden="true">·</span> Free banner maker
                </span>
                <h2 id="banner-heading" className="mt-5 max-w-xl text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
                  Put your support in the picture.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
                  Add your name and photo to the A4A Students&apos; Wing banner. Preview your design,
                  then download a high-resolution image to share.
                </p>
                <Link href="/banner-generator" className="button-primary mt-6">
                  Create your banner <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-xs text-muted">No account needed. Your photo stays on your device.</p>
              </div>
              <div className="flex min-h-72 items-center justify-center border-t border-line bg-brand-forest px-6 py-8 sm:px-10 lg:border-l lg:border-t-0">
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
        <section
          className="border-y border-line bg-paper py-14 sm:py-20"
          aria-labelledby="updates-heading"
        >
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
                <Link className="inline-flex min-h-10 items-center gap-1 text-sm font-bold text-brand-forest hover:underline" href="/news">
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
            <section className="mt-12" aria-labelledby="upcoming-events-heading">
              <div className="mb-4 flex items-end justify-between gap-4 border-b border-line pb-3">
                <h3 id="upcoming-events-heading" className="text-xl font-bold text-ink">
                  Upcoming events
                </h3>
                <Link className="inline-flex min-h-10 items-center gap-1 text-sm font-bold text-brand-forest hover:underline" href="/events">
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
            <Link className="button-secondary w-full shrink-0 sm:w-auto" href="/register">
              Register your interest <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
