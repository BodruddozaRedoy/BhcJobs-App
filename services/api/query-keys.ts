/**
 * Cache keys for every query in the app, in one place.
 *
 * Centralised so a key is never spelled two different ways — two spellings mean two
 * cache entries, which silently costs the deduplication and the shared cache that
 * are the whole point of keying them.
 */
export const queryKeys = {
  industries: ["industries"] as const,
  jobs: ["jobs"] as const,
  companies: ["companies"] as const,
};
