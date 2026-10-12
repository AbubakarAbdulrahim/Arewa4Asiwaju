# Phase 9 hardening review

Review date: 2026-10-11

## Scope and environment

The Phase 9 migrations were applied to the local Supabase database only. The linked staging database was not changed. The local environment runs PostgreSQL while other Supabase services, including Auth and Storage, are excluded; provider-backed workflows therefore were not available for end-to-end verification.

## Checks run

| Check                                   | Result                                                                                                                           |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Unit suite (`npm test`)                 | Pass: 11 tests                                                                                                                   |
| Database/RLS suite (`supabase test db`) | Pass: 81 pgTAP assertions                                                                                                        |
| TypeScript (`npm run typecheck`)        | Pass                                                                                                                             |
| ESLint (`npm run lint`)                 | Pass                                                                                                                             |
| Prettier (`npm run format:check`)       | Pass                                                                                                                             |
| Production build                        | Pass with the current Supabase public URL/anon key configuration and registration disabled                                       |
| Playwright                              | Pass: 3 tests (private portal gate, sign-in/recovery UI, 360px mobile navigation with image requests blocked); clean exit code 0 |
| Runtime dependency audit                | Pass: 0 vulnerabilities (`npm audit --omit=dev`)                                                                                 |
| Full dependency audit                   | Outstanding: 5 high findings through `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`   |

The braces advisory identifies versions through 3.0.3 as affected and lists no patched release. `npm audit fix --dry-run` offered only a forced downgrade of `eslint-config-next` to 14.2.35, which would break the required Next 16 toolchain. Do not treat this development-only finding as resolved; reassess when upstream provides a safe fix. [GitHub advisory GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)

## Security changes and findings

- Restricted aggregate event counts to each coordinator's assigned organisational scope. Privacy-request and notification-queue totals are returned only to roles allowed to see those operational queues.
- Added database tests for scoped event totals, denied global privacy/outbox metrics, per-member notification ownership, and notification content immutability. The authenticated member can update only `read_at`.
- Added an event-registration notification to the member inbox.
- Added a private `member-id-cards` PDF-only bucket definition and migration; the bucket row is provisioned in local PostgreSQL. Browser object access remains denied; application downloads use short-lived signed URLs.
- Existing RLS tests cover cross-member membership/card access, service-only membership creation, membership-number uniqueness, AAL2 access, private card-bucket configuration, and self-role escalation denial. All 81 assertions passed locally.
- Administrative/API source review and database tests do not prove every policy against a populated staging database. Storage upload/download ownership and full authenticated browser flows remain unverified because local Auth/Storage services were not running.
- No backup restore was performed. A local migration reset is not evidence that the staging/production backup can be restored.

## Query plans and performance

The local planner uses `memberships_state_status_created_idx` for a state/status/date membership query, `in_app_notifications_profile_created_idx` for a member inbox query, and `notification_outbox_claim_idx` for queue claiming. A Phase 9 migration adds the member-search state/status/date index and trigram indexes for substring searches over membership number and phone.

The local database contains only a small test dataset. The planner chooses sequential scans for substring searches at that size, so the trigram plans and large-table behaviour still need verification with realistic data and `ANALYZE`. No load test was run for registration, login, card generation, or member search.

No field Core Web Vitals report is available: there is no deployed RUM dataset or sufficient real-user traffic in this workspace. The 360px browser check verified no horizontal overflow, keyboard dismissal, and continued homepage content with image requests blocked. This is a narrow check, not a WCAG 2.2 AA audit. No automated axe scan or screen-reader review was performed.

## Operational readiness and remaining work

- The public Supabase URL and anon key are now present in `.env.local`, and the configured build passes. Registration is still disabled; the app URL is still localhost, while the service-role key, approved consent notice/version, rate-limit secret, and cron secret are missing. Secret values are intentionally not included here.
- The first production super administrator must be assigned through a trusted project-owner operation; public self-service role bootstrap is intentionally absent.
- Email/SMS provider accounts and credentials are not configured, so external notification delivery, provider webhooks, and provider retries were not exercised.
- `vercel.json` schedules notification work every 15 minutes. That schedule requires Vercel Pro or Enterprise; Hobby permits only daily cron schedules.
- Staging migrations, staging RLS, Storage permissions, backup restoration, realistic load, field Web Vitals, and a full accessibility review remain outstanding.

## Readiness decision

**Phase 9 is not signed off for production.** Local unit, database, lint, type, formatting, and build checks are useful evidence, but the missing anon key, unresolved high development dependency advisory, non-clean Playwright runner exit, and unverified staging, storage, backup, load, accessibility, and field-performance checks prevent the acceptance criteria from being met.
