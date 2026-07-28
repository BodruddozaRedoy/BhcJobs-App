import type { Industry } from "@/types/industry.types";

import { getData, type RequestOptions } from "../client";
import { ENDPOINTS } from "../endpoints";

/**
 * Every active industry, for the "Popular Industries" section.
 *
 * The endpoint takes no pagination or limit parameters — it returns the whole list
 * (ten rows on the dev API), so any "show first N" behaviour belongs in the UI.
 *
 * `getData` unwraps the `{ status, message, data }` envelope and throws `ApiError`
 * on a body that does not match, so this resolves to a real array or not at all.
 */
export const getIndustries = (options?: RequestOptions): Promise<Industry[]> =>
  getData<Industry[]>(ENDPOINTS.INDUSTRIES, options);
