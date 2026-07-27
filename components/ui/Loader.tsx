import { ActivityIndicator, Text, View } from "react-native";

import { Brand } from "@/constants/colors";

export interface LoaderProps {
  /** Optional caption under the spinner. */
  message?: string;
  size?: "small" | "large";
  /** Fills the available space and centres itself — for whole-screen waits. */
  fullScreen?: boolean;
  className?: string;
}

/**
 * Standalone loading indicator, for section- and screen-level waits.
 *
 * In-button loading is handled by `Button`'s own `loading` prop; use this for
 * content areas that have nothing to show yet.
 *
 * The home sections use skeletons instead — a placeholder shaped like the content
 * reserves its space, so the page does not lurch when the data lands. Reach for this
 * where the incoming shape is not known ahead of time, or where the wait blocks a
 * whole screen and there is no layout to preserve.
 */
export function Loader({
  message,
  size = "large",
  fullScreen = false,
  className = "",
}: LoaderProps) {
  return (
    <View
      // `accessibilityLiveRegion` makes a screen reader announce the wait when
      // this mounts, instead of leaving the user on a silent screen.
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      className={`items-center justify-center ${fullScreen ? "flex-1" : "py-8"} ${className}`}
    >
      <ActivityIndicator size={size} color={Brand.DEFAULT} />
      {message ? (
        <Text className="mt-3 text-sm text-muted dark:text-muted-dark">{message}</Text>
      ) : null}
    </View>
  );
}
