import { z } from "zod";
import { NORTHERN_STATES } from "../geo-data.ts";

const personName = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .regex(/^[\p{L}\p{M} .'-]+$/u);

export const profileUpdateSchema = z
  .object({
    firstName: personName,
    middleName: z.string().trim().max(100).optional().or(z.literal("")),
    lastName: personName,
    stateOfResidence: z.string().trim().min(2).max(100),
    lgaOfResidence: z.string().trim().min(2).max(100),
  })
  .superRefine((profile, context) => {
    const fullName = [profile.firstName, profile.middleName, profile.lastName]
      .filter(Boolean)
      .join(" ");
    if (fullName.length > 90)
      context.addIssue({
        code: "custom",
        path: ["firstName"],
        message: "Name must be 90 characters or fewer.",
      });
    const state = NORTHERN_STATES.find((item) => item.name === profile.stateOfResidence);
    if (!state || !state.lgas.includes(profile.lgaOfResidence)) {
      context.addIssue({
        code: "custom",
        path: ["lgaOfResidence"],
        message: "Choose a valid state and LGA.",
      });
    }
  });

export const eventActionSchema = z.object({ eventId: z.string().uuid() });
export const supportRequestSchema = z.object({
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(4000),
  category: z.enum(["membership", "id_card", "events", "privacy", "technical", "general"]),
});
export const dataRequestSchema = z.object({
  requestType: z.enum(["access", "rectification", "erasure", "restriction"]),
  details: z.string().trim().max(1000).optional(),
});
export const notificationPreferencesSchema = z.object({
  emailAnnouncements: z.boolean(),
  emailEventReminders: z.boolean(),
  smsAnnouncements: z.boolean(),
  smsEventReminders: z.boolean(),
});
