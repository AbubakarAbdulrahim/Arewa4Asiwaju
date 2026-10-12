"use client";

import { FormEvent, useState } from "react";
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
        setError("We could not request a reset link. Check the Supabase Auth redirect URL and email delivery settings, then try again.");
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
    <main id="main-content" className="site-container py-12 sm:py-20">
      <section className="mx-auto max-w-lg border border-line bg-surface p-6 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.15em] text-brand-forest">
          A4A administration
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Admin sign in</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Use your administrator account email and password. Accounts must have an assigned administrative role, and privileged access requires multi-factor authentication.
        </p>

        <form className="mt-7 space-y-4" onSubmit={submit}>
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field-input"
            />
          </div>
          <button type="submit" disabled={busy} className="button-primary w-full justify-center">
            {busy ? "Signing in…" : "Sign in to administration"}
          </button>
          <button
            type="button"
            disabled={busy || !email.trim()}
            onClick={requestPasswordReset}
            className="w-full text-center text-sm font-semibold text-brand-forest underline disabled:opacity-50"
          >
            Forgot password? Send a reset link
          </button>
        </form>

        {message && (
          <p className="mt-4 border border-green-300 bg-green-50 p-3 text-sm text-green-950" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 border border-red-300 bg-red-50 p-3 text-sm text-red-900" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
