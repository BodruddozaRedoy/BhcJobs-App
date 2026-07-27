import { useAsyncList, type AsyncList } from "@/hooks/use-async-list";
import { getIndustries } from "@/services/api/industry.api";
import type { Industry } from "@/types/industry.types";

/** Loads the industry list for the "Popular Industries" section. */
export const useIndustries = (): AsyncList<Industry> =>
  useAsyncList(getIndustries, "industries");
