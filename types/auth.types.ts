/** Payload for `POST /api/job_seeker/login`. Field names match the backend exactly. */
export interface LoginPayload {
  phone: string;
  password: string;
}

/**
 * Payload for `POST /api/job_seeker/register`.
 *
 * Snake_case throughout because these are the exact keys the API validates; a
 * camelCase rename here would silently produce "field is required" errors.
 */
export interface RegisterPayload {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
  /** Two letters + seven digits, e.g. `AB1234567`. */
  passport_number: string;
  /** ISO calendar date, `YYYY-MM-DD`. */
  dob: string;
  gender: string;
}

/**
 * Body of a successful registration.
 *
 * Unverified in shape: completing a real registration would have sent an OTP to a
 * live phone number, so only the failure paths were exercised. Treated as
 * best-effort — the flow relies on `status`, which the interceptor already checks,
 * rather than on any field below.
 */
export interface RegisterResponse {
  status?: boolean;
  message?: string;
  data?: {
    id?: number;
    phone?: string;
  };
}

/** The authenticated job seeker, as returned alongside a successful login. */
export interface JobSeeker {
  id: number;
  name?: string;
  phone?: string;
  email?: string;
  image?: string;
}

/**
 * Body of a successful login.
 *
 * The token key is not pinned down: this was written against the dev API, where
 * only the failure paths could be exercised without creating a real account and
 * triggering an SMS. Laravel/Sanctum backends variously return `token`,
 * `access_token`, or nest either under `data`, so all of those are accepted and
 * `resolveToken` below picks whichever is present.
 *
 * If the real response uses a different key, `resolveToken` logs a warning with
 * the received keys and login fails loudly rather than storing `undefined`.
 */
export interface LoginResponse {
  status?: boolean;
  message?: string;
  token?: string;
  access_token?: string;
  user?: JobSeeker;
  data?: {
    token?: string;
    access_token?: string;
    user?: JobSeeker;
  } & Partial<JobSeeker>;
}

/** Everything the app needs to consider a user signed in. */
export interface Session {
  token: string;
  user?: JobSeeker;
}
