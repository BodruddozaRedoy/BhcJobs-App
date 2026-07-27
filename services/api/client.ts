import type { AxiosRequestConfig } from "axios";
import { api } from "./axios";
import { ApiError, type ApiResponse } from "./types";

/** Options a screen may need to pass through: query params and cancellation. */
export type RequestOptions = Pick<AxiosRequestConfig, "params" | "signal" | "headers">;

export const get = async <T>(url: string, options?: RequestOptions): Promise<T> => {
  const { data } = await api.get<T>(url, options);
  return data;
};

export const post = async <T>(
  url: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> => {
  const { data } = await api.post<T>(url, body, options);
  return data;
};

export const put = async <T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> => {
  const { data } = await api.put<T>(url, body, options);
  return data;
};

export const del = async <T>(url: string, options?: RequestOptions): Promise<T> => {
  const { data } = await api.delete<T>(url, options);
  return data;
};

/**
 * Unwraps the `{ success, message, data }` envelope the backend uses for list
 * endpoints, and fails loudly when the body does not match — a 200 with a
 * missing `data` key is a contract break, not an empty result, and silently
 * returning `undefined` would surface as a confusing render crash later.
 */
export const getData = async <T>(url: string, options?: RequestOptions): Promise<T> => {
  const body = await get<ApiResponse<T>>(url, options);

  if (!body || typeof body !== "object" || !("data" in body)) {
    throw new ApiError({
      kind: "invalid_response",
      message: "The server returned an unexpected response.",
      raw: body,
    });
  }

  return body.data;
};
