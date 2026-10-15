"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function CardReissueButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function reissueCard() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/cards/regenerate", { method: "POST" });
      const result = (await response.json()) as { error?: string; cardStatus?: string };
      if (!response.ok || result.cardStatus !== "ready") {
        throw new Error(result.error || "Your replacement card is still processing. Try again shortly.");
      }
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Card replacement could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button className="button-secondary" type="button" onClick={reissueCard} disabled={busy}>
        <RefreshCw aria-hidden="true" className={`mr-2 inline h-4 w-4 ${busy ? "animate-spin" : ""}`} />
        {busy ? "Updating card…" : "Regenerate card with latest details"}
      </button>
      {message && <p className="mt-2 text-sm text-red-800" role="alert">{message}</p>}
    </div>
  );
}
