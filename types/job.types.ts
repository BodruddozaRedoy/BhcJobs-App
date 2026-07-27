/**
 * Job shapes, verified against `GET /api/job/get` on the dev API.
 *
 * Only the fields the UI reads are declared. The real payload is much larger —
 * HTML blobs (`job_desc`, `job_requirement`, `recruitment_process`), skill and
 * benefit pivots, working-hours details — and typing all of it would be a
 * maintenance cost with no reader.
 */

export interface JobCompany {
  id: number;
  name: string;
  slug: string;
  /** Bare filename; resolve with `companyImageUrl`. */
  image: string | null;
}

export interface JobCountry {
  id: number;
  name: string;
}

/** How food is handled. `null` when the employer specified nothing. */
export type FoodOption = "allowance" | "provided";

export interface Job {
  id: number;
  job_title: string;
  slug: string;
  /** Flat copy of `company.name`, present even when `company` is not expanded. */
  company_name: string | null;
  company: JobCompany | null;
  country: JobCountry | null;
  /** `"overseas"` throughout the dev data; treated as free text, not an enum. */
  type: string | null;
  /** ISO 4217, e.g. `"SAR"`. */
  currency: string | null;
  /** `"monthly"` throughout the dev data. */
  salary_type: string | null;
  min_salary: number | null;
  /** Often `null` — roughly half the dev rows quote a single figure, not a range. */
  max_salary: number | null;
  food_option: FoodOption | null;
  /** Only set when `food_option` is `"allowance"`. */
  food_amount: number | null;
  /** Application deadline, `YYYY-MM-DD`. */
  expiry: string | null;
  industry_name: string | null;
}
