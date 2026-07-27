import { useAsyncList, type AsyncList } from "@/hooks/use-async-list";
import { getJobs } from "@/services/api/job.api";
import type { Job } from "@/types/job.types";

/** Loads the job list for the "Recommended Jobs" section. */
export const useJobs = (): AsyncList<Job> => useAsyncList(getJobs, "jobs");
