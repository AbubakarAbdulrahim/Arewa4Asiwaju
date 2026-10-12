"use client";

import { useState } from "react";

export type MemberNotification = {
  id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export function MemberNotifications({ initial }: { initial: MemberNotification[] }) {
  const [rows, setRows] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function markRead(id: string) {
    setBusyId(id);
    setMessage("");
    try {
      const response = await fetch("/api/portal/notifications", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Could not update notification.");
      setRows((current) =>
        current.map((row) => (row.id === id ? { ...row, read_at: new Date().toISOString() } : row)),
      );
    } catch {
      setMessage("That notification could not be updated. Please retry.");
    } finally {
      setBusyId(null);
    }
  }

  if (!rows.length)
    return (
      <p className="mt-5 border border-line p-5 text-sm text-muted">
        You have no in-app notifications.
      </p>
    );

  return (
    <>
      {message && (
        <p className="notice mt-4" role="alert">
          {message}
        </p>
      )}
      <ul className="mt-5 divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-start justify-between gap-4 py-5">
            <div>
              <h3 className="font-bold">{row.title}</h3>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{row.body}</p>
              <time className="mt-2 block text-xs text-muted" dateTime={row.created_at}>
                {new Date(row.created_at).toLocaleString("en-NG", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
            </div>
            {row.read_at ? (
              <span className="text-xs font-semibold text-muted">Read</span>
            ) : (
              <button
                type="button"
                className="button-quiet"
                disabled={busyId === row.id}
                onClick={() => void markRead(row.id)}
              >
                {busyId === row.id ? "Saving…" : "Mark as read"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
