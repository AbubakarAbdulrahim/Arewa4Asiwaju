import { z } from "zod";

const name = z
  .string()
  .trim()
  .min(2, "Enter at least 2 characters")
  .max(100, "Use 100 characters or fewer")
  .regex(/^[\p{L}\p{M} .'-]+$/u, "Use letters and standard name punctuation");

export const registrationSchema = z
  .object({
    firstName: name,
    middleName: z.string().trim().max(100).optional().or(z.literal("")),
    lastName: name,
    email: z
      .string()
      .trim()
      .email("Enter a valid email address")
      .max(254)
      .transform((value) => value.toLowerCase()),
    password: z.string().min(12, "Use at least 12 characters").max(128),
    confirmPassword: z.string().min(12).max(128),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a phone number")
      .max(30)
      .regex(/^\+?[0-9 ()-]{7,30}$/, "Enter a valid phone number"),
    stateOfResidence: z.string().trim().min(2).max(100),
    lgaOfResidence: z.string().trim().min(2).max(100),
    ward: z.string().trim().min(1, "Enter your ward").max(150),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional().or(z.literal("")),
    dateOfBirth: z.string().trim().optional().or(z.literal("")),
    occupation: z.string().trim().max(120).optional().or(z.literal("")),
    address: z.string().trim().max(500).optional().or(z.literal("")),
    voterCard: z.enum(["yes", "no", "prefer_not_to_say"]).optional().or(z.literal("")),
    voterCardNumber: z
      .string()
      .trim()
      .max(50)
      .regex(/^[A-Za-z0-9 /-]*$/, "Use only letters, numbers, spaces, slashes, or hyphens.")
      .optional()
      .or(z.literal("")),
    isStudent: z.enum(["yes", "no"]),
    institutionType: z
      .enum(["tertiary", "artisan", "youth_corps", "general"])
      .optional()
      .or(z.literal("")),
    institutionName: z
      .string()
      .trim()
      .max(255, "Use 255 characters or fewer")
      .optional()
      .or(z.literal("")),
    courseOfStudy: z.string().trim().max(255).optional().or(z.literal("")),
    studyLevel: z.string().trim().max(80).optional().or(z.literal("")),
    acceptedNotice: z.literal(true, {
      error: "You must accept the data processing notice to continue.",
    }),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "The passwords do not match.",
      });
    }
    const fullName = [value.firstName, value.middleName, value.lastName].filter(Boolean).join(" ");
    if (fullName.length > 90) {
      context.addIssue({
        code: "custom",
        path: ["firstName"],
        message: "Your full name must fit within 90 characters.",
      });
    }
    if (value.institutionName && !value.institutionType) {
      context.addIssue({
        code: "custom",
        path: ["institutionType"],
        message: "Choose the institution type.",
      });
    }
    if (value.voterCard === "yes" && !value.voterCardNumber?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["voterCardNumber"],
        message: "Enter your voter’s card number.",
      });
    }
    if (value.voterCard !== "yes" && value.voterCardNumber?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["voterCardNumber"],
        message: "Select Yes before entering a voter’s card number.",
      });
    }
    if (value.isStudent === "yes") {
      for (const field of [
        "institutionName",
        "institutionType",
        "courseOfStudy",
        "studyLevel",
      ] as const) {
        if (!value[field])
          context.addIssue({
            code: "custom",
            path: [field],
            message: "Required for current students.",
          });
      }
    }
    const dateParts = value.dateOfBirth ? value.dateOfBirth.split("-").map(Number) : [];
    const dateIsFormatted = /^\d{4}-\d{2}-\d{2}$/.test(value.dateOfBirth ?? "");
    const dateIsReal =
      dateIsFormatted &&
      dateParts.length === 3 &&
      new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]))
        .toISOString()
        .slice(0, 10) === value.dateOfBirth;
    if (value.dateOfBirth && (!dateIsReal || new Date(value.dateOfBirth) > new Date())) {
      context.addIssue({
        code: "custom",
        path: ["dateOfBirth"],
        message: "Enter a valid date of birth.",
      });
    }
  });

export type RegistrationFormData = z.infer<typeof registrationSchema>;

/** Shape stored inside a short-lived, service-only registration intent. */
export type RegistrationProfile = Pick<
  RegistrationFormData,
  "firstName" | "middleName" | "lastName" | "stateOfResidence" | "lgaOfResidence"
>;
