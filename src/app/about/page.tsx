import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Target, Users, BookOpen, Compass, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "About Movement & Manifesto",
  description: "Learn about Arewa4Asiwaju's mission, values, and grassroots youth leadership structure.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B4619]/10 text-[#0B4619] text-xs font-bold border border-[#0B4619]/20">
            <Compass className="h-3.5 w-3.5" />
            Our Heritage & Vision
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0B4619] tracking-tight">
            About Arewa4Asiwaju
          </h1>
          <p className="text-base sm:text-lg text-[#121713]/70 max-w-2xl mx-auto">
            A coalition of progressive students, emerging professionals, and grassroots youth organizers dedicated to northern development and national unity.
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-[#E2E6E2] shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-xl bg-[#0B4619] text-[#C59B27] flex items-center justify-center font-bold">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#121713]">Our Core Mission</h2>
            <p className="text-sm text-[#121713]/80 leading-relaxed">
              To organize, mobilize, and empower the student and youth population across the 19 Northern Nigerian States and the Federal Capital Territory through education, technological advancement, civic education, and policy advocacy.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#E2E6E2] shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-xl bg-[#C59B27] text-[#121713] flex items-center justify-center font-bold">
              <Compass className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#121713]">Our Long-Term Vision</h2>
            <p className="text-sm text-[#121713]/80 leading-relaxed">
              A united, prosperous Northern Nigeria where every student and young professional has verifiable institutional representation, direct access to economic opportunities, and the digital tools required to excel on global stages.
            </p>
          </div>
        </div>

        {/* Strategic Manifesto & Principles */}
        <div className="bg-white p-8 rounded-2xl border border-[#E2E6E2] shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-[#0B4619]">
            The 4 Foundational Pillars of the Movement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#0B4619] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-[#121713]">Academic Welfare & Subsidy Access</h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Facilitating federal student loan enrollments (NELFUND), tuition assistance schemes, and campus hostel renovations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#0B4619] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-[#121713]">Digital Transformation & AI Literacy</h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Setting up regional coding hubs, software engineering incubators, and remote work employment pipelines.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#0B4619] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-[#121713]">Grassroots Democratic Inclusion</h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Empowering elected campus directors and LGA coordinators with decentralized decision-making authority.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#0B4619] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-[#121713]">Agro-Allied Youth Entrepreneurship</h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Supporting young graduates in modernized irrigation farming, grain storage tech, and livestock value chains.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
