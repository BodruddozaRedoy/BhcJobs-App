import { STORAGE_URL } from "@/constants/config";

/**
 * Resolves a bare filename from the API into a full image URL.
 *
 * List endpoints return only the filename (`2362_1754539698.webp`); the folder is
 * implied by the record's type. The backend's convention is
 * `{STORAGE_URL}/{entity}-image/{filename}` — probed against the dev API, where
 * `/storage/industry-image/…` and `/storage/company-image/…` both serve
 * `image/webp` while the bare `/storage/…` path 404s.
 *
 * Returns `undefined` for a missing filename so a caller can fall back to a
 * placeholder, rather than building a URL that is guaranteed to 404.
 */
export const storageImageUrl = (
  entity: "industry" | "company",
  filename: string | null | undefined,
): string | undefined =>
  filename ? `${STORAGE_URL}/${entity}-image/${encodeURIComponent(filename)}` : undefined;

export const industryImageUrl = (filename: string | null | undefined): string | undefined =>
  storageImageUrl("industry", filename);
