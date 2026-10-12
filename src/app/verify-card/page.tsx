"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type VerificationResult = {
  isValid: boolean;
  status: "active" | "invalid" | "unavailable";
  membershipMasked?: string;
  issueYear?: number;
  expiresAt?: string;
  verifiedAt?: string;
  message?: string;
};

function VerifyCardContent() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const verify = useCallback(async (candidate: string) => {
    const cleanToken = candidate.trim();
    if (!/^[a-fA-F0-9]{64}$/.test(cleanToken)) {
      setResult({
        isValid: false,
        status: "invalid",
        message: "Enter a 64-character card QR token.",
      });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ token: cleanToken }),
      });
      const data = (await response.json()) as VerificationResult;
      setResult(data);
    } catch {
      setResult({
        isValid: false,
        status: "unavailable",
        message: "Verification is temporarily unavailable. Please retry.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const tokenFromUrl = window.location.hash.slice(1);
    if (tokenFromUrl) {
      window.history.replaceState(window.history.state, "", "/verify-card");
      const timer = window.setTimeout(() => void verify(tokenFromUrl), 0);
      return () => window.clearTimeout(timer);
    }
  }, [verify]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void verify(token);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="site-container flex-1 py-12 sm:py-16">
        <header className="mx-auto mb-8 max-w-2xl text-center">
          <div className="eyebrow inline-flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" /> Public card check
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Verify a membership card
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Scan the QR code or enter the card token to check whether it is currently active. This
            check does not reveal a member’s name or contact details.
          </p>
        </header>
        <section className="surface mx-auto max-w-2xl p-5 sm:p-7">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="verification-token">
                Card QR token
              </label>
              <input
                id="verification-token"
                className="field-control font-mono"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                autoComplete="off"
                inputMode="text"
                maxLength={64}
                minLength={64}
                pattern="[a-fA-F0-9]{64}"
                required
                aria-describedby="token-help"
              />
              <p id="token-help" className="mt-1 text-xs text-muted">
                The token is a random code printed as a QR code on the card.
              </p>
            </div>
            <button type="submit" className="button-primary w-full sm:w-auto" disabled={loading}>
              {loading ? "Checking card…" : "Check card status"}
            </button>
          </form>
          <div className="mt-6 border-t border-line pt-5" aria-live="polite">
            {loading && (
              <p role="status" className="text-sm text-muted">
                Checking the current membership record…
              </p>
            )}
            {!loading && result?.status === "active" && result.isValid && (
              <div role="status" className="rounded-sm border border-green-300 bg-green-50 p-4">
                <div className="flex items-center gap-2 font-bold text-green-900">
                  <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                  Active membership card
                </div>
                <p className="mt-2 text-sm text-green-950">{result.message}</p>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-bold uppercase text-muted">Membership</dt>
                    <dd className="mt-1 font-mono font-bold">{result.membershipMasked}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase text-muted">Issued</dt>
                    <dd className="mt-1">{result.issueYear}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase text-muted">Expires</dt>
                    <dd className="mt-1 flex items-center gap-1">
                      <CalendarDays aria-hidden="true" className="h-4 w-4" />
                      {result.expiresAt ? new Date(result.expiresAt).getFullYear() : "Not stated"}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
            {!loading && result?.status === "invalid" && (
              <div role="status" className="rounded-sm border border-red-300 bg-red-50 p-4">
                <div className="flex items-center gap-2 font-bold text-red-900">
                  <ShieldAlert aria-hidden="true" className="h-5 w-5" />
                  No active card found
                </div>
                <p className="mt-2 text-sm text-red-950">{result.message}</p>
              </div>
            )}
            {!loading && result?.status === "unavailable" && (
              <div role="status" className="notice">
                <p className="font-bold text-ink">Verification is temporarily unavailable</p>
                <p className="mt-1 text-sm text-muted">{result.message}</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function VerifyCardPage() {
  return <VerifyCardContent />;
}
