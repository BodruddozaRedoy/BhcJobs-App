import { createMMKV } from "react-native-mmkv";

import { logger } from "@/lib/logger";

const storage = createMMKV({ id: "bhcjobs.default" });

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

export const getString = (key: string): string | undefined => storage.getString(key);

export const getNumber = (key: string): number | undefined => storage.getNumber(key);

export const getBoolean = (key: string): boolean | undefined => storage.getBoolean(key);

export const set = (key: string, value: string | number | boolean): void => {
  storage.set(key, value);
};

export const remove = (key: string): void => {
  storage.remove(key);
};

export const contains = (key: string): boolean => storage.contains(key);

export const getAllKeys = (): string[] => storage.getAllKeys();

/**
 * Wipes every non-sensitive value. Used on logout alongside the SecureStore
 * clear, so a second user on the same device does not inherit the first one's
 * cached lists.
 */
export const clearAll = (): void => {
  storage.clearAll();
};

/**
 * Reads and parses a JSON value.
 *
 * A parse failure is treated as a cache miss rather than an error: the stored
 * blob is from an older app version or was truncated, and the caller's job is to
 * refetch, not to crash. The bad entry is dropped so it cannot fail twice.
 */
export const getObject = <T>(key: string): T | undefined => {
  const raw = storage.getString(key);
  if (raw === undefined) return undefined;

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    logger.error(`[mmkv] discarding unparseable value at "${key}"`, error);
    storage.remove(key);
    return undefined;
  }
};

export const setObject = (key: string, value: unknown): void => {
  storage.set(key, JSON.stringify(value));
};

/* -------------------------------------------------------------------------- */
/* Zustand persist adapter                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Storage engine shaped for `zustand/middleware`'s `persist`:
 *
 *   persist(fn, { name: 'app', storage: createJSONStorage(() => mmkvStorage) })
 *
 * Deliberately typed structurally instead of importing zustand's `StateStorage`,
 * so this module stays usable if the state library changes. The methods return
 * values directly rather than promises; `persist` accepts either.
 */
export const mmkvStorage = {
  getItem: (name: string): string | null => storage.getString(name) ?? null,
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.remove(name);
  },
};

/** Escape hatch for the rare case you need the raw instance (listeners, trim). */
export { storage as mmkv };
