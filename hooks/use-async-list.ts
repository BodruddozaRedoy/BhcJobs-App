import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useCallback } from "react";

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
   * Re-runs the request from scratch. For the "Try again" button on a failed
   * section, where there is nothing on screen to preserve.
   */
  retry: () => void;
  /**
   * Re-runs the request in the background, leaving the current items on screen.
   *
   * For pull-to-refresh. Resolves when the request settles, so the caller can keep
   * the spinner up for exactly as long as the work takes.
   */
  refresh: () => Promise<void>;
}

/**
 * Loads a cached list endpoint, and folds React Query's flags into one state field.
 *
 * A thin adapter rather than a fetching implementation: `useQuery` owns the caching,
 * deduplication, retry policy and cancellation, and this maps its several booleans
 * onto the discriminated union the sections render from. Keeping that union is what
 * lets a section stay a four-line `switch` instead of re-deriving "is this really
 * empty, or just not loaded yet?" at three call sites.
 *
 * `fetcher` should be a module-level function; it is called with the query's own
 * `AbortSignal`, so an unmounted or superseded request is cancelled for free.
 */
export function useAsyncList<T>(
  queryKey: QueryKey,
  fetcher: (options: RequestOptions) => Promise<T[]>,
  /** Used in the fallback error message, e.g. `"jobs"`. */
  label: string,
): AsyncList<T> {
  const { data, error, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: ({ signal }) => fetcher({ signal }),
  });

  /*
   * Order matters. `data` is checked first so a *failed refresh* keeps showing the
   * rows the user is already reading — React Query holds the last successful data
   * alongside the error, and throwing away a readable list because a background
   * refresh timed out is worse than showing something slightly stale. Only a failure
   * with nothing cached behind it reaches the error branch.
   *
   * `isFetching` before `error` covers the retry: after a failed first load the
   * error sticks around while the refetch runs, and the user should see the skeleton
   * come back rather than the error they just dismissed.
   */
  let state: AsyncListState<T>;

  if (data !== undefined) {
    state = data.length > 0 ? { status: "ready", items: data } : { status: "empty" };
  } else if (isFetching) {
    state = { status: "loading" };
  } else if (error) {
    state = {
      status: "error",
      message: isApiError(error) ? error.message : `Could not load ${label}.`,
      // Retrying a 4xx would fail identically; only transient kinds are worth
      // offering a button for.
      canRetry: isApiError(error) ? error.isRetryable : true,
    };
  } else {
    state = { status: "loading" };
  }

  const retry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return { state, retry, refresh };
}
