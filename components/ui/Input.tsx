import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useState } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";

import { FieldLabel } from "@/components/ui/FieldLabel";
import { Brand } from "@/constants/colors";
import { usePalette } from "@/context/ThemeProvider";

export interface InputProps extends Omit<TextInputProps, "className"> {
  label?: string;
  /** Marks the label with a red asterisk and announces the field as required. */
  required?: boolean;
  /** Ionicons name rendered inside the field, on the left. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Validation message. Its presence is what puts the field in its error state. */
  error?: string;
  /** Renders a show/hide toggle and masks the value until toggled. */
  secure?: boolean;
  containerClassName?: string;
}

/**
 * Labelled text field with an optional leading icon, an error state, and a
 * password reveal toggle.
 *
 * `forwardRef` is required so a form can call `.focus()` on the next field when
 * the user hits "next" on the keyboard.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    required = false,
    icon,
    error,
    secure = false,
    containerClassName = "",
    editable = true,
    ...props
  },
  ref,
) {
  const [revealed, setRevealed] = useState(false);
  const hasError = Boolean(error);
  const palette = usePalette();

  return (
    <View className={containerClassName}>
      {label ? <FieldLabel required={required}>{label}</FieldLabel> : null}

      <View
        // `selected-dark`, not `element-dark`: in dark mode the card behind this
        // field is already `element-dark`, so sharing it would make the field
        // vanish into the card. One rung lighter is what separates them.
        className={`h-14 flex-row items-center rounded-xl border bg-white px-4 dark:bg-selected-dark ${
          hasError ? "border-red-400" : "border-slate-200 dark:border-gray-700"
        } ${editable ? "" : "opacity-60"}`}
      >
        {icon ? (
          <Ionicons name={icon} size={20} color={Brand.DEFAULT} style={{ marginRight: 12 }} />
        ) : null}

        <TextInput
          ref={ref}
          editable={editable}
          // Masked unless the user has explicitly revealed it.
          secureTextEntry={secure && !revealed}
          placeholderTextColor={palette.textSecondary}
          // Announce the error to screen readers; `accessibilityLabel` alone would
          // read the label but not why the field is rejected.
          accessibilityLabel={label}
          accessibilityHint={error}
          // Conveys "required" to assistive tech, which cannot see the asterisk.
          aria-required={required}
          className="flex-1 text-base text-content dark:text-content-dark"
          {...props}
        />

        {secure ? (
          <Pressable
            onPress={() => setRevealed((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
            // Enlarges the touch target beyond the 20px glyph without affecting layout.
            hitSlop={12}
          >
            <Ionicons name={revealed ? "eye-off" : "eye"} size={20} color={Brand.DEFAULT} />
          </Pressable>
        ) : null}
      </View>

      {/* Rendered only when present, so fields do not reserve empty vertical space. */}
      {hasError ? <Text className="mt-1.5 text-xs text-red-500">{error}</Text> : null}
    </View>
  );
});
