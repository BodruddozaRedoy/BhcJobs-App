import { logger } from "@/lib/logger";
import type { LoginPayload, LoginResponse, Session } from "@/types/auth.types";

import { post } from "./client";
import { ENDPOINTS } from "./endpoints";
import { ApiError } from "./types";

/**
 * Digs the bearer token out of a login response.
 *
 * The key is checked against several common shapes because the success payload
 * could not be observed against the dev API (see `LoginResponse`). Finding
 * nothing is a hard failure, not a silent `undefined`: storing an empty token
 * would leave the user "logged in" with every subsequent request rejected.
 */
const resolveToken = (body: LoginResponse): string => {
  const token =
    body.token ?? body.access_token ?? body.data?.token ?? body.data?.access_token;

  if (typeof token === "string" && token.length > 0) return token;

  logger.error("[auth] no token found in login response; keys were:", Object.keys(body ?? {}));

  throw new ApiError({
    kind: "invalid_response",
    message: "Signed in, but the server did not return a session. Please try again.",
    raw: body,
  });
};

/**
 * Exchanges phone + password for a session.
 *
 * Note this resolves only on real success. The response interceptor rejects
 * `{ status: false }` bodies even though they arrive as HTTP 200, so a wrong
 * password surfaces here as a thrown `ApiError`, never as a returned value.
 */
export const login = async (payload: LoginPayload): Promise<Session> => {
  const body = await post<LoginResponse>(ENDPOINTS.LOGIN, payload);

  return {
    token: resolveToken(body),
    user: body.user ?? body.data?.user,
  };
};
