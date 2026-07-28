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

/**
 * Header names whose values are masked, compared lowercased.
 *
 * Request *bodies* are logged verbatim, passwords and OTPs included — every call
 * here goes through `logger`, which is a no-op outside `__DEV__`, so none of it can
 * reach a release build. Worth knowing anyway: a dev-mode screen recording or a
 * pasted Metro log will contain real credentials.
 */
const REDACTED_HEADERS = ["authorization", "cookie", "set-cookie", "x-api-key"];

/* -------------------------------------------------------------------------- */
/* Log formatting                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Width of the label column. Sized to the longest label (`Duration:`) so every
 * value in a block starts at the same offset and the whole thing scans vertically.
 */
const LABEL_WIDTH = 9;

/** A labelled line in a log block. */
type LogRow = readonly [label: string, value: unknown];

/**
 * Turns a headline and label/value pairs into console arguments:
 *
 *   → POST /api/job_seeker/login
 *     Url:      https://dev.bhcjobs.com/api/job_seeker/login
 *     Method:   POST
 *     Payload:  { phone: '01758383860', password: 'hunter2' }
 *
 * Objects are passed through as their own argument rather than being serialised, so
 * the console renders them as inspectable objects — collapsible in a debugger, and
 * depth-limited in the Metro terminal instead of pages of indented JSON. Scalars are
 * folded into the surrounding string so their labels stay in one aligned column.
 *
 * Rows whose value is `undefined` or empty are dropped, so a GET prints no empty
 * `Payload:` line.
 */
const logRows = (headline: string, rows: readonly LogRow[]): unknown[] => {
  const parts: unknown[] = [];
  let text = headline;

  for (const [label, value] of rows) {
    if (value === undefined || value === null || value === "") continue;

    const column = `${label}:`.padEnd(LABEL_WIDTH);

    if (typeof value === "object") {
      // Flush the text accumulated so far, ending on this row's label, then hand the
      // object over untouched. Flushing here is what keeps rows in their given order.
      parts.push(`${text}\n  ${column}`);
      parts.push(value);
      text = "";
    } else {
      text += `\n  ${column} ${String(value)}`;
    }
  }

  if (text !== "") parts.push(text);

  return parts;
};

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
 * A request body in a form the console can render as an object.
 *
 * By the time the *response* interceptor sees `config.data`, axios has already
 * serialised it to a JSON string — logging that as-is gives one long escaped line
 * instead of an inspectable object, so it is parsed back. A body that is not JSON
 * (form-encoded, plain text) is returned untouched.
 */
const readableBody = (body: unknown): unknown => {
  if (typeof body !== "string") return body;

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
};

/**
 * Request/response headers as a plain object, with credentials masked.
 *
 * `AxiosHeaders` is a class instance, so it has to be flattened via `toJSON` before
 * `JSON.stringify` produces anything readable.
 */
const redactHeaders = (headers: unknown): Record<string, unknown> | undefined => {
  if (!headers || typeof headers !== "object") return undefined;

  const source =
    typeof (headers as AxiosHeaders).toJSON === "function"
      ? (headers as AxiosHeaders).toJSON()
      : (headers as Record<string, unknown>);

  const entries = Object.entries(source).map(([key, value]) => [
    key,
    REDACTED_HEADERS.includes(key.toLowerCase()) ? "***" : value,
  ]);

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
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

    // → POST /api/job_seeker/login
    //   Url:      https://dev.bhcjobs.com/api/job_seeker/login
    //   Method:   POST
    //   Header:   { Accept: 'application/json', Authorization: '***' }
    //   Payload:  { phone: '01758383860', password: 'hunter2' }
    logger.request(
      ...logRows(`→ ${config.method?.toUpperCase()} ${config.url}`, [
        ["Url", fullUrl(config)],
        ["Method", config.method?.toUpperCase()],
        ["Header", redactHeaders(config.headers)],
        ["Payload", config.data ? readableBody(config.data) : undefined],
      ]),
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
    // Path only in the headline; the absolute URL is a row in the block below, so
    // repeating it here would just make every line wrap.
    const route = `${response.config.method?.toUpperCase()} ${response.config.url}`;
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
        fieldErrors
          ? "Please check the highlighted fields."
          : "That request could not be completed.",
      );

      logger.error(
        ...logRows(`← ✗ ${response.status} ${route} (${duration})`, [
          ["Url", fullUrl(response.config)],
          ["Method", response.config.method?.toUpperCase()],
          ["Status", `${response.status} (envelope status: false)`],
          ["Duration", duration],
          ["Kind", "client"],
          ["Message", message],
          ["Errors", fieldErrors],
          ["Body", body],
        ]),
      );

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

    
    logger.success(
      ...logRows(`← ${response.status} ${route} (${duration})`, [
        ["Url", fullUrl(response.config)],
        ["Method", response.config.method?.toUpperCase()],
        ["Status", response.status],
        ["Duration", duration],
        // The whole body, handed over as an object so the console renders it
        // inspectable. List endpoints return every row, so this is verbose by
        // design — the console's own depth limit is what keeps it readable.
        ["Body", body],
      ]),
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

    logger.error(
      ...logRows(
        `← ✗ ${status ?? axiosError.code ?? "no response"} ${route} (${elapsedMs(config)})`,
        [
          ["Url", fullUrl(config)],
          ["Method", config?.method?.toUpperCase()],
          ["Status", status ?? axiosError.code ?? "no response"],
          ["Duration", elapsedMs(config)],
          ["Kind", kind],
          ["Message", message],
          ["Payload", config?.data ? readableBody(config.data) : undefined],
          ["Errors", extractFieldErrors(body)],
          ["Body", body],
        ],
      ),
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
