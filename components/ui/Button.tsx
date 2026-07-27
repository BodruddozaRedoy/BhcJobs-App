import { ActivityIndicator, Pressable, Text, View, type PressableProps } from "react-native";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner in place of the label and blocks presses. */
  loading?: boolean;
  disabled?: boolean;
  /** Rendered to the left of the label; hidden while loading. */
  icon?: React.ReactNode;
  className?: string;
  /**
   * Overrides the label's own classes. Separate from `className`, which lands on
   * the container — a text colour set there does not reach the label, since the
   * variant sets one explicitly and that wins.
   */
  labelClassName?: string;
}

const CONTAINER: Record<ButtonVariant, string> = {
  primary: "bg-brand active:bg-brand-dark",
  secondary: "bg-element dark:bg-element-dark active:bg-selected dark:active:bg-selected-dark",
  ghost: "bg-transparent",
};

const LABEL: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-content dark:text-content-dark",
  ghost: "text-brand dark:text-brand-dark",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5",
  md: "h-11 px-4",
  lg: "h-14 px-5",
};

/** Label scales with the container so a small button does not look cramped. */
const LABEL_SIZE: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-base",
};

/**
 * Primary action button.
 *
 * `loading` swaps the label for a spinner while keeping the button's height and
 * width, so the surrounding layout does not shift mid-request — a jumping form is
 * the most common giveaway of a hand-rolled loading state.
 *
 * The spinner colour is tied to the variant rather than hardcoded white, so a
 * secondary button's spinner stays visible on its light background.
 */
export function Button({
  label,
  variant = "primary",
  size = "lg",
  loading = false,
  disabled = false,
  icon,
  className = "",
  labelClassName = "",
  ...pressableProps
}: ButtonProps) {
  // A loading button must not be pressable, or a double tap fires the request twice.
  const isBlocked = loading || disabled;

  return (
    <Pressable
      accessibilityRole="button"
      // Announces "busy"/"disabled" to screen readers, which a visual-only
      // spinner does not.
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      accessibilityLabel={label}
      disabled={isBlocked}
      className={`flex-row items-center justify-center rounded-xl ${CONTAINER[variant]} ${SIZE[size]} ${
        isBlocked ? "opacity-60" : ""
      } ${className}`}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "primary" ? "#ffffff" : "#3b82f6"} />
      ) : (
        <>
          {icon ? <View className="mr-2">{icon}</View> : null}
          <Text
            // `labelClassName` last, so a caller's colour overrides the variant's.
            className={`font-bold tracking-wide ${LABEL_SIZE[size]} ${LABEL[variant]} ${labelClassName}`}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
