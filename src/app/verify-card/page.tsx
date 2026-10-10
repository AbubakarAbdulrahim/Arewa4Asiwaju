"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  Lock,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

interface VerificationResult {
  isValid: boolean;
  status: string;
  initials?: string;
  stateName?: string;
  membershipMasked?: string;
  issueYear?: number;
  expiresAt?: string;
  verifiedAt?: string;
  message?: string;
}

export default function VerifyCardPage() {
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token") || "";

  const [inputToken, setInputToken] = useState(urlToken);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = async (tokenToVerify: string) => {
    if (!tokenToVerify.trim()) return;
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/verify-token?token=${encodeURIComponent(tokenToVerify.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        isValid: false,
        status: "error",
        message: "Failed to connect to verification authority. Please retry.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlToken) {
      setInputToken(urlToken);
      handleVerify(urlToken);
    }
  }, [urlToken]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B4619]/10 text-[#0B4619] text-xs font-bold border border-[#0B4619]/20">
              <Lock className="h-3.5 w-3.5" />
              Official Cryptographic Verification
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B4619] tracking-tight">
              Verify Digital Membership ID Card
            </h1>
            <p className="text-sm sm:text-base text-[#121713]/70 max-w-xl mx-auto">
              Scan the QR code printed on the physical card or enter the security verification token below to instantly confirm member legitimacy.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E6E2] shadow-sm space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify(inputToken);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="Enter 32-character QR Token or Scan Token..."
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E6E2] focus:outline-none focus:ring-2 focus:ring-[#0B4619] text-sm bg-[#FBF9F5]/40"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !inputToken.trim()}
                className="btn-primary py-3 px-6 whitespace-nowrap"
              >
                {loading ? "Verifying..." : "Verify Credential"}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#E2E6E2]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#0B4619]" />
                Zero Personal Data Leakage (NDPR Compliant)
              </span>
              <button
                type="button"
                onClick={() => {
                  const demoToken = "arewa4asiwaju-verification-token-sample";
                  setInputToken(demoToken);
                  handleVerify(demoToken);
                }}
                className="text-[#0B4619] font-semibold hover:underline"
              >
                Try Sample Token
              </button>
            </div>
          </div>

          {/* Verification Result Card */}
          {hasSearched && (
            <div className="transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
              {loading ? (
                <div className="bg-white p-8 rounded-2xl border border-[#E2E6E2] text-center space-y-3">
                  <div className="h-10 w-10 border-4 border-[#0B4619] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-[#121713]">
                    Querying cryptographic ledger...
                  </p>
                </div>
              ) : result && result.isValid ? (
                <div className="bg-white rounded-2xl border-2 border-[#0B4619] p-6 sm:p-8 shadow-lg space-y-6 relative overflow-hidden">
                  {/* Decorative badge */}
                  <div className="absolute top-0 right-0 bg-[#0B4619] text-[#C59B27] py-1.5 px-6 rounded-bl-2xl font-bold text-xs tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> OFFICIAL REGISTRY
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-[#0B4619] text-[#C59B27] flex items-center justify-center shrink-0 shadow">
                      <ShieldCheck className="h-8 w-8 text-[#C59B27]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="badge-emerald">AUTHENTIC & ACTIVE</span>
                        <span className="text-xs text-[#64748B]">Issued {result.issueYear}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B4619] mt-1">
                        Legitimate Arewa4Asiwaju Credential
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#FBF9F5] border border-[#E2E6E2]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                        Member Initials
                      </span>
                      <span className="text-base font-bold text-[#121713]">
                        {result.initials || "A. B."}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                        State Chapter
                      </span>
                      <span className="text-base font-bold text-[#0B4619] flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#C59B27]" />
                        {result.stateName || "Kano"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                        Membership Code
                      </span>
                      <span className="text-base font-mono font-bold text-[#121713]">
                        {result.membershipMasked}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                        Expiry Date
                      </span>
                      <span className="text-base font-bold text-[#121713] flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#64748B]" />
                        {result.expiresAt
                          ? new Date(result.expiresAt).getFullYear()
                          : "2030"}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-[#64748B] flex items-center justify-between pt-2 border-t border-[#E2E6E2]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Verified at: {result.verifiedAt ? new Date(result.verifiedAt).toLocaleTimeString() : "Just now"}
                    </span>
                    <span className="text-[#0B4619] font-medium">
                      National Membership Directorate
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border-2 border-red-500 p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 text-red-600">
                    <ShieldAlert className="h-8 w-8 shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold">Unverified or Invalid Credential</h3>
                      <p className="text-sm text-red-600/80">
                        {result?.message || "This card token is not recognized in our national database or has been revoked."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
