/**
 * Runtime configuration.
 *
 * Values come from `EXPO_PUBLIC_*` environment variables, which Expo inlines at
 * build time (see https://docs.expo.dev/guides/environment-variables/). The
 * fallbacks below point at the dev backend so a fresh clone runs without a
 * `.env` file — create one to target a different environment.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://dev.bhcjobs.com';

export const STORAGE_URL =
  process.env.EXPO_PUBLIC_STORAGE_URL ?? 'https://dev.bhcjobs.com/storage';

/** Abort a request that has not responded within this window. */
export const API_TIMEOUT_MS = 15_000;

/**
 * Public legal pages, linked from the sign-up form.
 *
 * Opened in a browser rather than rendered in-app: the copy is owned by the
 * website, so a screen here would have to be kept in sync by hand. The paths are
 * assumed to follow the usual convention — confirm them against the site and
 * adjust here if they differ, since a wrong path fails as a 404 the form cannot
 * detect.
 */
export const TERMS_URL = `${API_BASE_URL}/terms`;
export const PRIVACY_URL = `${API_BASE_URL}/privacy-policy`;
