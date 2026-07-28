/**
 * The single error shape the UI is allowed to see.
 *
 * Raw `AxiosError`s are normalised into `ApiError` by the response interceptor in
 * `axios.ts`, so screens never branch on `error.response?.status` themselves —
 * they switch on `kind` and render `message` directly.
 */

export type ApiErrorKind =
  /** Request never reached the server — airplane mode, DNS failure, no signal. */
  | "network"
  /** Server accepted the request but did not answer within `API_TIMEOUT_MS`. */
  | "timeout"
  /** 4xx — the request itself was rejected (bad credentials, validation, 404). */
  | "client"
  /** 5xx — the backend failed while handling a valid request. */
  | "server"
  /** 2xx response whose body did not match the expected contract. */
  | "invalid_response"
  /** Anything we could not classify; treat as non-retryable. */
  | "unknown";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** HTTP status, when a response was actually received. */
  readonly status?: number;
  /** Field-level validation errors, keyed by field name (Laravel `errors` bag). */
  readonly fieldErrors?: Record<string, string[]>;
  /** Untouched response body, for logging and debugging only. */
  readonly raw?: unknown;

  constructor(args: {
    kind: ApiErrorKind;
    message: string;
    status?: number;
    fieldErrors?: Record<string, string[]>;
    raw?: unknown;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.kind = args.kind;
    this.status = args.status;
    this.fieldErrors = args.fieldErrors;
    this.raw = args.raw;
  }

  /** True when retrying the same request could plausibly succeed. */
  get isRetryable(): boolean {
    return this.kind === "network" || this.kind === "timeout" || this.kind === "server";
  }
}

/** Narrowing helper, since `catch` binds `unknown` under `strict`. */
export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

export interface ApiResponse<T> {
  status?: boolean;
  message?: string;
  data: T;
}
