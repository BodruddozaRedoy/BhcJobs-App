/**
 * Logging wrapper used by the API layer.
 *
 * Everything goes through `console.log`, deliberately. `console.warn` and
 * `console.error` are intercepted by React Native's LogBox and raise a yellow or
 * full-screen red overlay on the device — unacceptable for routine, handled events
 * like a rejected login or a dropped connection. Severity is conveyed by colour
 * instead.
 *
 * There is no `warn` level: an API call either goes out, comes back, or fails, so
 * three levels cover it. Anything tempted to warn is really an error worth seeing
 * or noise worth deleting.
 *
 * Colours are ANSI escapes, which is what the Metro terminal renders. In a console
 * that does not interpret them (a browser devtools panel, say) they appear as short
 * escape sequences around the label rather than as colour.
 *
 * `__DEV__` is replaced with a literal by Metro at build time, so every call below
 * is dead-code-eliminated from release bundles — no logs ship to production.
 */

const RESET = "\x1b[0m";

/** Level label, pre-wrapped in its colour. */
const LABEL = {
  request: `\x1b[36m[REQUEST]${RESET}`, // cyan
  success: `\x1b[32m[SUCCESS]${RESET}`, // green
  error: `\x1b[31m[ERROR]${RESET}`, // red
} as const;

export const logger = {
  /** An outgoing API call. */
  request: (...args: unknown[]) => {
    if (__DEV__) console.log(LABEL.request, ...args);
  },

  /** A response that came back intact. */
  success: (...args: unknown[]) => {
    if (__DEV__) console.log(LABEL.success, ...args);
  },

  /** Anything that failed: rejected requests, unreadable storage, broken contracts. */
  error: (...args: unknown[]) => {
    if (__DEV__) console.log(LABEL.error, ...args);
  },
};
