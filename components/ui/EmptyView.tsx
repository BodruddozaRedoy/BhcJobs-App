import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { usePalette } from "@/context/ThemeProvider";

const ICON_SIZE = 26;

export interface EmptyViewProps {
  /**
   * What is missing, phrased as a fact rather than a failure — "No jobs to show
   * yet", not "Failed to load jobs". An empty list is a valid answer from the
   * server, and reading it as an error sends people off to retry something that
   * worked.
   */
  message: string;
  /** Optional second line, for what the user could do about it. */
  hint?: string;
  /** Glyph above the message. Omit for a bare text state. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Fills the available space and centres itself — for whole-screen blanks. */
  fullScreen?: boolean;
  className?: string;
}

/**
 * Standalone empty state, for a request that succeeded and returned nothing.
 *
 * The counterpart to `Loader` and `ErrorView`: same padding, same muted type, so
 * the three states occupy the same visual slot and the section does not jump as it
 * moves between them.
 *
 * The icon sits in a tinted disc rather than floating on the background, which
 * keeps a lone glyph from reading as a broken image.
 */
export function EmptyView({
  message,
  hint,
  icon,
  fullScreen = false,
  className = "",
}: EmptyViewProps) {
  const palette = usePalette();

  return (
    <View
      accessibilityLiveRegion="polite"
      className={`items-center justify-center ${fullScreen ? "flex-1" : "py-8"} ${className}`}
    >
      {icon ? (
        <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-element dark:bg-selected-dark">
          <Ionicons name={icon} size={ICON_SIZE} color={palette.textSecondary} />
        </View>
      ) : null}

      <Text className="text-center text-sm font-semibold text-content dark:text-content-dark">
        {message}
      </Text>

      {hint ? (
        <Text className="mt-1 max-w-xs text-center text-xs text-muted dark:text-muted-dark">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
