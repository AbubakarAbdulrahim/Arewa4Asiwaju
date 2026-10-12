# Backup and recovery

## Coverage

Supabase database backups cover database state according to the selected plan and retention. They do **not** include objects in Supabase Storage. PDF ID cards can be regenerated from membership/card records and the issuing workflow, but uploaded source media needs a separate approved object backup/export policy.

## Before launch

- [ ] Record the production plan, backup schedule, retention window and recovery-point/recovery-time objectives.
- [ ] Enable available point-in-time recovery if required by the approved objectives.
- [ ] Store backup access credentials in the organisation's secret manager with restricted operators.
- [ ] Define separate backup/export and retention for Storage objects; encrypt exports and restrict access.
- [ ] Schedule periodic restore rehearsals into an isolated recovery project.

## Restore rehearsal procedure

1. Open an incident/recovery record and identify the target recovery timestamp and affected systems.
2. Restore the database to a separate Supabase project using the dashboard's backup/PITR restore workflow or the supported Supabase backup/restore procedure for the plan.
3. Restore or re-create required Storage objects from the approved object backup; verify bucket privacy and policies.
4. Apply no new public traffic to the recovery project. Validate schema/migration state, RLS, Auth configuration, record counts and representative membership/card/verification flows using controlled accounts.
5. Record duration, gaps, validation evidence and approvals. Only an authorised operator may switch production DNS/application configuration after incident leadership approves.

## Current status

No production Supabase project is configured in this workspace, and no production backup or restore has been executed. This procedure is a handover template, not evidence of a tested recovery. Confirm the plan-specific backup capability and retention in the Supabase dashboard before launch.
