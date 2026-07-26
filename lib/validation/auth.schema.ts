import { z } from "zod";

/**
 * Bangladeshi mobile number: 11 digits beginning `01`, with the third digit in
 * 3–9 (the operator prefix range). Matches the `01XXXXXXXXX` placeholder shown
 * on the sign-in screen.
 */
export const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

/**
 * Client-side rules for the sign-in form.
 *
 * These exist to catch obvious mistakes before spending a network round trip —
 * the backend remains the authority, and its per-field errors are merged into the
 * same form state (see `useLogin`). Deliberately lenient on the password: a
 * minimum length only, since rejecting an existing valid password on a *login*
 * form would lock people out of their own accounts.
 */
export const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .regex(BD_PHONE_REGEX, "Enter a valid 11-digit number starting with 01"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
