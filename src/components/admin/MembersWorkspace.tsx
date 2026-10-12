"use client";
import { useEffect, useState } from "react";
import type { MembershipStatus } from "@/types/database";

type MemberRow = {
  id: string;
  membership_number: string;
  status: MembershipStatus;
  state_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  org_unit_name: string | null;
  created_at: string;
};
const statuses: MembershipStatus[] = [
  "pending_verification",
  "active",
  "suspended",
  "flagged",
  "revoked",
];

export function MembersWorkspace({
  canChangeStatus,
  canExport,
  initialStatus = "",
}: {
  canChangeStatus: boolean;
  canExport: boolean;
  initialStatus?: string;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [state, setState] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [exportPurpose, setExportPurpose] = useState("");
  const [loading, setLoading] = useState(true);
  async function load(nextPage = page) {
    setLoading(true);
    setMessage("");
    const params = new URLSearchParams({ page: String(nextPage), pageSize: String(pageSize) });
    if (query.trim()) params.set("q", query.trim());
    if (status) params.set("status", status);
    if (state.trim()) params.set("state", state.trim());
    try {
      const response = await fetch(`/api/admin/members?${params}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRows(data.members);
      setTotal(Number(data.total));
      setPage(nextPage);
    } catch (error) {
      setRows([]);
      setTotal(0);
      setMessage(error instanceof Error ? error.message : "Member list unavailable.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: "1", pageSize: "25" });
    if (initialStatus) params.set("status", initialStatus);
    void fetch(`/api/admin/members?${params}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Member list unavailable.");
        setRows(data.members);
        setTotal(Number(data.total));
        setMessage("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setRows([]);
        setTotal(0);
        setMessage(error instanceof Error ? error.message : "Member list unavailable.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [initialStatus]);
  async function setMemberStatus(id: string, nextStatus: MembershipStatus) {
    setMessage("");
    try {
      const response = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId: id, status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Status was not changed.");
    }
  }
  async function exportMembers() {
    setMessage("");
    try {
      const response = await fetch("/api/admin/members/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: exportPurpose,
          status: status || null,
          stateCode: state || null,
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Export was not created.");
      }
      const file = await response.blob();
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "a4a-members-export.csv";
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("Export created and recorded in the audit log.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Export was not created.");
    }
  }
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void load(1);
        }}
        className="mb-5 grid gap-3 border border-line bg-surface p-4 md:grid-cols-[1fr_12rem_8rem_auto]"
      >
        <label className="text-sm font-semibold">
          Search name or membership number
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-sm border border-line px-3 font-normal"
            maxLength={120}
          />
        </label>
        <label className="text-sm font-semibold">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-sm border border-line bg-white px-3 font-normal"
          >
            <option value="">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          State code
          <input
            value={state}
            onChange={(event) => setState(event.target.value.toUpperCase())}
            maxLength={10}
            className="mt-1 min-h-11 w-full rounded-sm border border-line px-3 font-normal"
          />
        </label>
        <button type="submit" className="button-primary self-end">
          Search
        </button>
      </form>
      {canExport && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void exportMembers();
          }}
          className="mb-5 flex flex-wrap items-end gap-3 border border-line bg-surface p-4"
        >
          <label className="min-w-[15rem] flex-1 text-sm font-semibold">
            Purpose for this export
            <input
              value={exportPurpose}
              onChange={(event) => setExportPurpose(event.target.value)}
              maxLength={500}
              minLength={12}
              required
              className="mt-1 min-h-11 w-full rounded-sm border border-line px-3 font-normal"
            />
          </label>
          <button type="submit" className="button-secondary">
            Download CSV (up to 5,000 rows)
          </button>
        </form>
      )}
      {message && (
        <p role="status" className="mb-4 border border-[#d7a5a5] bg-white p-3 text-sm">
          {message}
        </p>
      )}
      {loading ? (
        <p className="border border-line bg-surface p-5 text-sm text-muted">
          Loading member records…
        </p>
      ) : rows.length === 0 ? (
        <p className="border border-line bg-surface p-5 text-sm text-muted">
          No member records match these filters.
        </p>
      ) : (
        <div className="overflow-x-auto border border-line bg-surface">
          <table className="w-full min-w-[850px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-[#f2f4f0]">
                <th className="px-3 py-3">Member</th>
                <th className="px-3 py-3">Membership number</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Joined</th>
                <th className="px-3 py-3">Status</th>
                {canChangeStatus && <th className="px-3 py-3">Update</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((member) => (
                <tr key={member.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-3">
                    <strong>{member.full_name}</strong>
                    {member.email && <span className="block text-muted">{member.email}</span>}
                    {member.phone && <span className="block text-muted">{member.phone}</span>}
                  </td>
                  <td className="px-3 py-3 font-mono">{member.membership_number}</td>
                  <td className="px-3 py-3">{member.org_unit_name ?? member.state_code}</td>
                  <td className="px-3 py-3">
                    {new Date(member.created_at).toLocaleDateString("en-NG")}
                  </td>
                  <td className="px-3 py-3 capitalize">{member.status.replaceAll("_", " ")}</td>
                  {canChangeStatus && (
                    <td className="px-3 py-3">
                      <select
                        aria-label={`New status for ${member.membership_number}`}
                        defaultValue={member.status}
                        onChange={(event) =>
                          void setMemberStatus(member.id, event.target.value as MembershipStatus)
                        }
                        className="min-h-10 rounded-sm border border-line bg-white px-2"
                      >
                        {statuses.map((item) => (
                          <option key={item} value={item}>
                            {item.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between gap-4 text-sm">
        <p>
          {total.toLocaleString()} records · page {page} of {pageCount}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => void load(page - 1)}
            className="button-secondary"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= pageCount || loading}
            onClick={() => void load(page + 1)}
            className="button-secondary"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
