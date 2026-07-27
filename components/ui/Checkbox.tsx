import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onBlur?: () => void;
  disabled?: boolean;
  /** Validation message. Its presence is what puts the box in its error state. */
  error?: string;
  /** Label content, to the right of the box. Rich, so it can hold inline links. */
  children: ReactNode;
  /**
   * Announced in place of `children`, which may be a mix of text and links that
   * reads poorly as one string.
   */
  accessibilityLabel: string;
  containerClassName?: string;
}

/**
 * Checkbox with a rich label.
 *
 * Only the box toggles — not the label. That is the opposite of the usual advice,
 * and deliberate: this label carries links, and a row-wide press responder would
 * swallow their taps. `hitSlop` gives the box back the touch target it loses by
 * being small.
 */
export function Checkbox({
  checked,
  onChange,
  onBlur,
  disabled = false,
  error,
  children,
  accessibilityLabel,
  containerClassName = "",
}: CheckboxProps) {
  const hasError = Boolean(error);

  return (
    <View className={containerClassName}>
      <View className="flex-row items-start">
        <Pressable
          onPress={() => {
            onChange(!checked);
            // Marks the field touched in react-hook-form. Without it a control
            // that never receives focus would never validate on blur.
            onBlur?.();
          }}
          disabled={disabled}
          accessibilityRole="checkbox"
          accessibilityState={{ checked, disabled }}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={error}
          hitSlop={12}
          // `mt-0.5` optically centres the box against the first line of the
          // label rather than its ascender.
          className={`mt-0.5 h-5 w-5 items-center justify-center rounded border-2 ${
            checked
              ? "border-brand bg-brand"
              : hasError
                ? "border-red-400"
                : "border-slate-300 dark:border-gray-500"
          } ${disabled ? "opacity-60" : ""}`}
        >
          {checked ? <Ionicons name="checkmark" size={14} color="#ffffff" /> : null}
        </Pressable>

        <View className="ml-3 flex-1">{children}</View>
      </View>

      {hasError ? <Text className="mt-1.5 text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}
