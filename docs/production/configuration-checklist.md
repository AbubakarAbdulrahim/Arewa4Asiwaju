# Production configuration checklist

**Status: not deployed.** Complete each item against the organisation's production accounts. Never send secrets through chat or commit them.

## Hosting and domain

- [ ] Create the production Vercel project from the reviewed GitHub repository and protect production deployments.
- [ ] Configure a production domain, DNS records and TLS; set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS origin.
- [ ] Use separate Vercel Preview and Production environment values and separate Supabase projects. The currently linked Supabase project is staging.
- [ ] Set deployment health checks and retain a known-good deployment for rollback.
- [ ] Configure Cloudflare DNS/proxy and review WAF/rate-limit rules with the hosting configuration. Do not cache `/auth/*`, `/api/*`, `/member/*`, `/admin/*`, `/verify/*`, or any response containing private member data. Cache only public content and static assets with deliberate TTLs.
- [ ] Keep registration disabled until privacy, database and operational checks below are complete.

## Production Supabase

- [ ] Create/select a dedicated production Supabase project and verify its project reference before any migration command.
- [ ] Review migrations in version control; take a pre-migration backup; run `supabase link --project-ref <PRODUCTION_PROJECT_REF>` and `supabase db push --dry-run` before the reviewed apply. Never use the staging ref for a production release.
- [ ] Configure production Vercel secrets: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `REGISTRATION_RATE_LIMIT_SECRET`, `CRON_SECRET`, and approved registration notice/version values. Keep the service-role key server-only.
- [ ] Verify the private `member-id-cards` bucket, allowed PDF type, size limit, and storage policies after migrations.
- [ ] Configure Supabase Auth Site URL to the canonical origin and allow only required callback and recovery URLs, including `/auth/callback`.
- [ ] Configure a production SMTP provider, sender domain, SPF, DKIM, DMARC, and delivery monitoring for member sign-in/account recovery. Signup and ID-card issuance do not send email.
- [ ] Confirm MFA is required for privileged accounts.

## Privacy and launch gates

- [ ] Approve the privacy notice, terms, lawful basis, purposes, retention schedule, data-subject request process and incident-response contact with Nigeria-specific counsel/data-protection leadership.
- [ ] Set `REGISTRATION_CONSENT_VERSION` and `REGISTRATION_CONSENT_NOTICE` only to the approved notice. Record the approval/version in operational records.
- [ ] Confirm support contact details and public organisational facts are authorised and current.
- [ ] Keep registration disabled until the controlled test accounts pass immediate registration, card issuance, QR verification, and access-control checks.

## Jobs, monitoring and recovery

- [ ] The notification worker is scheduled every 15 minutes. Vercel Hobby supports daily schedules only; this cadence needs a Vercel Pro/Enterprise plan or a separately selected durable scheduler. Verify provider delivery acknowledgements and retries before enabling notifications.
- [ ] Configure error reporting and alerts for failed registration/card jobs, scheduled-job failures, elevated HTTP errors, authentication failures and database/storage availability.
- [ ] Confirm Supabase backup plan, retention and recovery-point expectations. Database backups do not include Storage objects; document separate object recovery or card regeneration.
- [ ] Perform a restore rehearsal in a separate project before launch and record the result.

## Current environment audit

- The linked staging project `Arewa4Asiwaju-Staging` has current migrations through `20261012000001_fix_membership_number_allocator.sql`. The local `.env.local` uses staging, localhost as the app URL, registration enabled for staging, a proposed notice (`a4a-staging-v1`), and generated rate-limit/cron secrets. The local database security suite passes 87 pgTAP assertions. The staging registration and downloadable PDF flow passed with a synthetic test account that was removed afterward. SMTP delivery for member sign-in is not verified. No production domain, Vercel project credentials, Cloudflare zone configuration, monitoring destination or verified restore rehearsal has been supplied/configured in this workspace.
- `.env.example` contains names and blank values only. `.env.local` must remain untracked and must never be copied into deployment logs or support messages.
