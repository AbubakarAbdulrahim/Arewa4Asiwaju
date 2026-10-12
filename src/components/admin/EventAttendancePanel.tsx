"use client";
import { useState } from "react";

type Registration = {
  registration_id: string;
  membership_number: string;
  member_name: string;
  registered_at: string;
  attended: boolean;
  attended_at: string | null;
};

export function EventAttendancePanel() {
  const [eventId, setEventId] = useState("");
  const [rows, setRows] = useState<Registration[]>([]);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  async function loadPage(nextPage: number) {
    setMessage("");
    try {
      const response = await fetch(
        `/api/admin/events/attendance?eventId=${encodeURIComponent(eventId)}&page=${nextPage}`,
        { cache: "no-store" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRows(data.registrations);
      setTotal(data.total);
      setPage(nextPage);
      if (!data.registrations.length) setMessage("No event registrations were found.");
    } catch (error) {
      setRows([]);
      setTotal(0);
      setMessage(error instanceof Error ? error.message : "Attendance list unavailable.");
    }
  }

  async function load(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadPage(1);
  }

  async function mark(row: Registration) {
    setBusyId(row.registration_id);
    setMessage("");
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "attendance.update",
          id: row.registration_id,
          attended: !row.attended,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRows((current) =>
        current.map((entry) =>
          entry.registration_id === row.registration_id
            ? {
                ...entry,
                attended: !row.attended,
                attended_at: !row.attended ? new Date().toISOString() : null,
              }
            : entry,
        ),
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Attendance status could not be changed.",
      );
    } finally {
      setBusyId("");
    }
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <section className="mt-7 border-t border-line pt-6">
      <h3 className="text-lg font-bold">Event attendance</h3>
      <p className="mt-1 text-sm text-muted">
        Enter an event UUID to load its registrations. Names and numbers are returned only within
        your authorised event scope.
      </p>
      <form onSubmit={load} className="mt-3 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="attendance-event-id">
          Event UUID
        </label>
        <input
          id="attendance-event-id"
          required
          value={eventId}
          onChange={(event) => setEventId(event.target.value)}
          className="min-h-11 min-w-[18rem] rounded-sm border border-line bg-white px-3"
          placeholder="Event UUID"
        />
        <button className="button-secondary" type="submit">
          Load attendance
        </button>
      </form>
      {message && (
        <p className="mt-3 text-sm text-muted" role="status">
          {message}
        </p>
      )}
      {rows.length > 0 && (
        <>
          <div className="mt-4 overflow-x-auto border border-line bg-surface">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-[#f2f4f0]">
                <tr>
                  <th className="px-3 py-3">Member</th>
                  <th className="px-3 py-3">Membership number</th>
                  <th className="px-3 py-3">Registered</th>
                  <th className="px-3 py-3">Attendance</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.registration_id} className="border-t border-line">
                    <td className="px-3 py-3">{row.member_name}</td>
                    <td className="px-3 py-3 font-mono">{row.membership_number}</td>
                    <td className="px-3 py-3">
                      {new Date(row.registered_at).toLocaleString("en-NG")}
                    </td>
                    <td className="px-3 py-3">
                      {row.attended
                        ? `Present · ${row.attended_at ? new Date(row.attended_at).toLocaleString("en-NG") : "recorded"}`
                        : "Not marked"}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        className="button-quiet"
                        type="button"
                        disabled={busyId === row.registration_id}
                        onClick={() => void mark(row)}
                      >
                        {busyId === row.registration_id
                          ? "Saving…"
                          : row.attended
                            ? "Undo"
                            : "Mark present"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <p>
              {total.toLocaleString()} registrations · page {page} of {pages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="button-secondary"
                disabled={page <= 1}
                onClick={() => void loadPage(page - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                className="button-secondary"
                disabled={page >= pages}
                onClick={() => void loadPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
