"use client";
import { useState } from "react";

export type AdminField = {
  name: string;
  label: string;
  type?: "text" | "number" | "datetime-local" | "url" | "textarea" | "select" | "checkbox";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
};

export function AdminActionForm({
  title,
  action,
  fields,
}: {
  title: string;
  action: string;
  fields: AdminField[];
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
                    className="mt-1 block min-h-11 w-full rounded-sm border border-line bg-white px-3 font-normal"
                  >
                    <option value="">Choose…</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option.replaceAll("_", " ")}
                      </option>
                    ))}
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
              <th key={column} scope="col" className="px-3 py-3 font-bold capitalize">
                {column.replaceAll("_", " ")}
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
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
