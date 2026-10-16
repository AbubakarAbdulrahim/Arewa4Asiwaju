import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { formatMembershipNumber } from "../src/lib/utils.ts";
import { registrationSchema } from "../src/lib/validation/registration-schema.ts";
import { inspectMemberPhoto } from "../src/lib/security/member-photo.ts";

test("Vercel Preview APP_ENV maps to staging without accepting unknown environments", () => {
  const preview = spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "--input-type=module",
      "-e",
      'import { env } from "./src/lib/env.ts"; console.log(env.APP_ENV)',
    ],
    {
      encoding: "utf8",
      env: { ...process.env, APP_ENV: "preview" },
    },
  );
  assert.equal(preview.status, 0, preview.stderr);
  assert.equal(preview.stdout.trim(), "staging");

  const invalid = spawnSync(
    process.execPath,
    ["--experimental-strip-types", "--input-type=module", "-e", 'import "./src/lib/env.ts"'],
    {
      encoding: "utf8",
      env: { ...process.env, APP_ENV: "invalid" },
    },
  );
  assert.notEqual(invalid.status, 0);
});

test("membership number display is stable and normalised", () => {
  assert.equal(formatMembershipNumber(" a4a-2026-st-000042 "), "A4A-2026-ST-000042");
});

test("registration validation rejects invalid email and requires explicit notice consent", () => {
  const result = registrationSchema.safeParse({
    firstName: "Ada",
    lastName: "Example",
    email: "not-an-email",
    stateOfResidence: "Kano",
    lgaOfResidence: "Kano Municipal",
    acceptedNotice: false,
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.issues.some((issue) => issue.path[0] === "email"));
    assert.ok(result.error.issues.some((issue) => issue.path[0] === "acceptedNotice"));
  }
});

test("registration keeps the profile minimal and normalises the email address", () => {
  const result = registrationSchema.safeParse({
    firstName: "Amina",
    middleName: "",
    lastName: "Hausa",
    email: " Amina@example.org ",
    password: "staging-test-password-123",
    confirmPassword: "staging-test-password-123",
    phone: "09123456789",
    stateOfResidence: "Kano",
    lgaOfResidence: "Kano Municipal",
    ward: "Dala",
    voterCard: "no",
    isStudent: "no",
    acceptedNotice: true,
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.email, "amina@example.org");
    assert.equal(result.data.phone, "09123456789");
    assert.equal("politicalAffiliation" in result.data, false);
  }
});

test("member photo validation reads JPEG dimensions from image bytes", () => {
  const jpeg = Uint8Array.from([
    0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x03, 0xc0, 0x02, 0xd0, 0x03, 0x01, 0x11, 0x00, 0x02,
    0x11, 0x01, 0x03, 0x11, 0x01, 0xff, 0xd9,
  ]);
  assert.deepEqual(inspectMemberPhoto(jpeg), {
    format: "jpeg",
    width: 720,
    height: 960,
    contentType: "image/jpeg",
  });
});

test("member photo validation rejects spoofed MIME-only image data", () => {
  assert.throws(() => inspectMemberPhoto(new TextEncoder().encode("not an image")), {
    message: "photo_format_invalid",
  });
});
