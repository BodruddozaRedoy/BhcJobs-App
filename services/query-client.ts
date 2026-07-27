import { QueryClient } from "@tanstack/react-query";

import { isApiError } from "./api/types";

/**
 * How long a fetched list is served straight from cache.
 *
 * Five minutes: industries, jobs and companies change on a human timescale, so
 * re-requesting them every time a screen mounts is pure latency. Anything staler
 * than this revalidates in the background while the cached copy stays on screen.
 */
const STALE_TIME_MS = 5 * 60 * 1000;

/** How long an unused list is kept before it is dropped from memory. */
const GC_TIME_MS = 30 * 60 * 1000;

/** Attempts after the first. Two is enough to ride out a flaky connection. */
const MAX_RETRIES = 2;

/**
 * The app's single query cache.
 *
 * In memory only — nothing is written to disk, so a cold start still fetches. The
 * win is within a session: remounting the home screen, or navigating back to it,
 * paints from cache instead of showing skeletons again, and two screens asking for
 * the same list share one request.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
      /**
       * Only retry what could plausibly succeed on a second attempt. The default
       * retries everything three times, which turns a 404 or a validation failure
       * into three round trips and a several-second wait before the user is told
       * anything.
       */
      retry: (failureCount, error) => {
        if (failureCount >= MAX_RETRIES) return false;
        return isApiError(error) ? error.isRetryable : true;
      },
      // There is no window to focus in React Native, and the home screen offers an
      // explicit pull-to-refresh — silently refetching on every app resume would be
      // invisible work the user did not ask for.
      refetchOnWindowFocus: false,
    },
    mutations: {
      // A failed sign-in or registration must not be replayed automatically: the
      // user is waiting on the result, and a retried register could double-submit.
      retry: false,
    },
  },
});
