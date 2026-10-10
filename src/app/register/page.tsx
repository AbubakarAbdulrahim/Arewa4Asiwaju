"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NORTHERN_STATES, TERTIARY_INSTITUTIONS } from "@/lib/geo-data";
import { DigitalIdCard } from "@/components/cards/DigitalIdCard";
import {
  User,
  MapPin,
  GraduationCap,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    gender: "male",
    dateOfBirth: "",
    stateOfResidence: "Kano",
    lgaOfResidence: "Kano Municipal",
    ward: "",
    institutionType: "tertiary",
    institutionName: "Bayero University Kano (BUK), Kano",
    courseOfStudy: "",
    graduationYear: "2026",
    ndprConsent: true,
    codeOfConduct: true,
    emailNotifications: true,
    smsNotifications: true,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [registeredCard, setRegisteredCard] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  // Selected state object for dynamic LGA list
  const selectedState = NORTHERN_STATES.find(
    (s) => s.name.toLowerCase() === formData.stateOfResidence.toLowerCase()
  ) || NORTHERN_STATES[8]; // Default Kano

  const handleStateChange = (stateName: string) => {
    const s = NORTHERN_STATES.find((item) => item.name === stateName);
    setFormData({
      ...formData,
      stateOfResidence: stateName,
      lgaOfResidence: s && s.lgas.length > 0 ? s.lgas[0] : "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration submission failed");
      }

      setRegisteredCard(data);
      setStep(4); // Success step
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!registeredCard) return;
    setDownloading(true);
    try {
      const query = new URLSearchParams({
        name: registeredCard.fullName,
        num: registeredCard.membershipNumber,
        state: registeredCard.stateName,
        lga: registeredCard.lgaName,
        inst: registeredCard.institutionName || "",
        token: registeredCard.verificationToken,
      });

      window.open(`/api/cards/download?${query.toString()}`, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B4619]/10 text-[#0B4619] text-xs font-bold border border-[#0B4619]/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              Official Registration Desk
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B4619] tracking-tight">
              Join Arewa4Asiwaju Movement
            </h1>
            <p className="text-sm sm:text-base text-[#121713]/70 max-w-xl mx-auto">
              Register as an accredited student or youth supporter across the 19 Northern States & FCT to receive your official digital membership identification.
            </p>
          </div>

          {/* Stepper Indicator */}
          {step < 4 && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold border-b border-[#E2E6E2] pb-4">
              <div
                className={`flex items-center justify-center gap-1.5 pb-1 border-b-2 transition-all ${
                  step === 1 ? "border-[#0B4619] text-[#0B4619]" : "border-transparent text-[#64748B]"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B4619]/10 text-[10px]">
                  1
                </span>
                <span>Personal Info</span>
              </div>
              <div
                className={`flex items-center justify-center gap-1.5 pb-1 border-b-2 transition-all ${
                  step === 2 ? "border-[#0B4619] text-[#0B4619]" : "border-transparent text-[#64748B]"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B4619]/10 text-[10px]">
                  2
                </span>
                <span>Location & Campus</span>
              </div>
              <div
                className={`flex items-center justify-center gap-1.5 pb-1 border-b-2 transition-all ${
                  step === 3 ? "border-[#0B4619] text-[#0B4619]" : "border-transparent text-[#64748B]"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B4619]/10 text-[10px]">
                  3
                </span>
                <span>NDPR & Consent</span>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Registration Form Card */}
          {step < 4 ? (
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E6E2] shadow-sm space-y-6">
              {/* STEP 1: Personal Details */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-[#E2E6E2] pb-3">
                    <h2 className="text-lg font-bold text-[#0B4619] flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Step 1: Supporter Profile
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Enter your official names and active contact details.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#121713] mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="e.g. Abubakar"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E6E2] text-sm focus:ring-2 focus:ring-[#0B4619] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#121713] mb-1">
                        Last Name (Surname) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="e.g. Ibrahim"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E6E2] text-sm focus:ring-2 focus:ring-[#0B4619] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#121713] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="abubakar@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E6E2] text-sm focus:ring-2 focus:ring-[#0B4619] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#121713] mb-1">
                        Phone Number (SMS Alert) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="08031234567"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E6E2] text-sm focus:ring-2 focus:ring-[#0B4619] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#121713] mb-1">
                        Gender *
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E6E2] text-sm focus:ring-2 focus:ring-[#0B4619] outline-none bg-white"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#121713] mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E6E2] text-sm focus:ring-2 focus:ring-[#0B4619] outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
                          setErrorMessage("Please complete all required fields before proceeding.");
                          return;
                        }
                        setErrorMessage("");
                        setStep(2);
                      }}
                      className="btn-primary"
                    >
                      Next: Location & Campus
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Location & Campus */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-[#E2E6E2] pb-3">
                    <h2 className="text-lg font-bold text-[#0B4619] flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Step 2: Regional & Campus Affiliation
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Designate your grassroots chapter across Northern Nigeria.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#121713] mb-1">
                        State of Residence *
                      </label>
                      <select
                        value={formData.stateOfResidence}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E6E2] text-sm focus:ring-2 focus:ring-[#0B4619] outline-none bg-white font-medium"
                      >
                        {NORTHERN_STATES.map((st) => (
                          <option key={st.code} value={st.name}>
                            {st.name} ({st.zone})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#121713] mb-1">
                        Local Government Area (LGA) *
                      </label>
                      <select
                        value={formData.lgaOfResidence}
                        onChange={(e) => setFormData({ ...formData, lgaOfResidence: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E6E2] text-sm focus:ring-2 focus:ring-[#0B4619] outline-none bg-white font-medium"
                      >
                        {selectedState.lgas.map((lga) => (
                          <option key={lga} value={lga}>
                            {lga}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-[#121713] mb-1">
                      Tertiary Institution / Campus Chapter
                    </label>
                    <select
                      value={formData.institutionName}
                      onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E6E2] text-sm focus:ring-2 focus:ring-[#0B4619] outline-none bg-white"
                    >
                      {TERTIARY_INSTITUTIONS.map((inst) => (
                        <option key={inst} value={inst}>
                          {inst}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#121713] mb-1">
                        Course of Study / Discipline
                      </label>
                      <input
                        type="text"
                        value={formData.courseOfStudy}
                        onChange={(e) => setFormData({ ...formData, courseOfStudy: e.target.value })}
                        placeholder="e.g. Political Science / Computer Science"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E6E2] text-sm focus:ring-2 focus:ring-[#0B4619] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#121713] mb-1">
                        Expected Graduation Year
                      </label>
                      <input
                        type="text"
                        value={formData.graduationYear}
                        onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                        placeholder="2026"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E6E2] text-sm focus:ring-2 focus:ring-[#0B4619] outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-outline"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setStep(3);
                      }}
                      className="btn-primary"
                    >
                      Next: NDPR & Consent
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: NDPR Consent & Code of Conduct */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-[#E2E6E2] pb-3">
                    <h2 className="text-lg font-bold text-[#0B4619] flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5" />
                      Step 3: NDPR Compliance & Movement Consent
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Review data protection notices and confirm voluntary affiliation.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E2E6E2] space-y-3 text-xs text-[#121713]/80 leading-relaxed">
                    <p className="font-bold text-[#0B4619]">
                      Nigeria Data Protection Act (NDPA 2023) Statement:
                    </p>
                    <p>
                      Arewa4Asiwaju processes your name, contact phone number, and state of residence solely for the purpose of issuing your authenticated Digital Membership Identification, chapter administration, and sending verified civic updates. We implement end-to-end Row Level Security, opaque cryptographic QR tokens, and will never sell or disclose your personal details to unauthorized commercial third parties.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.ndprConsent}
                        onChange={(e) => setFormData({ ...formData, ndprConsent: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded text-[#0B4619] focus:ring-[#0B4619]"
                      />
                      <span className="text-xs text-[#121713]">
                        I have read and consent to the data protection terms under NDPR/NDPA 2023 for digital membership processing. *
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.codeOfConduct}
                        onChange={(e) => setFormData({ ...formData, codeOfConduct: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded text-[#0B4619] focus:ring-[#0B4619]"
                      />
                      <span className="text-xs text-[#121713]">
                        I subscribe to the progressive values of Arewa4Asiwaju and pledge to abide by the movement's peaceful code of conduct. *
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.emailNotifications}
                        onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded text-[#0B4619] focus:ring-[#0B4619]"
                      />
                      <span className="text-xs text-[#64748B]">
                        Receive official campaign notifications, event invitations, and policy announcements via email and SMS.
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-outline"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !formData.ndprConsent || !formData.codeOfConduct}
                      className="btn-primary"
                    >
                      {loading ? (
                        <>Issuing Credentials...</>
                      ) : (
                        <>
                          Complete Registration & Issue ID
                          <Sparkles className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* STEP 4: Success View */
            <div className="bg-white p-6 sm:p-10 rounded-2xl border-2 border-[#0B4619] shadow-xl text-center space-y-8 animate-in zoom-in-95 duration-300">
              <div className="space-y-2">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#0B4619]/10 text-[#0B4619] mx-auto shadow-inner">
                  <CheckCircle className="h-10 w-10 text-[#0B4619]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B4619]">
                  Registration Successful!
                </h2>
                <p className="text-sm text-[#64748B] max-w-md mx-auto">
                  Welcome to the Arewa4Asiwaju Movement. Your official digital membership record has been issued with unique cryptographic authentication.
                </p>
              </div>

              {/* Live Rendered Flippable ID Card */}
              {registeredCard && (
                <div className="py-2">
                  <DigitalIdCard
                    fullName={registeredCard.fullName}
                    membershipNumber={registeredCard.membershipNumber}
                    stateName={registeredCard.stateName}
                    lgaName={registeredCard.lgaName}
                    institutionName={registeredCard.institutionName}
                    issuedAt={registeredCard.issuedAt}
                    expiresAt={registeredCard.expiresAt}
                    qrCodeUrl={registeredCard.qrCodeUrl}
                    verificationToken={registeredCard.verificationToken}
                    status="active"
                    onDownloadPdf={handleDownloadPdf}
                    isDownloading={downloading}
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-[#E2E6E2]">
                <a
                  href={`/verify-card?token=${registeredCard?.verificationToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full sm:w-auto"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Test Live Card Verification
                </a>
                <a
                  href="/portal"
                  className="btn-primary w-full sm:w-auto"
                >
                  Go to Member Portal
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
