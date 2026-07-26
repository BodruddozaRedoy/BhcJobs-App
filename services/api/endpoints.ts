/**
 * Every backend path the app talks to, in one place.
 *
 * Paths are relative to `API_BASE_URL` (`constants/config.ts`) — never prefix
 * them with the host, or the axios `baseURL` is bypassed.
 */

export const ENDPOINTS = {
  /** GET — industry list for the "Popular Industries" section. */
  INDUSTRIES: "/api/industry/get",
  /** GET — job list for the "Recommended Jobs" section. */
  JOBS: "/api/job/get",
  /** GET — company list for the "Popular Companies" section. */
  COMPANIES: "/api/company/get",

  /** POST — create a job seeker account; responds with an OTP challenge. */
  REGISTER: "/api/job_seeker/register",
  /** POST — confirm the OTP sent to the phone number used at registration. */
  PHONE_VERIFY: "/api/job_seeker/phone_verify",
  /** POST — exchange phone + password for an auth token. */
  LOGIN: "/api/job_seeker/login",
} as const;

export type Endpoint = (typeof ENDPOINTS)[keyof typeof ENDPOINTS];
