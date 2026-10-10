import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  Award,
  Sparkles,
  Search,
  ExternalLink,
  BookOpen,
  Briefcase,
  Layers,
} from "lucide-react";

export default function HomePage() {
  const stats = [
    { label: "Northern States & FCT", value: "20", sub: "Complete regional coverage" },
    { label: "Local Government Areas", value: "419", sub: "Grassroots mobilization" },
    { label: "Tertiary Campus Chapters", value: "85+", sub: "Universities & Polytechnics" },
    { label: "ID Verification", value: "100%", sub: "Cryptographic QR security" },
  ];

  const pillars = [
    {
      icon: GraduationCap,
      title: "Student Welfare & Grants",
      desc: "Advocating for educational subsidies, digital learning infrastructure, and student bursaries across all northern tertiary institutions.",
    },
    {
      icon: Sparkles,
      title: "Digital Skills & Tech Hubs",
      desc: "Training over 100,000 northern youth in software engineering, AI, robotics, and digital marketing to power the emerging economy.",
    },
    {
      icon: Users,
      title: "Grassroots Civic Representation",
      desc: "Organizing transparent, democratic youth councils from ward levels to the national secretariat, ensuring young voices guide policy.",
    },
    {
      icon: Briefcase,
      title: "Agri-Tech & Enterprise Grants",
      desc: "Bridging modern agricultural mechanization and capital funding for ambitious youth farmers across the savannas and river basins.",
    },
  ];

  const upcomingEvents = [
    {
      id: "arewa-youth-leadership-summit-2026",
      title: "Arewa Youth Leadership & Digital Economy Summit 2026",
      date: "OCT 24, 2026",
      venue: "International Conference Centre (ICC), Central Area, Abuja",
      tag: "National Summit",
      badge: "badge-emerald",
    },
    {
      id: "buk-campus-civic-symposium",
      title: "BUK Campus Civic Mobilization Symposium",
      date: "NOV 02, 2026",
      venue: "Musa Abdullahi Auditorium, Bayero University Kano (New Campus)",
      tag: "Campus Townhall",
      badge: "badge-gold",
    },
  ];

  const recentNews = [
    {
      slug: "launch-of-central-digital-portal",
      title: "Arewa4Asiwaju Launches Central Digital Supporter Portal and High-Security Digital ID System",
      date: "October 07, 2026",
      category: "Press Release",
      excerpt: "The official student and youth movement has unveiled its automated digital membership platform across the 19 northern states and the FCT.",
    },
    {
      slug: "national-youth-leadership-tech-summit",
      title: "National Youth Leadership & Tech Innovation Summit Announced for Abuja",
      date: "October 04, 2026",
      category: "Announcement",
      excerpt: "Over 5,000 delegates from student union bodies, artisan councils, and youth directorates set to convene at the ICC Abuja.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E2E6E2]">
          <div className="absolute inset-0 bg-[radial-gradient(#0B4619_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Headlines */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B4619]/10 text-[#0B4619] text-xs font-bold border border-[#0B4619]/20 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-[#0B4619]" />
                  <span>The Official Northern Student & Youth Wing</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#121713] tracking-tight leading-[1.12]">
                  Uniting Progressive Youth Across the{" "}
                  <span className="text-[#0B4619]">19 Northern States</span> & FCT.
                </h1>

                <p className="text-base sm:text-lg text-[#121713]/75 max-w-2xl leading-relaxed">
                  Join Nigeria&apos;s most organized grassroots student and youth movement. We champion student welfare, educational reform, technological skill acquisition, and economic inclusion under one authentic digital canopy.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href="/register"
                    className="btn-primary w-full sm:w-auto text-base px-7 py-3.5 shadow-md hover:shadow-lg"
                  >
                    Join Movement & Get Digital ID
                    <ArrowRight className="h-5 w-5" />
                  </Link>

                  <Link
                    href="/verify-card"
                    className="btn-outline w-full sm:w-auto text-base px-7 py-3.5 bg-white/60"
                  >
                    <Search className="h-4 w-4" />
                    Verify Any Member ID Card
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#64748B] font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#0B4619]" />
                    Instant Vector PDF Issuance
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#0B4619]" />
                    NDPA 2023 Data Compliant
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#0B4619]" />
                    Campus Chapter Verified
                  </span>
                </div>
              </div>

              {/* Right Column: Interactive ID Card Hero Preview */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-md bg-white p-6 rounded-3xl border border-[#E2E6E2] shadow-xl relative space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E2E6E2] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B4619]">
                      Cryptographic Smart Credential
                    </span>
                  </div>

                  {/* Visual ID Card Card Mock */}
                  <div className="aspect-[85.6/53.98] rounded-2xl bg-gradient-to-br from-[#0B4619] to-[#06260d] text-white p-5 shadow-lg relative overflow-hidden flex flex-col justify-between border border-[#C59B27]/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-[#C59B27] text-[#121713] font-bold text-xs flex items-center justify-center">
                          A4A
                        </div>
                        <div>
                          <p className="text-[11px] font-bold leading-tight">AREWA4ASIWAJU</p>
                          <p className="text-[8px] text-[#C59B27] tracking-wider uppercase">
                            Official Student Wing
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold bg-[#C59B27]/20 border border-[#C59B27]/40 px-2 py-0.5 rounded-full text-[#C59B27]">
                        ACTIVE 2026
                      </span>
                    </div>

                    <div className="my-auto grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-4 aspect-[3/4] bg-white/10 rounded-lg border border-[#C59B27]/50 flex flex-col items-center justify-center text-center">
                        <div className="h-7 w-7 rounded-full bg-[#C59B27] text-[#121713] font-bold text-[10px] flex items-center justify-center mb-0.5">
                          U
                        </div>
                        <span className="text-[7.5px] font-bold text-[#C59B27]">OFFICIAL</span>
                      </div>
                      <div className="col-span-8 space-y-1">
                        <div>
                          <span className="text-[7px] text-white/60 uppercase block">Name</span>
                          <span className="text-xs font-bold">UMAR FAROUQ BELLO</span>
                        </div>
                        <div>
                          <span className="text-[7px] text-white/60 uppercase block">Membership ID</span>
                          <span className="text-xs font-mono font-bold text-[#C59B27]">
                            A4A-2026-KN-000142
                          </span>
                        </div>
                        <div className="text-[8px] text-white/80">
                          <span>KANO STATE / BUK CHAPTER</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[7px] text-white/60 pt-1 border-t border-white/10">
                      <span>SECURE QR ENABLED</span>
                      <span className="text-[#C59B27]">AREWA4ASIWAJU.ORG</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-[#64748B] text-center">
                      Every verified supporter receives this digital credential with high-resolution vector PDF and tamper-proof verification QR code.
                    </p>
                    <Link
                      href="/register"
                      className="block text-center py-2.5 px-4 rounded-xl bg-[#0B4619]/10 text-[#0B4619] font-bold text-xs hover:bg-[#0B4619]/15 transition-colors"
                    >
                      Get Your Card in 2 Minutes →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS & STATS SECTION */}
        <section className="py-12 bg-white border-b border-[#E2E6E2]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {stats.map((st) => (
                <div key={st.label} className="text-center p-4 rounded-2xl bg-[#FBF9F5] border border-[#E2E6E2]">
                  <p className="text-3xl sm:text-4xl font-extrabold text-[#0B4619]">
                    {st.value}
                  </p>
                  <p className="text-sm font-bold text-[#121713] mt-1">{st.label}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{st.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CORE PILLARS & INITIATIVES */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">
              Strategic Foundations
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B4619] tracking-tight">
              Empowering Northern Nigerian Youth Through Purposeful Action
            </h2>
            <p className="text-sm sm:text-base text-[#121713]/70">
              Arewa4Asiwaju provides an organized platform that bridges grassroots youth aspirations directly with progressive governance policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="card-elevated p-6 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-[#0B4619]/10 text-[#0B4619] flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#121713]">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-[#121713]/70 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#E2E6E2]">
                    <span className="text-xs font-bold text-[#0B4619] flex items-center gap-1">
                      Priority Initiative <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* LATEST NEWS & ANNOUNCEMENTS */}
        <section className="py-20 bg-white border-y border-[#E2E6E2]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">
                  Directorate of Media
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B4619]">
                  Verified News & Press Statements
                </h2>
              </div>
              <Link
                href="/news"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B4619] hover:underline"
              >
                View all news & releases <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recentNews.map((item) => (
                <article
                  key={item.slug}
                  className="p-6 rounded-2xl bg-[#FBF9F5] border border-[#E2E6E2] space-y-3 hover:border-[#0B4619]/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="badge-emerald">{item.category}</span>
                    <span className="text-xs text-[#64748B]">{item.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#121713] hover:text-[#0B4619] transition-colors">
                    <Link href={`/news/${item.slug}`}>{item.title}</Link>
                  </h3>
                  <p className="text-sm text-[#121713]/70 leading-relaxed">
                    {item.excerpt}
                  </p>
                  <Link
                    href={`/news/${item.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0B4619] hover:underline pt-2"
                  >
                    Read full statement <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* UPCOMING EVENTS */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">
                Civic Mobilization Calendar
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B4619]">
                Upcoming Summits & Campus Rallies
              </h2>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B4619] hover:underline"
            >
              Browse event schedule <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white p-6 rounded-2xl border border-[#E2E6E2] shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={evt.badge}>{evt.tag}</span>
                    <span className="text-xs font-bold text-[#0B4619] flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {evt.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#121713]">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-[#64748B] flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 text-[#C59B27] shrink-0 mt-0.5" />
                    <span>{evt.venue}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E2E6E2] flex items-center justify-between">
                  <span className="text-xs text-[#64748B]">Digital Member Pass Required</span>
                  <Link
                    href={`/events/${evt.id}`}
                    className="btn-primary py-2 px-4 text-xs"
                  >
                    RSVP Attendance
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION BANNER */}
        <section className="bg-[#0B4619] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-[#C59B27]/40">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="badge-gold">
              BECOME PART OF PROGRESSIVE HISTORY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Represent Your Campus and Community?
            </h2>
            <p className="text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
              Register now to receive your official membership number, secure digital identification card, and gain voting representation in your chapter.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto shadow-lg"
              >
                Start Supporter Registration
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white border border-white/30 rounded-lg hover:bg-white/10 w-full sm:w-auto transition-colors"
              >
                Learn More About A4A
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
