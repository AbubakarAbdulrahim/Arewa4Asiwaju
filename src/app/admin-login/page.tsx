"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError("Sign-in failed. Check your email and password, then try again.");
        return;
      }
      router.replace("/admin");
    } catch {
      setError("Admin sign-in is temporarily unavailable. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordReset() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", "/admin-login/reset");
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: callback.toString(),
      });
      if (resetError) {
        setError(
          "We could not request a reset link. Please check the account email and try again.",
        );
        return;
      }
      setMessage("If this email belongs to an account, a password reset link will be sent.");
    } catch {
      setError("Password reset is temporarily unavailable. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content" className="min-h-[75vh] bg-[#f4f7f4] px-4 py-8 sm:py-14">
      <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-xl border border-line bg-white shadow-[0_20px_60px_-40px_rgba(0,30,15,.45)] lg:grid-cols-[.9fr_1.1fr]">
        <aside className="relative isolate flex flex-col justify-between overflow-hidden bg-[#06452b] p-6 text-white sm:p-9 lg:min-h-[590px] lg:p-11">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(45,135,82,.5),transparent_55%),linear-gradient(150deg,#075a35,#04361f)]" />
          <Link
            href="/login"
            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-white/85 no-underline hover:text-white"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Member ID card access
          </Link>
          <div className="mt-9 lg:mt-0">
            <Image
              src="/brand/arewa-for-asiwaju-a4a.jpg"
              alt="Arewa for Asiwaju logo"
              width={68}
              height={68}
              className="h-[68px] w-[68px] rounded-full border-2 border-white/80 object-cover"
              priority
            />
            <p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-white/70">
              A4A administration
            </p>
            <h1 className="mt-3 max-w-sm text-3xl font-bold tracking-tight sm:text-4xl">
              Your team&apos;s work, in one place.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/80">
              Sign in to manage membership, local structures, events, and published updates.
            </p>
          </div>
          <p className="mt-8 flex items-start gap-2 border-t border-white/20 pt-4 text-xs leading-5 text-white/65 lg:mt-0">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            Administrator accounts require an assigned role and a second authentication step.
          </p>
        </aside>

        <section className="flex flex-col justify-center p-6 sm:p-9 lg:p-11">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-[#edf5ef] text-brand-forest">
            <LockKeyhole aria-hidden="true" className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-brand-forest">
            Secure workspace
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Admin sign in
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Use your administrator email and password to continue.
          </p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div>
              <label className="field-label" htmlFor="admin-email">
                Email address
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                maxLength={254}
                placeholder="admin@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field-input"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="button-primary min-h-12 w-full justify-center"
            >
              {busy ? "Signing in…" : "Sign in to administration"}
              {!busy && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
            </button>
            <button
              type="button"
              disabled={busy || !email.trim()}
              onClick={requestPasswordReset}
              className="w-full py-2 text-center text-sm font-semibold text-brand-forest underline underline-offset-4 disabled:opacity-50"
            >
              Forgot your password? Send a reset link
            </button>
          </form>

          {message && (
            <p
              className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-950"
              role="status"
            >
              {message}
            </p>
          )}
          {error && (
            <p
              className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900"
              role="alert"
            >
              {error}
            </p>
          )}
          <p className="mt-6 border-t border-line pt-5 text-sm text-muted">
            Looking for your membership card?{" "}
            <Link
              href="/login"
              className="font-bold text-brand-forest underline underline-offset-4"
            >
              Go to member access
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}
