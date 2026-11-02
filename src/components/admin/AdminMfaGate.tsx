"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getTotpQrDataUrl } from "@/lib/auth/totp-qr";

export function AdminMfaGate() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [factorId, setFactorId] = useState("");
  const [verifiedFactor, setVerifiedFactor] = useState(false);
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [qrError, setQrError] = useState(false);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loginSuccessful, setLoginSuccessful] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    void supabase.auth.mfa.listFactors().then(({ data, error }) => {
      if (error) setMessage("Authenticator setup is unavailable. Try again later.");
      else {
        const verified = data.totp.find((factor) => factor.status === "verified");
        if (verified) {
          setFactorId(verified.id);
          setVerifiedFactor(true);
        }
      }
      setLoading(false);
    });
  }, [supabase]);

  async function beginSetup() {
    setBusy(true);
    setMessage("");
    try {
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw new Error("Could not load authenticator settings.");
      for (const factor of factors.all.filter(
        (item) => item.factor_type === "totp" && item.status === "unverified",
      )) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "A4A administrator authenticator",
        issuer: "Arewa4Asiwaju",
      });
      if (error) throw new Error("Could not begin authenticator setup.");
      setFactorId(data.id);
      setSecret(data.totp.secret);
      setQrError(false);
      setQrCode(getTotpQrDataUrl(data.totp.qr_code));
    } catch {
      setMessage(
        "Authenticator setup could not be started. Try again or contact the system administrator.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!factorId) return;
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: code.replace(/\s/g, ""),
      });
      if (error) throw new Error("Invalid or expired code.");
      setLoginSuccessful(true);
    } catch {
      setMessage("That code could not be verified. Check your authenticator and try again.");
    } finally {
      setBusy(false);
      setCode("");
    }
  }

  useEffect(() => {
    if (loginSuccessful) continueButtonRef.current?.focus();
  }, [loginSuccessful]);

  return (
    <main id="main-content" className="site-container min-h-[75vh] py-12 sm:py-16">
      <p className="eyebrow">Administrator security</p>
      <h1 className="section-title mt-2">Verify your sign-in</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Administration requires a second factor. Set up an authenticator app or enter a code from
        one you have already verified.
      </p>
      {loading ? (
        <p className="mt-6 text-sm text-muted">Checking your authenticator…</p>
      ) : verifiedFactor ? (
        <form onSubmit={verifyCode} className="mt-6 max-w-md border border-line bg-surface p-5">
          <label className="block text-sm font-semibold">
            Six-digit authenticator code
            <input
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]{6,8}"
              maxLength={8}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="mt-1 min-h-12 w-full rounded-sm border border-line px-3 font-mono text-lg tracking-[.2em]"
            />
          </label>
          <button
            type="submit"
            className="button-primary mt-4"
            disabled={busy || code.replace(/\s/g, "").length < 6}
          >
            {busy ? "Verifying…" : "Verify and continue"}
          </button>
        </form>
      ) : (
        <section className="mt-6 max-w-xl border border-line bg-surface p-5">
          <h2 className="text-lg font-bold">Set up an authenticator app</h2>
          <p className="mt-2 text-sm text-muted">
            Use any TOTP authenticator app. Scan the code or enter the secret manually, then verify
            a current six-digit code.
          </p>
          {!secret ? (
            <button
              type="button"
              className="button-primary mt-4"
              onClick={() => void beginSetup()}
              disabled={busy}
            >
              {busy ? "Starting setup…" : "Set up authenticator"}
            </button>
          ) : (
            <>
              {qrCode && (
                // This provider-generated data URL is already an image and must bypass optimization.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCode}
                  width="220"
                  height="220"
                  alt="Authenticator enrollment QR code"
                  onError={() => setQrError(true)}
                  className="mt-4 h-[220px] w-[220px] border border-line bg-white p-2"
                />
              )}
              {qrError && (
                <p role="status" className="mt-2 text-sm text-danger">
                  The QR code could not be displayed. You can still add the account by entering the
                  setup secret below.
                </p>
              )}
              <label className="mt-4 block text-sm font-semibold">
                Setup secret
                <input
                  readOnly
                  value={secret}
                  className="mt-1 block min-h-11 w-full rounded-sm border border-line bg-[#f2f4f0] px-3 font-mono"
                />
              </label>
              <form onSubmit={verifyCode} className="mt-4 flex flex-wrap items-end gap-3">
                <label className="text-sm font-semibold">
                  Current code
                  <input
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9 ]{6,8}"
                    maxLength={8}
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="mt-1 min-h-11 w-full rounded-sm border border-line px-3 font-mono tracking-[.2em]"
                  />
                </label>
                <button
                  type="submit"
                  className="button-primary"
                  disabled={busy || code.replace(/\s/g, "").length < 6}
                >
                  {busy ? "Verifying…" : "Verify setup"}
                </button>
              </form>
            </>
          )}
        </section>
      )}
      {message && (
        <p role="status" className="mt-4 max-w-xl border border-[#d7a5a5] bg-white p-3 text-sm">
          {message}
        </p>
      )}
      {loginSuccessful && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-login-success-title"
            className="w-full max-w-sm rounded-lg border border-line bg-white p-6 text-center shadow-xl"
          >
            <div
              aria-hidden="true"
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf2eb] text-2xl font-bold text-brand-forest"
            >
              ✓
            </div>
            <h2 id="admin-login-success-title" className="mt-4 text-xl font-bold text-ink">
              Login successful
            </h2>
            <p className="mt-2 text-sm text-muted">
              Your authenticator code was verified. You can now continue to the admin dashboard.
            </p>
            <button
              ref={continueButtonRef}
              type="button"
              onClick={() => router.refresh()}
              className="button-primary mt-5 w-full"
            >
              Continue to dashboard
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
