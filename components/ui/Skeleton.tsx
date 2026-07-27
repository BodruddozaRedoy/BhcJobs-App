import { useEffect } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

/** One full dim-and-back cycle. Slow enough to read as breathing, not flashing. */
const PULSE_MS = 900;

const MIN_OPACITY = 0.4;
const MAX_OPACITY = 1;

export interface SkeletonProps {
  /** Shape and size, e.g. `"h-4 w-24 rounded-md"`. */
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * A single pulsing placeholder block.
 *
 * Opacity rather than a sweeping gradient: the sweep needs a masked gradient per
 * block and has to stay in phase across a grid to avoid looking like static, which
 * is a lot of machinery for a wait this short. Pulsing costs one shared value and
 * runs entirely on the UI thread.
 *
 * Compose these into the shape of the real content — see `components/module/home/
 * Skeletons.tsx`. A placeholder that does not match what replaces it produces a
 * visible jump on load, which is worse than a plain spinner.
 */
export function Skeleton({ className = "", style }: SkeletonProps) {
  const opacity = useSharedValue(MAX_OPACITY);
  // Respects the OS "reduce motion" setting. The block still renders, just static —
  // a grid of them pulsing is exactly the kind of repetitive motion that setting is
  // there to stop.
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    opacity.value = withRepeat(
      withTiming(MIN_OPACITY, { duration: PULSE_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      // Reverses, so it fades back up rather than snapping to full and dropping again.
      true,
    );
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[animatedStyle, style]}
      // Placeholder furniture — the section announces the wait itself.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={`bg-slate-200 dark:bg-gray-700 ${className}`}
    />
  );
}
