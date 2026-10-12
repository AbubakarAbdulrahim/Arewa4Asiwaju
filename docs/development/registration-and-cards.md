# Registration and membership cards

## Registration sequence

1. `/register` loads the deployment's privacy notice and collects a name, email address, state, LGA, and explicit notice acceptance.
2. `POST /api/register` validates the request and state/LGA pair, checks a honeypot, and applies database-backed rate limits keyed by HMAC hashes. It creates a Supabase Auth identity without sending a signup email. Duplicate-account responses do not reveal whether an address is registered.
3. The server calls the service-role-only `create_open_membership_with_card` transaction. It creates the profile, unique membership number, active membership, consent receipt, member role, opaque QR token, initial card row, generation job, and audit record together. The Auth email is not verified during registration; `email_confirm=true` makes the identity eligible for later OTP sign-in, which still requires access to that inbox.
4. The server claims the durable card-generation job, creates a PDF, uploads it to private `member-id-cards` storage, and returns a ten-minute signed download link. If generation fails, the saved membership remains and the member can retrieve or retry card generation after signing in.

The transaction is idempotent for an Auth user and allocates membership numbers with a database sequence. Registration retries cannot create extra memberships or unintended card versions.

## Card access and status

`GET /api/cards/download` reads the signed-in user, resolves only that user's active membership and card, and redirects to a 60-second signed URL. The bucket has no anonymous or authenticated object policy. `POST /api/cards/regenerate` checks the session and active membership before replacing the current card; the transaction revokes the old card, creates a new version/token, enqueues a job, and audits the change. Replacement is limited to two requests per day.

The QR encodes a URL fragment containing only the random token. Fragments are not sent to the website server; the browser removes the fragment and posts the token to `/api/verify-token`. The public response returns only active/invalid status, a masked membership number, and card dates. Revoked, replaced, expired, suspended-membership, and unknown cards all receive the same invalid response.

## Required deployment configuration

- Apply migrations in order, including `20261012000000_open_registration_without_email_verification.sql` and `20261012000001_fix_membership_number_allocator.sql`.
- Set `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY` separately for preview/staging and production.
- Local staging uses `REGISTRATION_ENABLED=true`, notice version `a4a-staging-v1`, a proposed short notice, and generated rate-limit and cron secrets in ignored `.env.local`. The notice is a draft and not approved for production. The organisation must review and approve its controller identity, lawful basis, notice, and retention schedule.
- Set a separate random `CRON_SECRET` of at least 32 characters. Vercel invokes `/api/cron/cleanup-registration` daily with this bearer secret; it removes expired legacy registration intents after 24 hours, completed legacy intents after 30 days, and stale rate-limit rows after 2 days. It returns counts only.
- Keep the `member-id-cards` bucket private. Do not add public Storage policies. Configure backups and retention before production.
- Portal sign-in/account recovery sends an email OTP; configure and verify a suitable SMTP provider for that separate feature. Registration and immediate card generation do not depend on SMTP delivery.

The staging project has all current versioned migrations applied. The local database security suite passes 87 pgTAP assertions. Production remains unconfigured and disabled.
