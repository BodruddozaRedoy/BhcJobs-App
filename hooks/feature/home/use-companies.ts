import { useAsyncList, type AsyncList } from "@/hooks/use-async-list";
import { getCompanies } from "@/services/api/company.api";
import type { Company } from "@/types/company.types";

/** Loads the company list for the "Popular Companies" section. */
export const useCompanies = (): AsyncList<Company> => useAsyncList(getCompanies, "companies");
