# Phase 8 operations

## Notifications

`notification_outbox` is the durable delivery queue. `/api/cron/process-notifications` is protected by `CRON_SECRET`, claims up to 25 records with `FOR UPDATE SKIP LOCKED`, and records provider-confirmed success or retry/failure state. Vercel schedules it every 15 minutes, which requires a Pro or Enterprise plan; Hobby only permits daily schedules. Email and SMS are intentionally disabled until a provider webhook URL and secret are configured. Event registration creates an in-platform notification, stored in the private `in_app_notifications` table and visible only to the target member. Members can mark notifications read but cannot edit their content.

The worker sends an idempotency key equal to the outbox ID. Providers must treat it as an idempotency key and return a provider message ID only after accepting the message. No delivery is reported before that confirmation.

## Reports and privacy operations

`/admin/reports` exposes only aggregate counts. The database procedure applies the administrator’s AAL2 role and organisational scope before calculating membership counts. `/admin/privacy` is restricted to super administrators and data-protection officers and records every status change in `audit_logs`.

## Retention

The notification worker removes only sent or permanently failed outbox records older than the configured 90-day operational window. Registration-intent cleanup remains in the existing daily cleanup job. Member erasure is tracked as a privacy request and must follow the organisation’s approved identity, legal-hold, backup, and retention procedure before a request is marked completed.

`20261011000000_operations_reporting.sql` and the Phase 9 search-index migration are applied and tested against the local Supabase database. The linked staging project has not been changed or verified; apply the version-controlled migrations there only after its deployment review.
