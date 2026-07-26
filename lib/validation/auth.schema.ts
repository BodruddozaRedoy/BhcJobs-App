import { z } from "zod";

/**
 * Bangladeshi mobile number: `01` followed by 9 digits.
 *
 * Deliberately matches the backend rather than being stricter. A tighter
 * `^01[3-9]\d{8}$` would reflect the real operator prefixes, but the API accepts
 * any `01`-prefixed 11-digit number (probed: `01234567890` passes format and fails
 * only on uniqueness). Rejecting client-side what the server accepted at signup
 * would lock those accounts out of the login form.
 */
export const BD_PHONE_REGEX = /^01\d{9}$/;

/**
 * Passport number: exactly two letters followed by seven digits — the Bangladeshi
 * format, e.g. `AB1234567`.
 *
 * Verified against the API rather than assumed. Rejected: `A1234567` (one letter),
 * `AB123456` (six digits), `AB12345678` (eight), `ABC123456` (three letters),
 * `AB123456X`, and anything containing a space or hyphen. Accepted: `AB1234567`,
 * `ab1234567` — so the letters are case-insensitive, and the value is upper-cased
 * before submission for consistency.
 */
export const PASSPORT_REGEX = /^[A-Za-z]{2}\d{7}$/;

/** ISO calendar date, as the `dob` field expects: `2002-12-12`. */
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Youngest age allowed to register as a job seeker. */
const MIN_AGE_YEARS = 16;
/** Upper bound that rejects obvious typos like `1002-12-12`. */
const MAX_AGE_YEARS = 100;

/**
 * True only for a date that actually exists on the calendar.
 *
 * The regex alone accepts `2002-02-31`, which `new Date` silently rolls over into
 * 3 March — so the parsed parts are compared back against the input. Parsed as UTC
 * so the result cannot shift by a day depending on the device's timezone.
 */
const isRealDate = (value: string): boolean => {
  const match = ISO_DATE_REGEX.exec(value);
  if (!match) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

/** Whole years between `value` and today, in UTC. */
const ageInYears = (value: string): number => {
  const [year, month, day] = value.split("-").map(Number);
  const now = new Date();
  let age = now.getUTCFullYear() - year;

  // Not yet had this year's birthday.
  if (now.getUTCMonth() + 1 < month || (now.getUTCMonth() + 1 === month && now.getUTCDate() < day)) {
    age -= 1;
  }

  return age;
};

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

/** Gender options offered by the form. Values match the API payload exactly. */
export const GENDERS = ["male", "female"] as const;

/**
 * Client-side rules for registration.
 *
 * Stricter than the backend on purpose. The API only checks that `name`, `email`,
 * `dob` and `gender` are *present* — it accepted `notanemail`, `not-a-date` and
 * `banana` when probed — so for those four fields this schema is the only thing
 * standing between a typo and a corrupt account.
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(60, "Name is too long"),
    phone: z
      .string()
      .trim()
      .min(1, "Mobile number is required")
      .regex(BD_PHONE_REGEX, "Enter a valid 11-digit number starting with 01"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    // Six is the server's minimum; matching it exactly avoids a client rule the
    // backend would have accepted, or vice versa.
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(1, "Confirm your password"),
    passport_number: z
      .string()
      .trim()
      .min(1, "Passport number is required")
      .regex(PASSPORT_REGEX, "Use 2 letters followed by 7 digits, e.g. AB1234567"),
    dob: z
      .string()
      .trim()
      .min(1, "Date of birth is required")
      .regex(ISO_DATE_REGEX, "Use the format YYYY-MM-DD")
      .refine(isRealDate, "That date does not exist")
      .refine((value) => ageInYears(value) >= MIN_AGE_YEARS, `You must be at least ${MIN_AGE_YEARS}`)
      .refine((value) => ageInYears(value) <= MAX_AGE_YEARS, "Check the year of birth"),
    gender: z.enum(GENDERS, { message: "Select a gender" }),
  })
  // Attached to `confirm_password` so the message renders under the field the user
  // needs to fix, not at the top of the form.
  .refine((values) => values.password === values.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
