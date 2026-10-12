import assert from "node:assert/strict";
import test from "node:test";
import { formatMembershipNumber } from "../src/lib/utils.ts";
import { registrationSchema } from "../src/lib/validation/registration-schema.ts";
import { inspectMemberPhoto } from "../src/lib/security/member-photo.ts";

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
    stateOfResidence: "Kano",
    lgaOfResidence: "Kano Municipal",
    acceptedNotice: true,
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.email, "amina@example.org");
    assert.equal("phone" in result.data, false);
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
