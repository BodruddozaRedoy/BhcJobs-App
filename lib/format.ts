/**
 * Display formatting shared across screens.
 *
 * Deliberately free of `Intl` and of `toLocaleString`: Hermes ships Intl on some
 * platforms and stubs it on others, so the same number can render with separators
 * on iOS and without on Android. These do it by hand and are identical everywhere.
 */

/** `29700` → `"29,700"`. Negatives and decimals are not expected here. */
export const thousands = (value: number): string =>
  Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** `("SAR", 1700)` → `"SAR 1,700"`. */
export const money = (currency: string, amount: number): string =>
  `${currency} ${thousands(amount)}`;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/**
 * `"2026-08-02"` → `"2 August, 2026"`.
 *
 * Split from the string rather than parsed with `new Date`, which would read the
 * value as UTC midnight and then render it in the device's timezone — shifting the
 * date by a day for anyone west of Greenwich. Returns `null` for a value that is not
 * a plain ISO date, so a caller can omit the line instead of printing `NaN`.
 */
export const isoDateToLong = (value: string | null | undefined): string | null => {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const name = MONTHS[Number(month) - 1];
  if (!name) return null;

  return `${Number(day)} ${name}, ${year}`;
};
