# Member portal

## Routes

- `/auth/login` sends a passwordless Supabase email link for an existing account. Re-requesting that link is the account-recovery path. Supabase Auth must have email delivery configured and `${NEXT_PUBLIC_APP_URL}/auth/callback` allow-listed.
- `/portal` is a session-protected summary of membership, upcoming published events, open support count, and member actions.
- `/portal/profile`, `/portal/id-card`, `/portal/events`, `/portal/announcements`, `/portal/preferences`, `/portal/support`, and `/portal/privacy` provide member self-service.
- `/api/cards/preview` and `/api/cards/download` resolve membership from the authenticated session. They never accept a member or card identifier from the browser.

## Access controls

Portal reads use the signed-in Supabase client so PostgreSQL RLS applies. Profile changes go through a database transaction that accepts only name and residence fields; direct profile updates are revoked for browser roles. The database derives the display name, writes an audit event with changed field names only, and queues a versioned card replacement when card content changes. That transaction limits profile-triggered replacements to two per day.

Event registration, cancellation, support submission, and privacy requests use `SECURITY DEFINER` functions that derive `auth.uid()`, require an active membership, and apply server-side constraints. Event capacity is serialized by locking the event row. Support submissions are limited to five per member per day. A matching open privacy request cannot be duplicated. Preference rows are protected by owner RLS and default all optional channels to off.

## Communications

Announcements are read from published content. Preference values are stored, but no announcement or reminder delivery provider is configured by this phase. Account recovery uses Supabase passwordless email links; the public response does not disclose whether an email has an account.

## Migration and staging verification

Apply `20261010000003_member_portal.sql` after the earlier migrations. Run the full database security suite and verify RLS with two distinct member accounts before enabling the portal for production. Test email link expiry/reuse, sign-out, profile updates, capacity contention, support rate limits, privacy requests, and card access after a fresh sign-in. These database and email integration checks require the staging Supabase setup and were not run in this workspace.

Run `npm run build` before `npm run test:e2e`; the browser tests launch the built app. Windows uses installed Microsoft Edge. CI installs Chromium before running the same tests. The current browser suite verifies the sign-in and recovery entry point and confirms that an unauthenticated portal visit reveals no member data; authenticated portal journeys are pending staged test accounts and database setup.
