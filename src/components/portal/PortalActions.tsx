"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { NORTHERN_STATES } from "@/lib/geo-data";

type Result = { ok?: boolean; message?: string; error?: string };

function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  async function send(url: string, method: string, body: unknown) {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as Result;
      if (!response.ok) setError(result.error ?? "Request could not be completed.");
      else {
        setMessage(result.message ?? "Saved.");
        router.refresh();
      }
    } catch {
      setError("Connection problem. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  return { busy, message, error, send };
}

function Feedback({ message, error }: { message: string; error: string }) {
  return (
    <>
      {message && (
        <p className="text-sm text-green-900" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

export function ProfileForm({
  profile,
}: {
  profile: {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    state: string;
    lga: string;
  };
}) {
  const { busy, message, error, send } = useSubmit();
  const [stateName, setStateName] = useState(profile.state);
  const currentState = NORTHERN_STATES.find((state) => state.name === stateName);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void send("/api/portal/profile", "PATCH", {
      firstName: data.get("firstName"),
      middleName: data.get("middleName"),
      lastName: data.get("lastName"),
      stateOfResidence: data.get("state"),
      lgaOfResidence: data.get("lga"),
    });
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="profile-email">
          Email
        </label>
        <input
          id="profile-email"
          className="field-input bg-[#f3f4ef]"
          value={profile.email}
          readOnly
        />
        <p className="mt-1 text-xs text-muted">
          For account security, update your email through member support.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="firstName">
            First name
          </label>
          <input
            className="field-input"
            id="firstName"
            name="firstName"
            required
            minLength={2}
            maxLength={100}
            defaultValue={profile.firstName}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="middleName">
            Middle name <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            className="field-input"
            id="middleName"
            name="middleName"
            maxLength={100}
            defaultValue={profile.middleName}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="lastName">
            Last name
          </label>
          <input
            className="field-input"
            id="lastName"
            name="lastName"
            required
            minLength={2}
            maxLength={100}
            defaultValue={profile.lastName}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="state">
            State of residence
          </label>
          <select
            className="field-input"
            id="state"
            name="state"
            required
            value={stateName}
            onChange={(event) => setStateName(event.target.value)}
          >
            <option value="">Select a state</option>
            {NORTHERN_STATES.map((state) => (
              <option key={state.code} value={state.name}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="lga">
            LGA of residence
          </label>
          <select
            className="field-input"
            id="lga"
            name="lga"
            required
            defaultValue={currentState?.lgas.includes(profile.lga) ? profile.lga : ""}
            key={stateName}
          >
            <option value="">Select an LGA</option>
            {currentState?.lgas.map((lga) => (
              <option key={lga} value={lga}>
                {lga}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button className="button-primary" disabled={busy}>
        {busy ? "Saving…" : "Save profile"}
      </button>
      <Feedback message={message} error={error} />
    </form>
  );
}

export function EventRegistrationAction({
  eventId,
  registered,
}: {
  eventId: string;
  registered: boolean;
}) {
  const { busy, message, error, send } = useSubmit();
  return (
    <div className="mt-4 space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void send("/api/portal/events", registered ? "DELETE" : "POST", { eventId })}
        className={registered ? "button-quiet" : "button-primary"}
      >
        {busy ? "Saving…" : registered ? "Cancel registration" : "Register for event"}
      </button>
      <Feedback message={message} error={error} />
    </div>
  );
}

export function SupportRequestForm() {
  const { busy, message, error, send } = useSubmit();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void send("/api/portal/support", "POST", {
      subject: data.get("subject"),
      category: data.get("category"),
      message: data.get("message"),
    });
    event.currentTarget.reset();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="subject">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          required
          minLength={3}
          maxLength={160}
          className="field-input"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="category">
          Request category
        </label>
        <select id="category" name="category" className="field-input">
          <option value="general">General</option>
          <option value="membership">Membership</option>
          <option value="id_card">ID card</option>
          <option value="events">Events</option>
          <option value="privacy">Privacy</option>
          <option value="technical">Technical</option>
        </select>
      </div>
      <div>
        <label className="field-label" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          className="field-input"
        />
      </div>
      <button className="button-primary" disabled={busy}>
        {busy ? "Sending…" : "Send support request"}
      </button>
      <Feedback message={message} error={error} />
    </form>
  );
}

export function PrivacyRequestForm() {
  const { busy, message, error, send } = useSubmit();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void send("/api/portal/privacy", "POST", {
      requestType: data.get("requestType"),
      details: data.get("details"),
    });
    event.currentTarget.reset();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="requestType">
          Request type
        </label>
        <select id="requestType" name="requestType" className="field-input">
          <option value="access">Access my data</option>
          <option value="rectification">Correct my data</option>
          <option value="restriction">Restrict processing</option>
          <option value="erasure">Request erasure</option>
        </select>
      </div>
      <div>
        <label className="field-label" htmlFor="details">
          Details <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea id="details" name="details" maxLength={1000} rows={4} className="field-input" />
      </div>
      <button className="button-primary" disabled={busy}>
        {busy ? "Submitting…" : "Submit privacy request"}
      </button>
      <Feedback message={message} error={error} />
    </form>
  );
}

export function PreferencesForm({
  initial,
}: {
  initial: {
    email_announcements: boolean;
    email_event_reminders: boolean;
    sms_announcements: boolean;
    sms_event_reminders: boolean;
  } | null;
}) {
  const { busy, message, error, send } = useSubmit();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void send("/api/portal/preferences", "PUT", {
      emailAnnouncements: data.has("emailAnnouncements"),
      emailEventReminders: data.has("emailEventReminders"),
      smsAnnouncements: data.has("smsAnnouncements"),
      smsEventReminders: data.has("smsEventReminders"),
    });
  }
  const fields = [
    ["emailAnnouncements", "Email announcements", initial?.email_announcements],
    ["emailEventReminders", "Email event reminders", initial?.email_event_reminders],
    ["smsAnnouncements", "SMS announcements", initial?.sms_announcements],
    ["smsEventReminders", "SMS event reminders", initial?.sms_event_reminders],
  ] as const;
  return (
    <form onSubmit={submit} className="space-y-4">
      {fields.map(([name, label, checked]) => (
        <label key={name} className="flex min-h-12 items-center gap-3 border-b border-line py-2">
          <input
            type="checkbox"
            name={name}
            defaultChecked={checked ?? false}
            className="h-5 w-5 accent-[#075b3c]"
          />
          <span className="text-sm font-medium">{label}</span>
        </label>
      ))}
      <p className="text-sm text-muted">
        No SMS or email messages are sent until a delivery provider is configured. Your choices are
        stored for future communications.
      </p>
      <button className="button-primary" disabled={busy}>
        {busy ? "Saving…" : "Save preferences"}
      </button>
      <Feedback message={message} error={error} />
    </form>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function signOut() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/auth/login");
      router.refresh();
    }
  }
  return (
    <button type="button" onClick={() => void signOut()} disabled={busy} className="button-quiet">
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
