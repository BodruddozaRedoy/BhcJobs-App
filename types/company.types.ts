/**
 * Company shapes, verified against `GET /api/company/get` on the dev API.
 *
 * Note this is the flat list row, not the nested `company` object embedded in a job
 * (`JobCompany` in `job.types.ts`). The list row carries `jobs_count`; the embedded
 * one carries `desc` and its own relations instead.
 */

export interface Company {
  id: number;
  name: string;
  slug: string;
  /** `1` / `0`, not a boolean. The endpoint already filters to active rows. */
  is_active: number;
  /**
   * Bare filename, e.g. `7442_1755680977.webp` — not a URL. Resolve it with
   * `companyImageUrl`. Every dev row has one, but it is typed nullable because
   * nothing in the contract guarantees that.
   */
  image: string | null;
  /** Open vacancies at this company. */
  jobs_count: number;
}
