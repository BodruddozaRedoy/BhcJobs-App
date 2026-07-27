import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { usePalette } from "@/context/ThemeProvider";

/**
 * Half the crest-to-trough travel, and it is the *real* travel — the curve reaches
 * `0` at the crest and `2 × AMPLITUDE` at the trough exactly.
 */
const AMPLITUDE = 34;

/** Solid fill kept below the lowest trough, so no gradient shows through it. */
const BASE_HEIGHT = 44;

/**
 * Vertical space the wave needs. Exported so the banner can reserve it as padding
 * and keep its content clear of the crest.
 */
export const WAVE_HEIGHT = AMPLITUDE * 2 + BASE_HEIGHT;

/**
 * Wavelength, as a multiple of the screen width.
 *
 * Two, so only half a period is on screen at a time — one long, wide arc rather
 * than a full crest *and* trough crammed into the viewport, which reads as a ripple.
 * This is what controls how "wide" the curve looks; `AMPLITUDE` only controls how
 * deep it is.
 */
const PERIOD_RATIO = 2;

/**
 * Periods drawn. The strip slides left by exactly one period, so what remains after
 * a full cycle — `(PERIODS - 1) × period` — still has to cover the screen. At this
 * wavelength two periods clear that with room to spare.
 */
const PERIODS = 2;

/**
 * Seconds for one period to pass. Higher is slower — and since a period is now two
 * screens wide, this covers twice the distance it used to.
 */
const DURATION_SECONDS = 20;

/**
 * One quadratic per half period: a crest, then a trough.
 *
 * Quadratics rather than a sine approximation, on purpose — a parabolic arc is
 * blunter and rounder at the top than a sine, which is what makes each crest read
 * as a broad mountain instead of a ripple.
 *
 * The control points sit at `-AMPLITUDE` and `3 × AMPLITUDE`, i.e. one full
 * amplitude *past* the extremes. A quadratic only reaches halfway to its control
 * point, so a control placed level with the intended peak yields half the travel;
 * overshooting by exactly one amplitude is what puts the crest at `0` and the trough
 * at `2 × AMPLITUDE`.
 *
 * Every segment enters and leaves the baseline with the same slope, so the halves
 * join smoothly and the strip tiles seamlessly — which is what lets the loop hide
 * its restart.
 */
const wavePath = (period: number): string => {
  const half = period / 2;
  const quarter = period / 4;

  let d = `M 0 ${AMPLITUDE}`;

  for (let i = 0; i < PERIODS; i += 1) {
    const x = i * period;

    d += ` Q ${x + quarter} ${-AMPLITUDE}, ${x + half} ${AMPLITUDE}`;
    d += ` Q ${x + half + quarter} ${AMPLITUDE * 3}, ${x + period} ${AMPLITUDE}`;
  }

  // Down the right edge, along the bottom, and closed — everything under the curve
  // is filled.
  return `${d} L ${PERIODS * period} ${WAVE_HEIGHT} L 0 ${WAVE_HEIGHT} Z`;
};

/**
 * The slow swell at the bottom of the home banner.
 *
 * Filled with the page background, so it reads as the page rising into the banner
 * rather than as a shape laid over it. One period spans the screen, which is what
 * makes it a single big swell instead of a ripple.
 *
 * An SVG path rather than a rounded `View`: both platforms clamp a border radius to
 * the box it sits on, so a band this short cannot hold the several-hundred-pixel
 * radius a shallow arc needs — it collapses into a flat bar. A path also gives real
 * crests and troughs to slide, which an arc cannot.
 */
export function BannerWave() {
  const { width } = useWindowDimensions();
  const palette = usePalette();

  const period = width * PERIOD_RATIO;
  const stripWidth = period * PERIODS;

  const progress = useSharedValue(0);
  // Respects the OS "reduce motion" setting — a large, slow, endlessly moving shape
  // is exactly what that setting exists to stop. The wave still draws, just still.
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    progress.value = withRepeat(
      withTiming(-period, {
        duration: DURATION_SECONDS * 1000,
        // Linear, and travelling exactly one period — any easing would surface the
        // loop's restart as a stutter.
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [period, progress, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          // The 1px overlap stops rounding from leaving a hairline of gradient
          // between the wave's fill and the page below.
          bottom: -1,
          left: 0,
          width: stripWidth,
          height: WAVE_HEIGHT,
        },
        style,
      ]}
      // Decoration — nothing here for a screen reader.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={stripWidth} height={WAVE_HEIGHT}>
        <Path d={wavePath(period)} fill={palette.background} />
      </Svg>
    </Animated.View>
  );
}
