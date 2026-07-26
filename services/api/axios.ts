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
 * Absolute URL for a request, so a log line can be pasted straight into curl or a
 * browser. `config.url` alone is only the path.
 *
 * `api.getUri` is used rather than string concatenation because it also appends
 * serialised query params — which is what makes the list endpoints
 * (`/api/job/get?page=2`) legible. It is wrapped defensively: a logging helper must
 * never be the reason a request fails.
 */
const fullUrl = (config?: InternalAxiosRequestConfig): string => {
  if (!config) return "?";

  try {
    return api.getUri(config);
  } catch {
    return `${config.baseURL ?? ""}${config.url ?? ""}`;
  }
};

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

    // → POST https://dev.bhcjobs.com/api/job_seeker/login { phone: '017…', password: '***' }
    logger.request(
      `→ ${config.method?.toUpperCase()} ${fullUrl(config)}`,
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

/**
 * Extracts per-field validation errors.
 *
 * This backend puts them under `error` (singular) rather than Laravel's usual
 * `errors`, e.g.
 *   { "status": false, "error": { "phone": ["The phone field is required."] } }
 * Both spellings are accepted so a backend fix later does not break the app.
 */
const extractFieldErrors = (body: unknown): Record<string, string[]> | undefined => {
  if (!body || typeof body !== "object") return undefined;

  const { error, errors } = body as { error?: unknown; errors?: unknown };
  const bag = [error, errors].find((value) => value && typeof value === "object");

  return bag as Record<string, string[]> | undefined;
};

api.interceptors.response.use(
  (response) => {
    const route = `${response.config.method?.toUpperCase()} ${fullUrl(response.config)}`;
    const duration = elapsedMs(response.config as TimedRequest);
    const body: unknown = response.data;

    // This API signals failure with HTTP 200 and `status: false` in the body —
    // a rejected login, a validation error and a success all arrive as 2xx. So
    // the envelope is inspected here and turned into the same ApiError that a
    // real HTTP error produces; without this, a wrong password would flow
    // through to the caller looking like a successful login.
    if (body && typeof body === "object" && (body as { status?: unknown }).status === false) {
      const fieldErrors = extractFieldErrors(body);
      const message = extractMessage(
        body,
        fieldErrors ? "Please check the highlighted fields." : "That request could not be completed.",
      );

      logger.error(`← ✗ ${response.status} ${route} (${duration}) [client] ${message}`, body);

      return Promise.reject(
        new ApiError({
          kind: "client",
          message,
          status: response.status,
          fieldErrors,
          raw: body,
        }),
      );
    }

    // ← 200 GET https://dev.bhcjobs.com/api/job/get (312ms)
    logger.success(`← ${response.status} ${route} (${duration})`);

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
    const route = `${config?.method?.toUpperCase() ?? "?"} ${fullUrl(config)}`;
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

    // ← ✗ 422 POST https://dev.bhcjobs.com/api/job_seeker/register (188ms) [client] Please check…
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
