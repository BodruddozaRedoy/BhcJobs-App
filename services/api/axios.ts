import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL, API_TIMEOUT_MS } from "@/constants/config";
import { logger } from "@/lib/logger";

import { ApiError, type ApiErrorKind } from "./types";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null): void => {
  authToken = token;
};

export const getAuthToken = (): string | null => authToken;

/* -------------------------------------------------------------------------- */
/* Request logging                                                            */
/* -------------------------------------------------------------------------- */

/** Per-request scratch space, used to measure round-trip duration. */
interface TimedRequest extends InternalAxiosRequestConfig {
  metadata?: { startedAt: number };
}

/** Keys whose values must never reach the log output. */
const REDACTED_KEYS = ["password", "password_confirmation", "token", "otp"];

/**
 * Replaces sensitive values with `***` so credentials never appear in logs.
 * Only the top level is walked — request bodies here are flat form payloads.
 */
const redact = (body: unknown): unknown => {
  if (!body || typeof body !== "object") return body;

  return Object.fromEntries(
    Object.entries(body as Record<string, unknown>).map(([key, value]) => [
      key,
      REDACTED_KEYS.includes(key) ? "***" : value,
    ]),
  );
};

api.interceptors.request.use(
  (config: TimedRequest) => {
    // Stamp the start time; the response interceptor reads it back to report
    // how long the round trip took.
    config.metadata = { startedAt: Date.now() };

    if (authToken) {
      // AxiosHeaders (not a plain object) so axios does not drop the header when
      // it normalises the config.
      config.headers = AxiosHeaders.from(config.headers);
      config.headers.set("Authorization", `Bearer ${authToken}`);
    }

    // → POST /api/job_seeker/login { phone: '017...', password: '***' }
    logger.info(
      `→ ${config.method?.toUpperCase()} ${config.url}`,
      config.data ? redact(config.data) : "",
    );

    return config;
  },
  // Thrown before the request leaves the device (bad config, interceptor bug).
  (error: unknown) => {
    logger.error("→ ✗ request could not be sent", error);
    return Promise.reject(
      new ApiError({
        kind: "unknown",
        message: "Could not send the request. Please try again.",
        raw: error,
      }),
    );
  },
);

/* -------------------------------------------------------------------------- */
/* Response logging + error normalisation                                     */
/* -------------------------------------------------------------------------- */

const elapsedMs = (config?: TimedRequest): string => {
  const startedAt = config?.metadata?.startedAt;
  return startedAt ? `${Date.now() - startedAt}ms` : "?ms";
};

/**
 * Pulls the most useful message out of a backend error body, preferring the
 * server's own wording over a generic fallback so users see real feedback
 * ("These credentials do not match our records") instead of "Request failed".
 */
const extractMessage = (body: unknown, fallback: string): string => {
  if (!body || typeof body !== "object") return fallback;

  const { message, error } = body as { message?: unknown; error?: unknown };
  if (typeof message === "string" && message.trim()) return message;
  if (typeof error === "string" && error.trim()) return error;

  return fallback;
};

/** Laravel returns `{ errors: { phone: ['...'] } }` on validation failure. */
const extractFieldErrors = (body: unknown): Record<string, string[]> | undefined => {
  if (!body || typeof body !== "object") return undefined;

  const { errors } = body as { errors?: unknown };
  if (!errors || typeof errors !== "object") return undefined;

  return errors as Record<string, string[]>;
};

api.interceptors.response.use(
  (response) => {
    // ← 200 GET /api/job/get (312ms)
    logger.info(
      `← ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}` +
        ` (${elapsedMs(response.config as TimedRequest)})`,
    );

    return response;
  },
  (error: unknown) => {
    // Already normalised upstream (e.g. by the request interceptor) — pass through.
    if (error instanceof ApiError) return Promise.reject(error);

    if (!axios.isAxiosError(error)) {
      logger.error("← ✗ non-axios failure", error);
      return Promise.reject(
        new ApiError({
          kind: "unknown",
          message: "Something went wrong. Please try again.",
          raw: error,
        }),
      );
    }

    const axiosError = error as AxiosError;
    const config = axiosError.config as TimedRequest | undefined;
    const route = `${config?.method?.toUpperCase() ?? "?"} ${config?.url ?? "?"}`;
    const status = axiosError.response?.status;
    const body = axiosError.response?.data;

    let kind: ApiErrorKind;
    let message: string;

    if (axiosError.code === "ECONNABORTED" || axiosError.code === "ETIMEDOUT") {
      kind = "timeout";
      message = "The server took too long to respond. Please try again.";
    } else if (!axiosError.response) {
      // No response at all — the request never made it to the server.
      kind = "network";
      message = "No internet connection. Check your network and try again.";
    } else if (status === 401 || status === 403) {
      kind = "client";
      message = extractMessage(body, "Your session has expired. Please log in again.");
    } else if (status === 422) {
      kind = "client";
      message = extractMessage(body, "Please check the highlighted fields.");
    } else if (status && status >= 400 && status < 500) {
      kind = "client";
      message = extractMessage(body, "That request could not be completed.");
    } else if (status && status >= 500) {
      kind = "server";
      message = extractMessage(body, "The server is having trouble. Please try again shortly.");
    } else {
      kind = "unknown";
      message = extractMessage(body, "Something went wrong. Please try again.");
    }

    // ← ✗ 422 POST /api/job_seeker/register (188ms) [client] Please check…
    logger.error(
      `← ✗ ${status ?? axiosError.code ?? "no response"} ${route}` +
        ` (${elapsedMs(config)}) [${kind}] ${message}`,
      body ?? "",
    );

    return Promise.reject(
      new ApiError({
        kind,
        message,
        status,
        fieldErrors: extractFieldErrors(body),
        raw: body,
      }),
    );
  },
);
