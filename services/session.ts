import { setAuthToken } from "./api";
import * as mmkv from "./storage/mmkv";
import { clearAllSecrets, readAuthToken, writeAuthToken } from "./storage/secure-storage";

/**
 * Coordinates the two things that must always agree about who is logged in: the
 * token on disk (SecureStore) and the token the axios interceptor attaches to
 * requests (in memory).
 *
 * This module sits above both `api` and `storage` on purpose — neither of those
 * should import the other, so the wiring lives here. Call these from the auth
 * store rather than touching SecureStore or `setAuthToken` directly, otherwise
 * the two copies drift and requests go out unauthenticated while the UI still
 * shows a logged-in user.
 */

/**
 * Rehydrates the session on cold start. Await this before rendering anything
 * auth-dependent; until it resolves, the app cannot know whether the user is
 * signed in.
 *
 * @returns the restored token, or `null` when there is no session to resume.
 */
export const restoreSession = async (): Promise<string | null> => {
  const token = await readAuthToken();
  // Mirror into the interceptor even when null, so a failed read reliably
  // produces unauthenticated requests instead of reusing a stale token.
  setAuthToken(token);
  return token;
};

/** Persists a freshly issued token and makes it effective immediately. */
export const startSession = async (token: string): Promise<void> => {
  // In-memory first: it cannot fail, so requests made while the (slower)
  // keychain write is still in flight are already authenticated.
  setAuthToken(token);
  await writeAuthToken(token);
};

/**
 * Ends the session and wipes both stores. The in-memory token is cleared first
 * so no in-flight retry can slip out with the old credentials.
 */
export const endSession = async (): Promise<void> => {
  setAuthToken(null);
  mmkv.clearAll();
  await clearAllSecrets();
};
