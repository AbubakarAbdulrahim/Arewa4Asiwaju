# Known issues and launch blockers

Status checked 2026-10-11.

- **No production deployment:** no production Vercel project/deployment or domain/TLS configuration is present in the workspace.
- **Supabase target is staging:** all current versioned migrations are applied to staging; no production database target has been identified or migrated.
- **Staging notice is a draft:** local staging registration is enabled with the proposed `a4a-staging-v1` notice. Production registration must remain off until the responsible organisation approves the controller details, processing basis, notice and retention schedule and the complete flow passes controlled tests.
- **SMTP and production configuration missing:** registration and card creation do not send email. Member portal sign-in and account recovery still depend on email OTP delivery, which has not been verified. No production Vercel/Cloudflare setup, SMTP account, alert destination or public domain has been configured here.
- **Notification cadence:** the 15-minute worker schedule is incompatible with Vercel Hobby cron limits; select a suitable plan or durable scheduler.
- **Recovery unverified:** production backups and Storage object backup are not configured or restore-tested.
- **Security audit limitation:** the latest dependency audit identified five high-severity findings within a development-only dependency chain under `eslint-config-next`; the production dependency audit returned no high findings in the earlier Phase 9 check. Resolve or document the dev-chain findings before treating CI/developer tooling as fully cleared.
- **Launch tests outstanding:** no production registration, public QR verification, admin MFA, backup restore, member sign-in email delivery, RUM/Core Web Vitals or production access-control tests have been run. Staging open registration and card PDF download passed. No initial administrator has been assigned yet.

This list must be updated with an owner and closure evidence for every item before public launch.
