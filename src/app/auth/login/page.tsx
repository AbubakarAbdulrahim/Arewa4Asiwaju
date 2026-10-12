"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function MemberLoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          next: new URLSearchParams(window.location.search).get("next"),
        }),
      });
      const result = await response.json();
      if (!response.ok) setError(result.error ?? "Sign-in is temporarily unavailable.");
      else setMessage(result.message);
    } catch {
      setError("Sign-in is temporarily unavailable. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="site-container py-12 sm:py-20">
      <section className="mx-auto max-w-lg border border-line bg-surface p-6 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.15em] text-brand-forest">
          Member access
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Sign in to your account</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          We’ll email a one-time sign-in link to the address on your membership. The same link can
          help you recover access.
        </p>
        <form className="mt-7 space-y-4" onSubmit={submit}>
          <label className="field-label" htmlFor="member-email">
            Email address
          </label>
          <input
            id="member-email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field-input"
          />
          <button type="submit" disabled={busy} className="button-primary w-full justify-center">
            {busy ? "Sending link…" : "Email me a sign-in link"}
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
          <p className="mt-4 border border-red-300 bg-red-50 p-3 text-sm text-red-900" role="alert">
            {error}
          </p>
        )}
        <p className="mt-6 text-sm text-muted">
          Not a member yet?{" "}
          <Link className="font-semibold text-brand-forest underline" href="/register">
            Register with A4A
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
