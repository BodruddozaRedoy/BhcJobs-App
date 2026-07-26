/**
 * Public surface of the API layer. Import from `@/services/api` rather than
 * reaching into individual files, so the internals stay free to move.
 */

export { api, getAuthToken, setAuthToken } from "./axios";
export { del, get, getData, post, put, type RequestOptions } from "./client";
export { ENDPOINTS, type Endpoint } from "./endpoints";
export { ApiError, isApiError, type ApiErrorKind, type ApiResponse } from "./types";
