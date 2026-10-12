# Administration and organisational management

## Routes and boundaries

- `/admin` shows role-scoped live aggregates. It never substitutes sample metrics when the database procedure is unavailable.
- `/admin/members` searches in PostgreSQL and returns no more than 25 rows per page (100 maximum at the API boundary). Membership and phone/email search is restricted to national membership roles; coordinators see names and membership numbers in their unit ancestry.
- `/admin/organisation` shows the visible hierarchy. Creating or updating units is super-administrator-only; database triggers validate parent type, state consistency, uniqueness, and cycles.
- `/admin/roles` grants or revokes assignments through the existing guarded role functions. Coordinator role and scope compatibility is enforced in PostgreSQL. Super-administrator grants remain service-side only.
- `/admin/events`, `/admin/content`, leadership, media metadata, and `/admin/support` use authenticated RPCs for records and writes. Publication, status changes, assignment, scope, and response updates are recorded in `audit_logs`.
- `/admin/audit` is limited to super administrators, auditors, and data-protection officers.

All write requests require a same-origin request and an authenticated Supabase session. Admin access and protected role-assignment changes require Supabase AAL2 (a verified TOTP authenticator factor). The workspace offers TOTP enrollment and verification; the database policy helpers and role-assignment trigger also enforce AAL2, so a direct REST call cannot bypass the gate. Application role checks improve the response, but the database procedures independently validate the caller's current JWT and assignments. No service-role key is used by the administration UI.

## Database operations

Apply `20261010000004_admin_management.sql` after the Phase 6 migration. It adds server-side search and reporting functions, guarded write functions, leadership and media metadata tables, event attendance reads, an optional organisational scope for events, and supporting indexes. Enable TOTP MFA in the Supabase Auth settings. The pgTAP suite includes function grants and an AAL1-denial assertion in `supabase/tests/database/security.test.sql`.

The functions use `SECURITY DEFINER` with an empty `search_path`, validate input, and derive the acting user from `auth.uid()`. They are not considered verified until they have been applied and tested in staging. Run the full migration chain and `npm run db:test`, then test with accounts for membership officer, state/LGA/ward coordinators, event manager, content editor, auditor, and super administrator. Verify both allowed access and cross-scope denials.

## Current boundaries

- Media metadata can point at approved HTTPS assets; binary upload/replacement needs the approved Supabase Storage bucket and policies.
- Leadership roster publishing uses an explicit publish flag. The public roster continues to withhold names until an authorised editor confirms and publishes the appointments.
- Attendance lookup is permission- and scope-checked in PostgreSQL and paginated at 50 registrations per page.
- Membership CSV exports require a specific purpose, are limited to membership officers and super administrators, capped at 5,000 rows, and must be audited before the file is returned.
- The database is pending as requested. Do not enable privileged production operations until migration and RLS checks pass in staging.
