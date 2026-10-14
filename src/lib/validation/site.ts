import { z } from "zod";

/**
 * Zod mirrors of the Laravel validation rules for the public site POST
 * endpoints (`/careers`, `/consults`, `/contact-mail`).
 *
 * Field names, limits and error wording follow Laravel's
 * `$request->validate()` output so the existing front-end JS can read the 422
 * `errors` map unchanged.
 */

const RESUME_MAX_BYTES = 2048 * 1024;

const RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/jpg",
]);

const RESUME_EXTENSIONS = new Set(["pdf", "doc", "docx", "jpg", "jpeg"]);

/** `required|string` with an optional `max`, matching Laravel's messages. */
function requiredString(field: string, max?: number) {
  const required = `The ${field} field is required.`;
  const base = z.string({ error: required }).min(1, required);
  return max === undefined
    ? base
    : base.max(max, `The ${field} must not be greater than ${max} characters.`);
}

/** `required|email` with an optional `max`. */
function requiredEmail(field: string, max?: number) {
  const required = `The ${field} field is required.`;
  const invalid = `The ${field} must be a valid email address.`;
  const base = z.string({ error: required }).min(1, required);
  const bounded =
    max === undefined
      ? base
      : base.max(max, `The ${field} must not be greater than ${max} characters.`);
  return bounded.pipe(z.email(invalid));
}

/** `required|file|mimes:pdf,doc,docx,jpg,jpeg|max:2048`. */
function resumeFile() {
  return z
    .instanceof(File, { error: "The resume field is required." })
    .refine(
      (file) => file.size <= RESUME_MAX_BYTES,
      "The resume must not be greater than 2048 kilobytes.",
    )
    .refine((file) => {
      if (RESUME_MIME_TYPES.has(file.type)) {
        return true;
      }
      // Some clients send a generic type; fall back to the filename extension.
      if (file.type && file.type !== "application/octet-stream") {
        return false;
      }
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      return RESUME_EXTENSIONS.has(extension);
    }, "The resume must be a file of type: pdf, doc, docx, jpg, jpeg.");
}

/** `CareerApplicationController::store` (POST /careers). */
export const careerApplicationSchema = z.object({
  name: requiredString("name", 255),
  mobile: requiredString("mobile", 20),
  email: requiredEmail("email"),
  resume: resumeFile(),
  address: requiredString("address"),
  qualification: requiredString("qualification"),
  dob: requiredString("dob"),
  gender: requiredString("gender"),
  whatsappMobile: requiredString("whatsappMobile"),
  yearofexperience: requiredString("yearofexperience"),
});

export type CareerApplicationInput = z.infer<typeof careerApplicationSchema>;

/** `CareerApplicationController::store_consoult` (POST /consults). */
export const consultationSchema = z.object({
  name: requiredString("name", 255),
  designation: requiredString("designation"),
  lab_type: requiredString("lab_type"),
  school: requiredString("school", 255),
  city: requiredString("city", 255),
  mobile: z
    .string({ error: "The mobile field is required." })
    .min(1, "The mobile field is required.")
    .regex(/^\d{10}$/, "The mobile must be 10 digits."),
  email: requiredEmail("email", 255),
  class: requiredString("class", 100),
  strength: z
    .string({ error: "The strength field is required." })
    .min(1, "The strength field is required.")
    .regex(/^[+-]?\d+$/, "The strength must be an integer.")
    .transform((value) => Number(value))
    .refine((value) => value >= 1, "The strength must be at least 1."),
  preferred_date: z
    .string({ error: "The preferred date field is required." })
    .min(1, "The preferred date field is required.")
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      "The preferred date is not a valid date.",
    ),
  preferred_time: requiredString("preferred_time"),
  preferred_mode: requiredString("preferred_mode"),
  heard_about: requiredString("heard_about"),
  questions: requiredString("questions", 1000),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;

/** `FrontendController::contactMail` (POST /contact-mail). */
export const contactMessageSchema = z.object({
  name: requiredString("name"),
  email: requiredEmail("email"),
  subject: requiredString("subject"),
  mobile: requiredString("mobile"),
  message: requiredString("message"),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
