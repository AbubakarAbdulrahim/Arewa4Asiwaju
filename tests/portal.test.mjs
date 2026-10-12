import test from "node:test";
import assert from "node:assert/strict";
import {
  profileUpdateSchema,
  eventActionSchema,
  supportRequestSchema,
  dataRequestSchema,
  notificationPreferencesSchema,
} from "../src/lib/validation/portal-schemas.ts";

test("profile update accepts a valid Northern state and LGA", () => {
  const value = profileUpdateSchema.parse({
    firstName: "Amina",
    middleName: "",
    lastName: "Yusuf",
    stateOfResidence: "Kano",
    lgaOfResidence: "Dala",
  });
  assert.equal(value.stateOfResidence, "Kano");
});

test("profile update rejects an unknown LGA and oversized display name", () => {
  assert.equal(
    profileUpdateSchema.safeParse({
      firstName: "Amina",
      lastName: "Yusuf",
      stateOfResidence: "Kano",
      lgaOfResidence: "Unknown",
    }).success,
    false,
  );
  assert.equal(
    profileUpdateSchema.safeParse({
      firstName: "A".repeat(70),
      lastName: "B".repeat(30),
      stateOfResidence: "Kano",
      lgaOfResidence: "Dala",
    }).success,
    false,
  );
});

test("portal actions validate IDs and keep request categories constrained", () => {
  assert.equal(eventActionSchema.safeParse({ eventId: "bad-id" }).success, false);
  assert.equal(
    supportRequestSchema.safeParse({
      subject: "Help",
      message: "Please help me with a membership issue.",
      category: "super_admin",
    }).success,
    false,
  );
  assert.equal(
    dataRequestSchema.safeParse({ requestType: "delete-everything", details: "" }).success,
    false,
  );
});

test("notification choices are explicit booleans", () => {
  assert.equal(
    notificationPreferencesSchema.safeParse({
      emailAnnouncements: true,
      emailEventReminders: false,
      smsAnnouncements: false,
      smsEventReminders: false,
    }).success,
    true,
  );
  assert.equal(
    notificationPreferencesSchema.safeParse({ emailAnnouncements: "yes" }).success,
    false,
  );
});
