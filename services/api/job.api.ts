import type { Job } from "@/types/job.types";

import { getData, type RequestOptions } from "./client";
import { ENDPOINTS } from "./endpoints";

/**
 * Job list for the "Recommended Jobs" section.
 *
 * Like the industry endpoint, this takes no pagination parameters and returns
 * everything (fourteen rows on the dev API), so any limiting belongs in the UI.
 *
 * Note the response includes expired postings — the dev data has several `expiry`
 * dates in the past. The backend does not filter them, so anything that depends on
 * a live deadline has to check it client-side.
 */
export const getJobs = (options?: RequestOptions): Promise<Job[]> =>
  getData<Job[]>(ENDPOINTS.JOBS, options);
