# Database model and query guide

## Entity relationships

```mermaid
erDiagram
  AUTH_USERS ||--|| PROFILES : "verified account"
  PROFILES ||--o| MEMBERSHIPS : owns
  PROFILES ||--o{ CONSENT_RECORDS : records
  PROFILES ||--o{ ROLE_ASSIGNMENTS : receives
  PROFILES ||--o{ AUDIT_LOGS : acts
  ORGANISATIONAL_UNITS ||--o{ ORGANISATIONAL_UNITS : contains
  ORGANISATIONAL_UNITS ||--o{ MEMBERSHIPS : scopes
  ORGANISATIONAL_UNITS ||--o{ ROLE_ASSIGNMENTS : scopes
  MEMBERSHIPS ||--o{ ID_CARDS : issues
  MEMBERSHIPS ||--o{ EVENT_REGISTRATIONS : registers
  EVENTS ||--o{ EVENT_REGISTRATIONS : accepts
  MEMBERSHIPS ||--o{ SUPPORT_REQUESTS : opens
  MEMBERSHIPS ||--o{ DATA_REQUESTS : requests

  AUTH_USERS { uuid id PK }
  PROFILES { uuid id PK_FK string email string phone }
  MEMBERSHIPS { uuid id PK uuid profile_id FK string membership_number UK string status string state_code uuid org_unit_id FK }
  CONSENT_RECORDS { uuid id PK uuid profile_id FK string consent_purpose string policy_version string policy_sha256 boolean is_granted }
  ROLE_ASSIGNMENTS { uuid id PK uuid user_id FK string role uuid org_unit_id FK uuid assigned_by FK }
  ORGANISATIONAL_UNITS { uuid id PK string code UK string type uuid parent_id FK string state_code }
  ID_CARDS { uuid id PK uuid membership_id FK int card_version string verification_token UK }
  EVENTS { uuid id PK string slug UK timestamptz start_date boolean is_published }
  EVENT_REGISTRATIONS { uuid id PK uuid event_id FK uuid membership_id FK }
  SUPPORT_REQUESTS { uuid id PK uuid membership_id FK string status }
  DATA_REQUESTS { uuid id PK uuid membership_id FK string request_type string status }
  MEMBERSHIP_COUNTERS { int year PK string state_code PK int current_seq }
```

`auth.users` owns credentials and confirmed email state. `profiles.id` references `auth.users.id` with `ON DELETE RESTRICT`; Auth deletion must go through an approved privacy workflow rather than accidentally cascading through membership and consent history. A profile is created only after confirmed email through `create_verified_membership`. Membership numbers have a database unique constraint and are allocated with an atomic counter in the same transaction as the profile, membership, consent receipt, and base member role. A retry for the same confirmed Auth user returns the existing membership.

Role assignments are not client writable. Global role rows have a unique `(user_id, role)` index; scoped rows have a unique `(user_id, role, org_unit_id)` index. Coordinator roles require an organisational unit whose type matches the level. Unit trees use National → optional Zone → State → LGA → Ward → Chapter/support group. A trigger validates parent types, state consistency, and cycles.

Consent receipts record the purpose, policy version, policy SHA-256, source, and time. They are append-only from client roles. A later withdrawal is a new denied record, not an edit to the historical grant. Contact and policy text collection rules must still be approved by the organisation's data-protection review.

## Indexes and query patterns

| Query                                                    | Index                                                                                                      |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Lookup or prevent duplicate membership numbers           | Existing unique index on `memberships.membership_number`                                                   |
| Member's membership and status list, sorted newest first | `memberships_scope_status_created_idx (org_unit_id, status, created_at DESC)`; owner key is already unique |
| Coordinator assignments by organisational unit and role  | `role_assignments_org_role_idx (org_unit_id, role)`                                                        |
| Resolve user's assignments                               | Existing `role_assignments_user` index                                                                     |
| Traverse unit parent/child relations                     | `organisational_units_parent_idx (parent_id)` and existing unique `code`                                   |
| Resolve a member's residence                             | `profiles_residence_idx (state_of_residence, lga_of_residence)`                                            |
| Read card history for a membership                       | `id_cards_membership_issued_idx (membership_id, issued_at DESC)`; unique membership/version constraint     |
| Read member consent history by purpose                   | `consent_records_profile_purpose_idx (profile_id, consent_purpose, consented_at DESC)`                     |

Filter and paginate membership lists in PostgreSQL. Scope checks should use `org_unit_id` and ancestry, not string matching on names. Public queries should filter published events/articles and use their existing slug/date indexes. Never fetch broad member/profile sets and filter them in application memory.

## Permission matrix (database access)

| Role                    | Profiles         | Memberships                      | Role assignments             | Consent                                        | Private card fields           | Privileged writes                                                  |
| ----------------------- | ---------------- | -------------------------------- | ---------------------------- | ---------------------------------------------- | ----------------------------- | ------------------------------------------------------------------ |
| Public/anonymous        | None             | None                             | None                         | None                                           | None                          | None                                                               |
| Member                  | Own row          | Own row                          | Own assignments              | Own history                                    | No token, QR, or storage path | None                                                               |
| Event manager           | None             | None                             | Own assignments              | None                                           | None                          | Server workflow only                                               |
| Chapter coordinator     | Own profile only | Assigned chapter and descendants | Own assignments              | Own history                                    | None                          | Server workflow only                                               |
| LGA coordinator         | Own profile only | Assigned LGA and descendants     | Own assignments              | Own history                                    | None                          | Server workflow only                                               |
| State coordinator       | Own profile only | Assigned state and descendants   | Own assignments              | Own history                                    | None                          | Server workflow only                                               |
| Content editor          | None             | None                             | Own assignments              | None                                           | None                          | Server workflow only                                               |
| Membership officer      | Own profile only | National membership rows         | Own assignments              | Own history                                    | None                          | Server workflow only                                               |
| Data protection officer | Own profile only | Own row                          | Own assignments              | Own and privacy review through server workflow | None                          | Server workflow only                                               |
| Auditor                 | None             | None                             | Own assignments              | None                                           | None                          | Audit log read only                                                |
| Super administrator     | Own profile only | National rows                    | All rows through role policy | Own history                                    | None                          | Role grants via guarded function; other writes via server workflow |
| `service_role` backend  | Bypasses RLS     | Bypasses RLS                     | Bypasses RLS                 | Bypasses RLS                                   | Bypasses RLS                  | Secret, server-only; never client-exposed                          |

Application routes must enforce the same scope and purpose restrictions before using a service-role client. `service_role` bypasses RLS by design, so its key must stay server-side and its use must be audited. A first super administrator must be bootstrapped by an authorised operator in the Supabase SQL editor; never make a public signup the bootstrap mechanism.
