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
