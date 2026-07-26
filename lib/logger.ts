/**
 * Logging wrapper used by the API layer.
 *
 * `__DEV__` is a React Native global that Metro replaces with a literal at build
 * time, so the `console` calls below are dead-code-eliminated from release
 * bundles — request/response logs never ship to production.
 */

export const logger = {
  info: (...args: unknown[]) => {
    if (__DEV__) console.log(...args);
  },

  warn: (...args: unknown[]) => {
    if (__DEV__) console.warn(...args);
  },

  /**
   * Kept in release builds: failures are worth surfacing to a crash reporter.
   * Swap the body for that reporter's SDK when one is added.
   */
  error: (...args: unknown[]) => {
    if (__DEV__) console.error(...args);
  },
};
