# Controlled launch and rollback plan

## Release gates

1. Production domain/TLS, separate Supabase project, reviewed migrations, Auth redirects, SMTP, secrets, private storage and monitoring are verified.
2. Privacy notice, lawful basis, consent wording/version, retention and support contacts are approved.
3. Backups are enabled and a restore rehearsal has passed in an isolated project.
4. A named administrator is created with MFA; least-privilege staff roles are checked.
5. Registration stays disabled until the test run is complete.

## Controlled smoke test

Use designated test identities and clearly marked internal test records. Check: open registration creates one membership without sending email; duplicate retry does not create another; card PDF is generated in private storage; QR verification returns only minimum validity information; signed-in owner can download; another account cannot; revoked card fails verification; member sign-in/recovery email works; admin scope and audit logs behave as expected. Remove test accounts/data under the approved retention process before public launch.

Only after all checks pass should the release owner enable registration and record the timestamp, version, operator and approval.

## Rollback

- For an application defect, revert to the last known-good Vercel deployment and verify health checks. Check scheduled cron configuration separately after rollback; do not assume rollback handles database or scheduled-job changes.
- For a database defect, stop the affected workflow using feature/configuration flags where possible, preserve evidence, and apply a reviewed forward fix. Restore a backup only under incident leadership because restore can discard subsequent data.
- Disable public registration if membership creation, card issuance, access control, or privacy checks fail. Do not claim success based only on UI responses.
- Record impact, affected data, mitigation and notification decisions in the incident log. Follow the approved incident-response and data-breach procedure.

No production deployment or production smoke test has yet occurred.
