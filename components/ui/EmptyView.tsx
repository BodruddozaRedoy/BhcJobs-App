import { Text, View } from "react-native";

export interface EmptyViewProps {
  /**
   * What is missing, phrased as a fact rather than a failure — "No jobs to show
   * yet", not "Failed to load jobs". An empty list is a valid answer from the
   * server, and reading it as an error sends people off to retry something that
   * worked.
   */
  message: string;
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
 */
export function EmptyView({ message, fullScreen = false, className = "" }: EmptyViewProps) {
  return (
    <View
      accessibilityLiveRegion="polite"
      className={`items-center justify-center ${fullScreen ? "flex-1" : "py-8"} ${className}`}
    >
      <Text className="text-center text-sm text-muted dark:text-muted-dark">{message}</Text>
    </View>
  );
}
