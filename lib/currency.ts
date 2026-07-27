import { SAR_TO_BDT } from "@/constants/config";

import { thousands } from "./format";

/** Converts a SAR figure at the pinned rate. See `SAR_TO_BDT`. */
export const toBdt = (sar: number): number => sar * SAR_TO_BDT;

/**
 * `250` → `"BDT 8,250 approx."`.
 *
 * "approx." is baked in rather than left to each call site, because the rate is
 * pinned in config and will drift — nothing derived from it may be presented as
 * exact. For a range, use `approxBdtRange`, which qualifies the pair once instead
 * of tacking "approx." onto both ends.
 */
export const approxBdt = (sar: number): string => `BDT ${thousands(toBdt(sar))} approx.`;

/** `(1700, 2000)` → `"BDT 56,100 – 66,000 approx."`. */
export const approxBdtRange = (minSar: number, maxSar: number): string =>
  `BDT ${thousands(toBdt(minSar))} – ${thousands(toBdt(maxSar))} approx.`;
