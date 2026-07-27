import { useCallback, useEffect, useRef, useState } from "react";

import { logger } from "@/lib/logger";
import type { RequestOptions } from "@/services/api/client";
import { isApiError } from "@/services/api/types";

/**
 * One field, four states — so a render cannot express "loading and errored" or
 * "ready but empty", which separate `loading` / `error` / `data` booleans allow and
 * every consumer then has to guard against.
 */
export type AsyncListState<T> =
  | { status: "loading" }
  | { status: "ready"; items: T[] }
  | { status: "empty" }
  | { status: "error"; message: string; canRetry: boolean };

export interface AsyncList<T> {
  state: AsyncListState<T>;
  /**
   * Re-runs the request from scratch, blanking the list back to `loading`.
   *
   * For the "Try again" button on a failed section, where there is nothing on
   * screen to preserve.
   */
  retry: () => void;
  /**
   * Re-runs the request in the background, leaving the current items on screen.
   *
   * For pull-to-refresh. Resolves when the request settles, so the caller can keep
   * the spinner up for exactly as long as the work takes. A failure here does *not*
   * clear a list that is already loaded — see below.
   */
  refresh: () => Promise<void>;
}

/**
 * Loads a list endpoint once, with retry and refresh.
 *
 * The home screen has three of these sections and they all need the same four
 * states, so the machinery lives here and each feature hook is a one-line wrapper
 * naming its endpoint.
 *
 * `fetcher` must be stable across renders — pass a module-level function, not an
 * inline arrow, or every render refetches.
 *
 * State starts at `loading` rather than being set to it inside the effect: an effect
 * that calls `setState` synchronously causes a second render pass before paint,
 * which the lint rules flag and which the right initial value avoids.
 */
export function useAsyncList<T>(
  fetcher: (options: RequestOptions) => Promise<T[]>,
  /** Used in log lines and the fallback error message, e.g. `"jobs"`. */
  label: string,
): AsyncList<T> {
  const [state, setState] = useState<AsyncListState<T>>({ status: "loading" });
  // Bumping this re-runs the effect. Cheaper than lifting the fetch into a
  // callback and keeping two code paths in sync.
  const [attempt, setAttempt] = useState(0);

  /**
   * The in-flight refresh, so it can be cancelled if the hook unmounts or a second
   * pull starts before the first has answered. The effect's own request is handled
   * by its cleanup and is not tracked here.
   */
  const refreshRequest = useRef<AbortController | null>(null);

  /**
   * Runs the request and folds the outcome into state.
   *
   * `preserveItemsOnError` is what separates a refresh from a first load: dropping a
   * list the user is already reading because a background refresh timed out is worse
   * than showing them slightly stale rows, so a refresh keeps whatever is on screen
   * and a first load surfaces the error.
   */
  const load = useCallback(
    async (signal: AbortSignal, preserveItemsOnError = false) => {
      try {
        const items = await fetcher({ signal });

        // Unmounted or superseded mid-flight: the abort rejects the request, but a
        // response that already resolved can still land in the same tick.
        if (signal.aborted) return;

        setState(items.length > 0 ? { status: "ready", items } : { status: "empty" });
      } catch (error) {
        // A cancelled request is not a failure — the component is simply gone, or a
        // newer request has taken over.
        if (signal.aborted) return;

        logger.error(`[${label}] load failed:`, error);

        setState((current) => {
          if (preserveItemsOnError && current.status === "ready") return current;

          return {
            status: "error",
            message: isApiError(error) ? error.message : `Could not load ${label}.`,
            // Retrying a 4xx would fail identically; only transient kinds are worth
            // offering a button for.
            canRetry: isApiError(error) ? error.isRetryable : true,
          };
        });
      }
    },
    [fetcher, label],
  );

  useEffect(() => {
    const controller = new AbortController();

    void load(controller.signal);

    return () => controller.abort();
  }, [attempt, load]);

  // Cancels a refresh that is still running when the hook goes away. Separate from
  // the effect above, which must not re-run when `attempt` changes.
  useEffect(() => () => refreshRequest.current?.abort(), []);

  const retry = useCallback(() => {
    // Both in an event handler, so neither is a render-phase update.
    setState({ status: "loading" });
    setAttempt((previous) => previous + 1);
  }, []);

  const refresh = useCallback(async () => {
    // A second pull while the first is still running would otherwise leave two
    // responses racing to set state, and the slower one could win.
    refreshRequest.current?.abort();

    const controller = new AbortController();
    refreshRequest.current = controller;

    await load(controller.signal, true);
  }, [load]);

  return { state, retry, refresh };
}
