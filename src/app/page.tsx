import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BannerTemplatePreview } from "@/components/banner/BannerTemplatePreview";
import { PhotoCarousel } from "@/components/public/PhotoCarousel";
import { ArrowRight, BookOpen, Map, UsersRound } from "lucide-react";
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
                <Link className="button-secondary" href="/banner-generator">
                  Create your banner
                </Link>
              </div>
            </div>
            <PhotoCarousel slides={featuredPhotos} />
          </div>
        </section>

        <section className="border-b border-line bg-surface py-5" aria-label="A4A reach and structure">
          <div className="site-container grid gap-4 py-2 sm:grid-cols-3 sm:gap-0">
            <div className="border-line sm:border-r sm:px-5 sm:first:pl-0">
              <p className="font-bold text-brand-forest">19 Northern states + FCT</p>
              <p className="mt-1 text-xs text-muted">A regional network with national reach</p>
            </div>
            <div className="border-line sm:border-r sm:px-5">
              <p className="font-bold text-brand-forest">Grassroots organising</p>
              <p className="mt-1 text-xs text-muted">Connecting state, LGA, and ward activity</p>
            </div>
            <div className="sm:px-5 sm:pr-0">
              <p className="font-bold text-brand-forest">Student participation</p>
              <p className="mt-1 text-xs text-muted">Creating meaningful routes for young people</p>
            </div>
          </div>
        </section>

        <section className="site-container py-14 sm:py-20" aria-labelledby="priorities-heading">
          <div className="max-w-2xl">
            <p className="eyebrow">Our priorities</p>
            <h2 id="priorities-heading" className="section-title mt-3">
              A movement built to connect policy and people
            </h2>
          </div>
          <ol className="mt-9 grid gap-8 border-y border-line py-7 md:grid-cols-3 md:gap-6">
            {priorities.map(({ number, title, copy, icon: Icon }) => (
              <li key={number} className="min-w-0">
                <span className="font-mono text-sm font-bold text-brand-ochre">{number}</span>
                <h3 className="mt-3 flex items-center gap-2 text-lg font-bold text-ink">
                  <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-forest" />
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="pb-14 sm:pb-20" aria-labelledby="banner-heading">
          <div className="site-container">
            <div className="flex items-center justify-between gap-6 overflow-hidden rounded-xl bg-brand-forest p-6 text-white sm:p-9 lg:p-12">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[.12em] text-white/75">
                  Share your support
                </p>
                <h2 id="banner-heading" className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
                  Put your name on the A4A Student Wing banner.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
                  Create a personalised campaign banner with your photo and name, then download it
                  to share.
                </p>
                <Link href="/banner-generator" className="button-secondary mt-5">
                  Make your banner <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
              <div className="hidden shrink-0 sm:block">
                <BannerTemplatePreview />
              </div>
            </div>
          </div>
        </section>
        <section
          className="border-y border-line bg-surface py-12 sm:py-16"
          aria-labelledby="updates-heading"
        >
          <div className="site-container">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">From A4A</p>
                <h2 id="updates-heading" className="section-title mt-2">
                  Updates and activities
                </h2>
              </div>
              <div className="flex gap-4 text-sm font-bold text-brand-forest">
                <Link className="underline-offset-4 hover:underline" href="/news">
                  All news
                </Link>
                <Link className="underline-offset-4 hover:underline" href="/events">
                  All events
                </Link>
              </div>
            </div>
            <div className="mt-7 grid gap-10 md:grid-cols-2">
              <section aria-labelledby="latest-news-heading">
                <h3 id="latest-news-heading" className="font-bold text-ink">
                  Latest news
                </h3>
                <div className="mt-2">
                  {news.state !== "ready" ? (
                    <ContentStatus state={news.state} />
                  ) : news.items.length === 0 ? (
                    <ContentStatus state="empty" />
                  ) : (
                    news.items
                      .slice(0, 2)
                      .map((item) => <AnnouncementCard key={item.id} item={item} />)
                  )}
                </div>
              </section>
              <section aria-labelledby="upcoming-events-heading">
                <h3 id="upcoming-events-heading" className="font-bold text-ink">
                  Upcoming events
                </h3>
                <div className="mt-2">
                  {events.state !== "ready" ? (
                    <ContentStatus state={events.state} />
                  ) : upcomingEvents.length === 0 ? (
                    <ContentStatus state="empty" />
                  ) : (
                    upcomingEvents.map((event) => <EventCard key={event.id} item={event} />)
                  )}
                </div>
              </section>
            </div>
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
