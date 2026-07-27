import { useAsyncList, type AsyncList } from "@/hooks/use-async-list";
import { getJobs } from "@/services/api/job.api";
import { queryKeys } from "@/services/api/query-keys";
import type { Job } from "@/types/job.types";

/** Loads the job list for the "Recommended Jobs" section. */
export const useJobs = (): AsyncList<Job> => useAsyncList(queryKeys.jobs, getJobs, "jobs");
