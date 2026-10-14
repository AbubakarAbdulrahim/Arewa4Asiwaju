"use client";
import { useState } from "react";

export type AdminField = {
  name: string;
  label: string;
  type?: "text" | "number" | "datetime-local" | "url" | "textarea" | "select" | "checkbox";
  required?: boolean;
  options?: (string | { value: string; label: string })[];
  placeholder?: string;
  helpText?: string;
};

export function AdminActionForm({
  title,
  action,
  fields,
  records = [],
}: {
  title: string;
  action: string;
  fields: AdminField[];
  records?: Record<string, unknown>[];
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload: Record<string, unknown> = { action };
    for (const field of fields) {
      const raw = form.get(field.name);
      if (field.type === "checkbox") payload[field.name] = raw === "on";
      else if (field.type === "number") payload[field.name] = raw ? Number(raw) : null;
      else if (field.type === "datetime-local")
        payload[field.name] = raw ? new Date(String(raw)).toISOString() : "";
      else payload[field.name] = raw ? String(raw) : null;
    }
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save the change.");
      formElement.reset();
      setMessage("Saved. The change was recorded in the audit log.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the change.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="border border-line bg-surface p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label
            key={field.name}
            className={`block text-sm font-semibold ${field.type === "textarea" ? "sm:col-span-2" : ""}`}
          >
            {field.type === "checkbox" ? (
              <span className="flex min-h-11 items-center gap-3">
                <input name={field.name} type="checkbox" className="size-4 accent-[#0b4619]" />
                {field.label}
              </span>
            ) : (
              <>
                <span>{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    required={field.required}
                    rows={4}
                    placeholder={field.placeholder}
                    className="mt-1 block w-full rounded-sm border border-line bg-white p-3 font-normal"
                  />
                ) : field.type === "select" ? (
                  <select
                    name={field.name}
                    required={field.required}
                    onChange={
                      field.name === "id" && records.length
                        ? (event) =>
                            populateFromRecord(
                              event.currentTarget.form,
                              event.currentTarget.value,
                              records,
                              fields,
                            )
                        : undefined
                    }
                    className="mt-1 block min-h-11 w-full rounded-sm border border-line bg-white px-3 font-normal"
                  >
                    <option value="">Choose…</option>
                    {field.options?.map((option) => {
                      const value = typeof option === "string" ? option : option.value;
                      const label =
                        typeof option === "string" ? option.replaceAll("_", " ") : option.label;
                      return (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    name={field.name}
                    type={field.type ?? "text"}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="mt-1 block min-h-11 w-full rounded-sm border border-line bg-white px-3 font-normal"
                  />
                )}
                {field.helpText && (
                  <span className="mt-1 block text-xs font-normal leading-5 text-muted">
                    {field.helpText}
                  </span>
                )}
              </>
            )}
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button disabled={busy} className="button-primary" type="submit">
          {busy ? "Saving…" : "Save changes"}
        </button>
        {message && (
          <p role="status" className="text-sm text-muted">
            {message}
          </p>
        )}
      </div>
    </form>
  );
}

function populateFromRecord(
  form: HTMLFormElement | null,
  selectedId: string,
  records: Record<string, unknown>[],
  fields: AdminField[],
) {
  if (!form) return;
  const record = records.find((item) => String(item.id ?? "") === selectedId);
  for (const field of fields) {
    if (field.name === "id") continue;
    const control = form.elements.namedItem(field.name);
    if (
      !control ||
      !(
        control instanceof HTMLInputElement ||
        control instanceof HTMLSelectElement ||
        control instanceof HTMLTextAreaElement
      )
    )
      continue;
    const snakeName = field.name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    const value = record?.[field.name] ?? record?.[snakeName] ?? "";
    if (field.type === "checkbox" && control instanceof HTMLInputElement) {
      control.checked = value === true;
    } else if (control instanceof HTMLInputElement && field.type === "datetime-local") {
      const date = typeof value === "string" ? new Date(value) : null;
      const localDate =
        date && Number.isFinite(date.getTime())
          ? new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
          : "";
      control.value = localDate;
    } else {
      control.value = value === null || value === undefined ? "" : String(value);
    }
  }
}

export function AdminDataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Record<string, unknown>[];
}) {
  if (!rows.length)
    return (
      <p className="border border-line bg-surface p-5 text-sm text-muted">
        No records are available for this view.
      </p>
    );
  return (
    <div className="overflow-x-auto border border-line bg-surface">
      <table className="w-full min-w-[700px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-[#f2f4f0]">
            {columns.map((column) => (
              <th key={column} scope="col" className="px-3 py-3 font-bold">
                {humanize(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)} className="border-b border-line last:border-0">
              {columns.map((column) => (
                <td key={column} className="max-w-sm px-3 py-3 align-top">
                  {formatCell(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${humanize(key)}: ${formatCell(item)}`)
      .join(" · ");
  }
  const text = String(value);
  if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(text)) return "Linked record";
  if (/^https:\/\//i.test(text)) return "Online file";
  if (/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(text)) {
    const date = new Date(text);
    if (Number.isFinite(date.getTime())) {
      return text.includes("T") ? date.toLocaleString("en-NG") : date.toLocaleDateString("en-NG");
    }
  }
  return text.replaceAll("_", " ");
}

function humanize(value: string) {
  const known: Record<string, string> = {
    is_published: "Published",
    is_virtual: "Online event",
    state_code: "State",
    lga_name: "Local government",
    org_unit_name: "Organisational area",
    created_at: "Created",
    updated_at: "Last updated",
    published_at: "Published on",
    start_date: "Starts",
    end_date: "Ends",
    asset_type: "File type",
    target_type: "Item type",
    details: "Summary",
    actor_id: "Administrator",
    target_id: "Record",
    org_unit_id: "Organisational area",
    parent_id: "Parent area",
    profile_id: "Member",
    user_id: "Account",
    id: "Record",
  };
  return (
    known[value] ?? value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}
