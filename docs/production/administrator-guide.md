# Administrator guide

## Before using an admin account

1. Create the designated administrator's Auth account through the trusted Supabase administration workflow. Public member registration does not grant admin access. At `/admin-login`, use **Forgot password?** to receive a password setup link at that account's email.
2. An authorised deployment operator assigns the initial `super_admin` role using the one-time bootstrap command after production migrations have been reviewed and applied.
3. Sign in at `/admin-login` with the account email and password, enrol MFA, verify recovery methods, and use a dedicated account rather than a shared login. Member sign-in remains at `/auth/login` and continues to use an emailed one-time link.
4. Assign staff the narrowest role and organisational scope required. Review role assignments regularly and revoke access promptly when duties change.

## Operating the dashboard

- Search and filter members only for an authorised operational purpose. Avoid exports unless necessary; use the smallest date range and organisational scope available and store exports securely with a deletion date.
- Change membership/card status only after verifying the request. Record a clear reason where the interface requests one and confirm the audit entry.
- Assign coordinators to the correct organisational unit. Do not grant broad access to solve a local scoping issue.
- Draft and review public content before publishing. Verify names, titles, dates, claims, image rights and consent before publication.
- Track event attendance and support requests only for their stated operational purpose.
- Route access, correction, deletion and other privacy requests to the designated data protection officer and follow the approved retention/response procedure.
- Treat failed notifications as not delivered unless provider status confirms delivery. Retry only after checking duplicate-send risk.

## Security and incidents

- Never share accounts, passwords, MFA codes, service-role keys or exported member lists in chat/email.
- Review audit logs after privileged changes. Escalate unexpected role grants, bulk exports, account takeover concerns or suspected exposure through the organisation's incident-response procedure.
- Disable access for departing staff immediately; revoke active sessions where supported.
- Use the staging environment for training and testing. Do not insert fabricated records into production.

The admin interface and role workflows are implemented in the application, but production role enforcement must be revalidated after applying the reviewed migrations to the dedicated production Supabase project.
