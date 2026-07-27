import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";

const ICON_SIZE = 26;

/** Amber, not red: a section that failed to load is recoverable, not destructive. */
const ICON_COLOR = "#f59e0b";

export interface ErrorViewProps {
  /** What went wrong, in the user's terms. Prefer the server's own wording. */
  message: string;
  /**
   * Retry handler. The button only renders when this is given *and* `canRetry` is
   * true — a retry that is certain to fail again is worse than no button at all,
   * so the caller passes `ApiError.isRetryable` straight through.
   */
  onRetry?: () => void;
  canRetry?: boolean;
  retryLabel?: string;
  /** Glyph above the message. Pass `null` for a bare text state. */
  icon?: keyof typeof Ionicons.glyphMap | null;
  /** Fills the available space and centres itself — for whole-screen failures. */
  fullScreen?: boolean;
  className?: string;
}

/**
 * Standalone failure state, for section- and screen-level errors.
 *
 * The counterpart to `Loader` and `EmptyView`: same padding, same disc-and-message
 * layout, so the three states occupy the same visual slot and the section does not
 * jump as it moves between them.
 *
 * Request-level failures on a *form* do not use this — those become a toast, or a
 * message on the offending field. This is for content that could not load.
 */
export function ErrorView({
  message,
  onRetry,
  canRetry = true,
  retryLabel = "Try again",
  icon = "cloud-offline-outline",
  fullScreen = false,
  className = "",
}: ErrorViewProps) {
  return (
    <View
      // Announced as soon as it mounts, so the failure is not silent for a screen
      // reader user who cannot see the section change.
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className={`items-center justify-center ${fullScreen ? "flex-1" : "py-8"} ${className}`}
    >
      {icon ? (
        <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-selected-dark">
          <Ionicons name={icon} size={ICON_SIZE} color={ICON_COLOR} />
        </View>
      ) : null}

      <Text className="max-w-xs text-center text-sm text-muted dark:text-muted-dark">
        {message}
      </Text>

      {onRetry && canRetry ? (
        <Button
          label={retryLabel}
          variant="secondary"
          size="sm"
          onPress={onRetry}
          className="mt-4"
        />
      ) : null}
    </View>
  );
}
