export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://dev.bhcjobs.com";

export const STORAGE_URL = process.env.EXPO_PUBLIC_STORAGE_URL ?? "https://dev.bhcjobs.com/storage";

/** Abort a request that has not responded within this window. */
export const API_TIMEOUT_MS = 15_000;

export const SAR_TO_BDT = Number(process.env.EXPO_PUBLIC_SAR_TO_BDT ?? 33);

export const TERMS_URL = `${API_BASE_URL}/terms`;
export const PRIVACY_URL = `${API_BASE_URL}/privacy-policy`;
