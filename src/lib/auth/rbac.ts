import type { UserRole } from "@/types/database";

export type Permission =
  | "members:read_all"
  | "members:read_scoped"
  | "members:write"
  | "members:export"
  | "cards:read"
  | "cards:manage"
  | "cards:revoke"
  | "events:create"
  | "events:edit"
  | "events:attendance"
  | "content:draft"
  | "content:publish"
  | "content:delete"
  | "roles:manage"
  | "audit:read"
  | "privacy:manage"
  | "settings:manage";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "members:read_all",
    "members:read_scoped",
    "members:write",
    "members:export",
    "cards:read",
    "cards:manage",
    "cards:revoke",
    "events:create",
    "events:edit",
    "events:attendance",
    "content:draft",
    "content:publish",
    "content:delete",
    "roles:manage",
    "audit:read",
    "privacy:manage",
    "settings:manage",
  ],
  auditor: ["audit:read"],
  data_protection_officer: ["privacy:manage", "audit:read"],
  membership_officer: [
    "members:read_all",
    "members:write",
    "cards:read",
    "cards:manage",
    "cards:revoke",
    "members:export",
  ],
  content_editor: ["content:draft", "content:publish", "content:delete"],
  state_coordinator: [
    "members:read_scoped",
    "cards:read",
    "events:create",
    "events:edit",
    "events:attendance",
  ],
  lga_coordinator: ["members:read_scoped", "cards:read", "events:attendance"],
  chapter_coordinator: ["members:read_scoped", "cards:read", "events:attendance"],
  event_manager: ["events:create", "events:edit", "events:attendance"],
  member: [],
  public_visitor: [],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export interface RoleScope {
  org_unit_id?: string | null;
  state_code?: string | null;
  lga_name?: string | null;
}

export interface TargetScope extends RoleScope {
  /** Unit IDs between this target and the hierarchy root, including itself. */
  ancestor_unit_ids?: readonly string[];
}

const NATIONAL_MEMBERSHIP_ROLES: UserRole[] = ["super_admin", "membership_officer"];

/**
 * Evaluate whether a role assignment covers the target. Callers must obtain
 * scope data from trusted database rows; this helper is not an authorization boundary.
 */
export function verifyScopeAccess(
  actorRole: UserRole,
  actorScope: RoleScope,
  targetScope: TargetScope,
): boolean {
  if (NATIONAL_MEMBERSHIP_ROLES.includes(actorRole)) return true;

  if (["state_coordinator", "lga_coordinator", "chapter_coordinator"].includes(actorRole)) {
    if (actorScope.org_unit_id && targetScope.ancestor_unit_ids) {
      return targetScope.ancestor_unit_ids.includes(actorScope.org_unit_id);
    }
    if (actorRole === "state_coordinator") {
      return Boolean(actorScope.state_code && actorScope.state_code === targetScope.state_code);
    }
    if (actorRole === "lga_coordinator") {
      return Boolean(
        actorScope.state_code &&
        actorScope.state_code === targetScope.state_code &&
        actorScope.lga_name &&
        actorScope.lga_name.toLocaleLowerCase("en") ===
          (targetScope.lga_name ?? "").toLocaleLowerCase("en"),
      );
    }
  }

  return false;
}
