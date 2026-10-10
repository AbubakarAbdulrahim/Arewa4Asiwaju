import { z } from "zod";

export const registrationSchema = z.object({
  // Step 1: Personal Details
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters"),
  middleName: z.string().max(50).optional().or(z.literal("")),
  email: z
    .string()
    .email("Please provide a valid email address")
    .max(100),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long")
    .regex(/^(\+?234|0)[789][01]\d{8}$/, "Please enter a valid Nigerian mobile number (e.g., 08012345678 or +2348012345678)"),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Please select gender" }),
  }),
  dateOfBirth: z.string().optional().or(z.literal("")),

  // Step 2: Geography & Education
  stateOfResidence: z
    .string()
    .min(2, "Please select your state of residence"),
  lgaOfResidence: z
    .string()
    .min(2, "Please select your Local Government Area"),
  ward: z.string().max(100).optional().or(z.literal("")),
  institutionType: z.enum(["tertiary", "artisan", "youth_corps", "general"]).default("tertiary"),
  institutionName: z.string().max(200).optional().or(z.literal("")),
  courseOfStudy: z.string().max(150).optional().or(z.literal("")),
  graduationYear: z.string().optional().or(z.literal("")),

  // Step 3: Consent & NDPR
  ndprConsent: z.boolean().refine((val) => val === true, {
    message: "You must accept the NDPR data processing notice to join.",
  }),
  codeOfConduct: z.boolean().refine((val) => val === true, {
    message: "You must agree to the movement's Code of Conduct.",
  }),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(true),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
