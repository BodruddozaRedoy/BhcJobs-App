import { useCallback, useEffect, useState } from "react";

import { logger } from "@/lib/logger";
import { getIndustries } from "@/services/api/industry.api";
import { isApiError } from "@/services/api/types";
import type { Industry } from "@/types/industry.types";

/**
 * One field, four states — so a render cannot express "loading and errored" or
 * "ready with no data", which separate `loading` / `error` / `data` booleans allow
 * and every consumer then has to guard against.
 */
export type IndustriesState =
  | { status: "loading" }
  | { status: "ready"; industries: Industry[] }
  | { status: "empty" }
  | { status: "error"; message: string; canRetry: boolean };

/** Shown when the failure carries no message worth putting in front of a user. */
const FALLBACK_MESSAGE = "Could not load industries.";

/**
 * Loads the industry list.
 *
 * State starts at `loading` rather than being set to it inside the effect: an
 * effect that calls `setState` synchronously causes a second render pass before
 * paint, which the lint rules flag and which is avoidable by picking the right
 * initial value.
 */
export function useIndustries() {
  const [state, setState] = useState<IndustriesState>({ status: "loading" });
  // Bumping this re-runs the effect. Cheaper than duplicating the fetch into a
  // callback and keeping the two in sync.
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
        const industries = await getIndustries({ signal: controller.signal });

        // Unmounted mid-flight: the abort rejects the request, but a resolved
        // response can still land in the same tick.
        if (controller.signal.aborted) return;

        setState(
          industries.length > 0 ? { status: "ready", industries } : { status: "empty" },
        );
      } catch (error) {
        // A cancelled request is not a failure — the component is simply gone.
        if (controller.signal.aborted) return;

        logger.error("[industries] load failed:", error);

        setState({
          status: "error",
          message: isApiError(error) ? error.message : FALLBACK_MESSAGE,
          // Retrying a 4xx would fail identically; only transient kinds are worth
          // offering a button for.
          canRetry: isApiError(error) ? error.isRetryable : true,
        });
      }
    };

    void load();

    return () => controller.abort();
  }, [attempt]);

  return { state, retry };
}
