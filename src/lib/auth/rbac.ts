import { UserRole } from "@/types/database";

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
  auditor: [
    "members:read_all",
    "cards:read",
    "audit:read",
  ],
  data_protection_officer: [
    "members:read_all",
    "privacy:manage",
    "audit:read",
  ],
  membership_officer: [
    "members:read_all",
    "members:write",
    "cards:read",
    "cards:manage",
    "cards:revoke",
    "members:export",
  ],
  content_editor: [
    "content:draft",
    "content:publish",
    "content:delete",
  ],
  state_coordinator: [
    "members:read_scoped",
    "cards:read",
    "events:create",
    "events:edit",
    "events:attendance",
  ],
  lga_coordinator: [
    "members:read_scoped",
    "cards:read",
    "events:attendance",
  ],
  chapter_coordinator: [
    "members:read_scoped",
    "cards:read",
    "events:attendance",
  ],
  event_manager: [
    "events:create",
    "events:edit",
    "events:attendance",
  ],
  member: [],
  public_visitor: [],
};

/**
 * Checks if a user role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Validates if an actor has scope access over a target entity
 * - Super admin, Auditor, DPO, Membership Officer have national scope
 * - State coordinator is strictly bounded by their state_code
 * - LGA coordinator is strictly bounded by their LGA
 */
export function verifyScopeAccess(
  actorRole: UserRole,
  actorScope: { state_code?: string | null; lga_name?: string | null },
  targetScope: { state_code?: string | null; lga_name?: string | null }
): boolean {
  if (actorRole === "super_admin" || actorRole === "auditor" || actorRole === "membership_officer" || actorRole === "data_protection_officer") {
    return true;
  }

  if (actorRole === "state_coordinator") {
    return !!actorScope.state_code && actorScope.state_code === targetScope.state_code;
  }

  if (actorRole === "lga_coordinator") {
    return (
      !!actorScope.state_code &&
      actorScope.state_code === targetScope.state_code &&
      !!actorScope.lga_name &&
      actorScope.lga_name.toLowerCase() === (targetScope.lga_name || "").toLowerCase()
    );
  }

  return false;
}
