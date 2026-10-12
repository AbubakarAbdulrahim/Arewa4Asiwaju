"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function AdminPasswordResetForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("new-password") ?? "");
    const confirmation = String(form.get("confirm-password") ?? "");

    if (password.length < 12) {
      setError("Use a password with at least 12 characters.");
      setBusy(false);
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      setBusy(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError("We could not update the password. Request a new reset link and try again.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Password update is temporarily unavailable. Please try again.");
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
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Set a new password</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Choose a password with at least 12 characters for your administrator account.
        </p>
        <form className="mt-7 space-y-4" onSubmit={submit}>
          <div>
            <label className="field-label" htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              name="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="confirm-password">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
              className="field-input"
            />
          </div>
          <button type="submit" disabled={busy} className="button-primary w-full justify-center">
            {busy ? "Updating password…" : "Set new password"}
          </button>
        </form>
        {error && (
          <p className="mt-4 border border-red-300 bg-red-50 p-3 text-sm text-red-900" role="alert">
            {error}
          </p>
        )}
        <p className="mt-6 text-sm text-muted">
          Reset link expired?{" "}
          <Link className="font-semibold text-brand-forest underline" href="/admin-login">
            Request another
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
