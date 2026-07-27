import { useEffect, useRef, useState } from "react";

/**
 * Seconds remaining until `startedAt + seconds`, ticking down once a second.
 *
 * Derived from a wall-clock deadline rather than decremented from a counter: a
 * counter drifts, and stops entirely while the app is backgrounded, so a five-minute
 * timer would still read 4:30 after the user came back ten minutes later.
 *
 * `restartKey` resets the deadline when it changes — pass a new value after a resend.
 */
export function useCountdown(seconds: number, restartKey: unknown = null): number {
  // Captured in a ref rather than state: writing it needs no re-render, and reading
  // it inside the interval must not make the interval depend on a changing value.
  const deadline = useRef(0);
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    deadline.current = Date.now() + seconds * 1000;

    const tick = () => {
      const left = Math.max(0, Math.round((deadline.current - Date.now()) / 1000));

      setRemaining(left);

      // Nothing left to count; the interval would otherwise wake the JS thread once
      // a second forever, for a value that cannot change.
      if (left === 0) clearInterval(id);
    };

    // `setInterval` alone would leave the first second showing the previous value
    // after a restart.
    tick();

    const id = setInterval(tick, 1000);

    return () => clearInterval(id);
  }, [restartKey, seconds]);

  return remaining;
}
