/**
 * Industry shapes, verified against `GET /api/industry/get` on the dev API rather
 * than assumed.
 */

export interface Industry {
  id: number;
  name: string;
  /**
   * Display order chosen in the admin panel, ascending. Not unique — the dev data
   * has two industries at `5` — so it cannot be used as a key or a sort tiebreak
   * on its own.
   */
  priority: number;
  /** `1` / `0`, not a boolean. The endpoint already filters to active rows. */
  is_active: number;
  /**
   * Bare filename, e.g. `2362_1754539698.webp` — not a URL. Resolve it with
   * `industryImageUrl` before handing it to an `<Image>`.
   */
  image: string;
  /** Open vacancies. Legitimately `0` for many industries, which is not an error. */
  jobs_count: number;
}
