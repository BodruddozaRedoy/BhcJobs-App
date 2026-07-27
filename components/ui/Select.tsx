import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { FieldLabel } from "@/components/ui/FieldLabel";
import { Brand } from "@/constants/colors";
import { usePalette } from "@/context/ThemeProvider";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string> {
  label?: string;
  required?: boolean;
  options: readonly SelectOption<T>[];
  /** `undefined` means nothing chosen — distinct from a valid selection. */
  value: T | undefined;
  onChange: (value: T) => void;
  onBlur?: () => void;
  placeholder?: string;
  /** Ionicons name shown inside the closed field. */
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  disabled?: boolean;
  containerClassName?: string;
}

/**
 * Dropdown built on a modal sheet rather than a native picker.
 *
 * A native `Picker` renders as a wheel on iOS and a spinner dialog on Android, and
 * neither can be styled to match the rest of this form. This keeps the closed state
 * visually identical to `Input` and `DateField` — same height, border, label and
 * error treatment — so the fields line up as one set of controls.
 */
export function Select<T extends string>({
  label,
  required = false,
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Select an option",
  icon,
  error,
  disabled = false,
  containerClassName = "",
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const hasError = Boolean(error);
  const selected = options.find((option) => option.value === value);
  const palette = usePalette();

  const close = () => {
    setOpen(false);
    // Marks the field touched in react-hook-form; a control that never takes focus
    // would otherwise never validate on blur.
    onBlur?.();
  };

  return (
    <View className={containerClassName}>
      {label ? <FieldLabel required={required}>{label}</FieldLabel> : null}

      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: selected?.label ?? "not set" }}
        accessibilityHint={error ?? "Opens a list of options"}
        // `selected-dark` matches Input: one rung lighter than the `element-dark`
        // card behind it, which is what keeps the field visible in dark mode.
        className={`h-14 flex-row items-center rounded-xl border bg-white px-4 dark:bg-selected-dark ${
          hasError ? "border-red-400" : "border-slate-200 dark:border-gray-700"
        } ${disabled ? "opacity-60" : ""}`}
      >
        {icon ? (
          <Ionicons name={icon} size={20} color={Brand.DEFAULT} style={{ marginRight: 12 }} />
        ) : null}

        <Text
          className={`flex-1 text-base ${
            selected ? "text-content dark:text-content-dark" : "text-muted dark:text-muted-dark"
          }`}
        >
          {selected?.label ?? placeholder}
        </Text>

        <Ionicons name="chevron-down" size={18} color={palette.textSecondary} />
      </Pressable>

      {hasError ? <Text className="mt-1.5 text-xs text-red-500">{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View className="flex-1 items-center justify-center px-6">
          {/* Backdrop as a sibling behind the sheet rather than a wrapper around it,
              so its press responder cannot compete with the options for touches. */}
          <Pressable
            onPress={close}
            accessibilityLabel="Dismiss"
            className="absolute bottom-0 left-0 right-0 top-0 bg-black/50"
          />

          <View className="w-full max-w-sm rounded-2xl bg-white py-2 dark:bg-element-dark">
            {label ? (
              <Text className="px-5 py-3 text-base font-bold text-content dark:text-content-dark">
                {label}
              </Text>
            ) : null}

            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    close();
                  }}
                  accessibilityRole="menuitem"
                  // Conveys the current choice to assistive tech; the checkmark alone
                  // would not.
                  accessibilityState={{ selected: isSelected }}
                  className="flex-row items-center justify-between px-5 py-4 active:bg-element dark:active:bg-selected-dark"
                >
                  <Text
                    className={`text-base ${
                      isSelected
                        ? "font-semibold text-brand dark:text-brand-dark"
                        : "text-content dark:text-content-dark"
                    }`}
                  >
                    {option.label}
                  </Text>
                  {isSelected ? (
                    <Ionicons name="checkmark" size={20} color={Brand.DEFAULT} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}
