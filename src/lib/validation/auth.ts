import { z } from "zod";

/**
 * Login validation. Laravel's `AuthenticatesUsers` requires the `email`
 * (valid address) and `password` (string) fields.
 */
export const loginSchema = z.object({
  email: z.email("Please enter valid email."),
  password: z.string().min(1, "The password field is required."),
  remember: z.coerce.boolean().optional().default(false),
  // Where to send the user after login (Laravel's `redirect()->intended()`).
  intended: z.string().optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Registration validation, mirroring `RegisterController::validator`.
 */
export const registerSchema = z
  .object({
    first_name: z
      .string()
      .min(1, "The first name field is required.")
      .max(255),
    last_name: z.string().max(255).optional().nullable(),
    email: z.email("Please enter valid email.").max(255),
    phone: z.string().max(255).optional().nullable(),
    password: z.string().min(8, "The password must be at least 8 characters."),
    password_confirmation: z.string().min(1),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "The password and confirm password must match",
    path: ["password_confirmation"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
