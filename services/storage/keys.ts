/**
 * All storage keys in one place, so two features cannot silently collide on the
 * same key and so `clearAll`-style operations know exactly what exists.
 *
 * Keys are namespaced by concern. Changing a key string orphans whatever is
 * already on users' devices — treat these as a migration surface, not free text.
 */

/** Non-sensitive keys, persisted in MMKV (plain text on disk). */
export const StorageKeys = {
  /** 'light' | 'dark' | 'system' — user's theme override. */
  THEME: "pref.theme",
  /** BCP-47 tag for the selected language. */
  LANGUAGE: "pref.language",
  /** `false` once the user has seen the intro screens. */
  ONBOARDING_PENDING: "flag.onboardingPending",
  /** Cached list payloads, so the landing page can paint before the network settles. */
  CACHED_INDUSTRIES: "cache.industries",
  CACHED_JOBS: "cache.jobs",
  CACHED_COMPANIES: "cache.companies",
  /** Recent search terms shown on the search screen. */
  RECENT_SEARCHES: "cache.recentSearches",
} as const;

/** Sensitive keys, persisted in the OS keychain / keystore via SecureStore. */
export const SecureKeys = {
  /** Bearer token issued by `/api/job_seeker/login`. */
  AUTH_TOKEN: "auth.token",
  /** Phone number awaiting OTP confirmation between register and phone_verify. */
  PENDING_PHONE: "auth.pendingPhone",
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
export type SecureKey = (typeof SecureKeys)[keyof typeof SecureKeys];
