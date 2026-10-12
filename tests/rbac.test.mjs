import assert from "node:assert/strict";
import test from "node:test";
import { hasPermission, verifyScopeAccess } from "../src/lib/auth/rbac.ts";

test("auditor and privacy roles do not inherit broad membership access", () => {
  assert.equal(hasPermission("auditor", "audit:read"), true);
  assert.equal(hasPermission("auditor", "members:read_all"), false);
  assert.equal(hasPermission("data_protection_officer", "privacy:manage"), true);
  assert.equal(hasPermission("data_protection_officer", "members:read_all"), false);
});

test("coordinator scope follows assigned unit ancestry", () => {
  const lgaScope = { org_unit_id: "lga-kn-kano-municipal", state_code: "KN" };

  assert.equal(
    verifyScopeAccess("lga_coordinator", lgaScope, {
      org_unit_id: "ward-kn-ward-1",
      ancestor_unit_ids: ["ward-kn-ward-1", "lga-kn-kano-municipal", "state-kn", "national"],
    }),
    true,
  );
  assert.equal(
    verifyScopeAccess("lga_coordinator", lgaScope, {
      org_unit_id: "lga-ba-bauchi",
      ancestor_unit_ids: ["lga-ba-bauchi", "state-ba", "national"],
    }),
    false,
  );
});

test("auditor and DPO roles do not receive member-record scope", () => {
  const target = {
    org_unit_id: "state-kn",
    state_code: "KN",
    ancestor_unit_ids: ["state-kn", "national"],
  };
  assert.equal(verifyScopeAccess("auditor", {}, target), false);
  assert.equal(verifyScopeAccess("data_protection_officer", {}, target), false);
});
