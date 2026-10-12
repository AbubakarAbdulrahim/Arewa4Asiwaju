# Supabase Auth, migrations, and database tests

## Local setup

Install Docker Desktop and the Supabase CLI, then run:

```sh
supabase start
supabase db reset
supabase test db
```

The open public registration endpoint creates an Auth account without sending a signup email, then invokes the service-role-only membership transaction. Member portal sign-in and recovery still use email OTP, so configure and test email delivery for those features separately. Keep privileged accounts protected with MFA. See [Supabase Auth configuration](https://supabase.com/docs/guides/local-development/cli/config) and [password security](https://supabase.com/docs/guides/auth/password-security). Never point a local or Preview app at production data.

## Registration transaction and Auth handoff

The old `auth.users` trigger that trusted editable metadata and inserted dummy geography is removed. The public route validates input and abuse controls, creates the Auth identity without sending email, and calls `create_open_membership_with_card` using the server-only service role. This function locks the Auth row, validates the state unit and consent receipt metadata, then creates/updates the profile, allocates the unique number, creates the active membership, records consent, and grants only the `member` role plus initial card/job records in one PostgreSQL transaction. Concurrent retries for one user serialize on the Auth row; a retry returns the existing membership/card.

PDF rendering and private storage upload run immediately after the transaction; a failure leaves a durable membership and card job for safe retry. Public signup itself does not depend on SMTP. Portal sign-in/recovery email delivery remains a separate dependency.

## Role bootstrap and routine changes

1. Apply reviewed SQL only through a timestamped migration committed under `supabase/migrations/`.
2. Before deployment, take a database backup and run the migration against a restored staging copy.
3. For an initial super administrator, verify the person's Auth UUID out of band. In the SQL editor, run the following reviewed bootstrap with that exact UUID, then record the operator and change in the organisation's audit process:

   ```sql
   INSERT INTO public.role_assignments (user_id, role, org_unit_id, assigned_by)
   SELECT id, 'super_admin', NULL, NULL
   FROM public.profiles
   WHERE id = '<verified-auth-user-uuid>';
   ```

   This one-time break-glass bootstrap is not exposed through registration. Confirm exactly one row was inserted and verify the assignment through the authorised audit process.

4. Grant subsequent roles through `public.assign_user_role`, which requires a super-admin JWT (or trusted service role) and validates the assignment scope. Application APIs must still check purpose, organisational scope, and audit the action.
5. Deploy to staging first; inspect RLS and application behavior; then apply the exact same migration to production.

Migrations are forward-only after application. Do not edit a deployed migration. A rollback means a reviewed compensating migration restoring the previous policy/schema while preserving data; never use `db reset` on shared or production data. The hardening migration removes unsafe functions and replaces access policies; rollback should be prepared from a backup and reviewed before production deployment. It is intentionally not an automatic down migration.

## Tests and known verification limitation

`supabase/tests/database/security.test.sql` uses pgTAP fixtures to check number uniqueness, own-row access, cross-member denial, coordinator descendant scope and cross-state denial, protected status writes, role escalation, and rejection of a client-side membership-creation call. Tests run in the local Supabase database with `supabase test db` and are enclosed in a rollback transaction.

The open-registration migration must be applied to the linked staging project before deploying the route. Run `supabase test db` after applying migrations; do not treat static SQL inspection as a passed RLS test.
