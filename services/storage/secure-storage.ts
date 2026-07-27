import * as SecureStore from "expo-secure-store";

import { logger } from "@/lib/logger";

import { SecureKeys, type SecureKey } from "./keys";

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: "bhcjobs.auth",
};

export const getSecret = async (key: SecureKey): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key, OPTIONS);
  } catch (error) {
    logger.error(`[secure-store] read failed for "${key}"; treating as absent`, error);
    return null;
  }
};

/**
 * Writes a secret. Unlike reads, a failed write is surfaced: silently dropping a
 * token would leave the user apparently logged in until the next cold start.
 */
export const setSecret = async (key: SecureKey, value: string): Promise<void> => {
  await SecureStore.setItemAsync(key, value, OPTIONS);
};

export const deleteSecret = async (key: SecureKey): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key, OPTIONS);
  } catch (error) {
    // Deleting a key that is already gone is the desired end state either way.
    logger.error(`[secure-store] delete failed for "${key}"`, error);
  }
};

/**
 * True when the platform can actually store secrets. Android emulators without
 * a configured keystore and web builds both report false.
 */
export const isSecureStoreAvailable = (): Promise<boolean> => SecureStore.isAvailableAsync();

/* -------------------------------------------------------------------------- */
/* Auth token                                                                 */
/* -------------------------------------------------------------------------- */

export const readAuthToken = (): Promise<string | null> => getSecret(SecureKeys.AUTH_TOKEN);

export const writeAuthToken = (token: string): Promise<void> =>
  setSecret(SecureKeys.AUTH_TOKEN, token);

export const clearAuthToken = (): Promise<void> => deleteSecret(SecureKeys.AUTH_TOKEN);

/**
 * Removes every secret. Call on logout, together with `clearAll()` from
 * `mmkv.ts`, so nothing from the previous session survives.
 */
export const clearAllSecrets = async (): Promise<void> => {
  await Promise.all(Object.values(SecureKeys).map((key) => deleteSecret(key)));
};
