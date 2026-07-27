import { useCallback, useEffect, useState } from "react";

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
  retry: () => void;
}

/**
 * Loads a list endpoint once, with retry.
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

  const retry = useCallback(() => {
    // Both in an event handler, so neither is a render-phase update.
    setState({ status: "loading" });
    setAttempt((previous) => previous + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const items = await fetcher({ signal: controller.signal });

        // Unmounted mid-flight: the abort rejects the request, but a response that
        // already resolved can still land in the same tick.
        if (controller.signal.aborted) return;

        setState(items.length > 0 ? { status: "ready", items } : { status: "empty" });
      } catch (error) {
        // A cancelled request is not a failure — the component is simply gone.
        if (controller.signal.aborted) return;

        logger.error(`[${label}] load failed:`, error);

        setState({
          status: "error",
          message: isApiError(error) ? error.message : `Could not load ${label}.`,
          // Retrying a 4xx would fail identically; only transient kinds are worth
          // offering a button for.
          canRetry: isApiError(error) ? error.isRetryable : true,
        });
      }
    };

    void load();

    return () => controller.abort();
  }, [attempt, fetcher, label]);

  return { state, retry };
}
