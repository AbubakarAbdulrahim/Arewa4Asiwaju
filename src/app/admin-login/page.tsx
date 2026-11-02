"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
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
            <p className="mt-0.5 text-xs text-muted">Administration</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-ink">Admin sign in</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Sign in with your administrator account.
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
            {busy ? "Signing in…" : "Sign in"}
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
          <Link href="/login" className="font-bold text-brand-forest underline underline-offset-4">
            Go to member access
          </Link>
        </p>
        <p className="mt-4 text-xs leading-5 text-muted">
          Administrator accounts require an assigned role and multi-factor authentication.
        </p>
      </section>
    </main>
  );
}
