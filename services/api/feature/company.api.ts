import type { Company } from "@/types/company.types";

import { getData, type RequestOptions } from "../client";
import { ENDPOINTS } from "../endpoints";

/**
 * Company list for the "Popular Companies" section.
 *
 * Unpaginated like the other list endpoints — five rows on the dev API — so any
 * limiting belongs in the UI.
 */
export const getCompanies = (options?: RequestOptions): Promise<Company[]> =>
  getData<Company[]>(ENDPOINTS.COMPANIES, options);
