import "server-only";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

type OutboxRow = {
  id: string;
  channel: "email" | "sms" | "in_app";
  recipient: string;
  subject: string | null;
  body: string;
  attempts: number;
};

async function deliver(row: OutboxRow) {
  if (row.channel === "in_app") {
    const admin = createAdminClient();
    const { error } = await admin.from("in_app_notifications").insert({
      profile_id: row.recipient,
      title: row.subject ?? "Arewa for Asiwaju update",
      body: row.body,
    });
    if (error) throw new Error("in_app_delivery_failed");
    return "in_app";
  }
  const endpoint =
    row.channel === "email" ? env.NOTIFICATION_EMAIL_WEBHOOK_URL : env.NOTIFICATION_SMS_WEBHOOK_URL;
  if (!endpoint) throw new Error(`${row.channel}_provider_not_configured`);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(env.NOTIFICATION_PROVIDER_SECRET
        ? { authorization: `Bearer ${env.NOTIFICATION_PROVIDER_SECRET}` }
        : {}),
    },
    body: JSON.stringify({
      channel: row.channel,
      recipient: row.recipient,
      subject: row.subject,
      body: row.body,
      idempotency_key: row.id,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`${row.channel}_provider_${response.status}`);
  const payload = (await response.json().catch(() => ({}))) as { id?: string; message_id?: string };
  return payload.id ?? payload.message_id ?? null;
}

export async function processNotificationBatch(limit = 25) {
  const admin = createAdminClient();
  const { data: rows, error } = await admin.rpc("claim_notification_outbox", { p_limit: limit });
  if (error) throw new Error("notification_claim_failed");
  const results = { claimed: rows?.length ?? 0, sent: 0, failed: 0, statusUpdateFailures: 0 };
  for (const row of (rows ?? []) as OutboxRow[]) {
    try {
      const providerId = await deliver(row);
      const { error: completeError } = await admin.rpc("complete_notification_delivery", {
        p_id: row.id,
        p_success: true,
        p_provider_message_id: providerId,
        p_error: null,
      });
      if (completeError) results.statusUpdateFailures += 1;
      else results.sent += 1;
    } catch (error) {
      const { error: completeError } = await admin.rpc("complete_notification_delivery", {
        p_id: row.id,
        p_success: false,
        p_provider_message_id: null,
        p_error: error instanceof Error ? error.message : "delivery_failed",
      });
      if (completeError) results.statusUpdateFailures += 1;
      else results.failed += 1;
    }
  }
  return results;
}

export async function processNotificationRetention(days = 90) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("process_notification_retention", { p_before: cutoff });
  if (error) throw new Error("notification_retention_failed");
  return Number(data ?? 0);
}
