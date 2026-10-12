"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RetrieveIdPage() {
  const [identifier, setIdentifier] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/retrieve-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "We could not process that request.");
      setMessage(
        result.message ||
          "If these details match an active membership, check its registered email.",
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "We could not process that request.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="site-container flex-1 py-12 sm:py-16">
        <section className="surface mx-auto max-w-xl p-6 sm:p-9">
          <div className="eyebrow inline-flex items-center gap-2">
            <KeyRound aria-hidden="true" className="h-4 w-4" /> Member card access
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">
            Retrieve your membership ID
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Enter your membership number, registered email address, or the 64-character QR token. We
            will send a secure sign-in link to the email address saved on the matching active
            membership.
          </p>
          <form className="mt-7 space-y-4" onSubmit={submit}>
            <label className="field-label" htmlFor="member-identifier">
              One membership identifier
            </label>
            <input
              id="member-identifier"
              className="field-control font-mono"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="off"
              maxLength={254}
              required
              aria-describedby="identifier-help"
            />
            <p id="identifier-help" className="text-xs text-muted">
              Use one identifier only. Membership numbers and QR tokens are identifiers, not
              passwords.
            </p>
            <button className="button-primary w-full justify-center" type="submit" disabled={busy}>
              {busy ? "Submitting request…" : "Send secure access link"}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </form>
          {message && (
            <p
              className="mt-4 border border-green-300 bg-green-50 p-3 text-sm text-green-950"
              role="status"
            >
              {message}
            </p>
          )}
          {error && (
            <p
              className="mt-4 border border-red-300 bg-red-50 p-3 text-sm text-red-900"
              role="alert"
            >
              {error}
            </p>
          )}
          <div className="mt-6 border-t border-line pt-5 text-sm leading-relaxed text-muted">
            <p className="flex items-start gap-2">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-brand-forest"
              />
              This does not verify a new registration. The sign-in link confirms access to the
              registered inbox before a private card can be opened. The QR verification page remains
              public and only reports card status.
            </p>
          </div>
          <p className="mt-5 text-sm text-muted">
            Need to create a membership?{" "}
            <Link className="font-semibold text-brand-forest underline" href="/register">
              Register with A4A
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
