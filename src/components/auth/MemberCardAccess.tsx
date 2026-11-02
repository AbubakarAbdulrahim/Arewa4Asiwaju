"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export function MemberCardAccess() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "We could not process that request.");
      router.replace("/portal/id-card");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "We could not process that request.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordReset() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/member-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Password recovery is unavailable.");
      setMessage(
        result.message ||
          "If the details match an active membership, reset instructions will be sent.",
      );
    } catch (resetError) {
      setError(
        resetError instanceof Error ? resetError.message : "Password recovery is unavailable.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-[#f4f7f4]">
      <Navbar />
      <main id="main-content" className="site-container flex flex-1 items-center py-8 sm:py-12">
        <section className="mx-auto w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <Image
              src="/brand/arewa-for-asiwaju-a4a.jpg"
              alt="Arewa for Asiwaju logo"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full border border-line object-cover"
              priority
            />
            <div>
              <p className="text-sm font-bold text-ink">Arewa for Asiwaju</p>
              <p className="mt-0.5 text-xs text-muted">Student Wing member access</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome back!</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Sign in with your registered email or membership number to access your ID card.
          </p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div>
              <label className="field-label" htmlFor="member-identifier">
                Email address or membership number
              </label>
              <input
                id="member-identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={254}
                required
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="name@example.com or A4A-2026-KN-KMC001"
                className="field-input"
                aria-describedby="member-access-hint"
              />
              <p id="member-access-hint" className="mt-2 text-xs leading-5 text-muted">
                Use the email on your account or your membership number.
              </p>
            </div>
            <div>
              <label className="field-label" htmlFor="member-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="member-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  minLength={8}
                  maxLength={128}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="field-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink focus-visible:outline-2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <Eye aria-hidden="true" className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="button-primary min-h-12 w-full justify-center"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <button
            type="button"
            disabled={busy || identifier.trim().length < 4}
            onClick={requestPasswordReset}
            className="mt-3 w-full py-2 text-center text-sm font-semibold text-brand-forest underline underline-offset-4 disabled:opacity-50"
          >
            {busy ? "Please wait…" : "Forgot your password? Reset it by email"}
          </button>

          {message && (
            <p
              role="status"
              className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm leading-6 text-green-950"
            >
              {message}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-900"
            >
              {error}
            </p>
          )}

          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Administration
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <Link
            href="/admin-login"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-line px-4 py-3 text-sm font-bold text-ink no-underline transition-colors hover:border-brand-forest hover:bg-[#f7faf7]"
          >
            Log in as admin
          </Link>

          <p className="mt-6 text-center text-sm text-muted">
            New to the Student Wing?{" "}
            <Link
              className="font-bold text-brand-forest underline underline-offset-4"
              href="/register"
            >
              Register here
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
