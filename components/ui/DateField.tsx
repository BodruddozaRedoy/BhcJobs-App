import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { DatePickerModal } from "@/components/ui/DatePickerModal";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Brand } from "@/constants/colors";
import { usePalette } from "@/context/ThemeProvider";

export interface DateFieldProps {
  label?: string;
  required?: boolean;
  /** `YYYY-MM-DD`, or empty when nothing is chosen. */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  containerClassName?: string;
}

/**
 * Read-only date field that opens `DatePickerModal` when tapped.
 *
 * Deliberately not typeable. A free-text date invites `12/07/02`, `Dec 7 2002` and
 * every other ambiguous form, all of which the API would reject; the wheel can only
 * produce a valid `YYYY-MM-DD`. The field still renders the same label, border and
 * error treatment as `Input`, so the form reads as one set of controls.
 */
export function DateField({
  label,
  required = false,
  value,
  onChange,
  onBlur,
  placeholder = "YYYY-MM-DD",
  error,
  disabled = false,
  containerClassName = "",
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  /**
   * Bumped on every open, and used as the modal's `key`.
   *
   * The picker seeds its wheels from `value` when it mounts, so remounting is what
   * makes a cancelled edit discard cleanly: reopening shows the committed date, not
   * the abandoned one. Keyed rather than conditionally rendered so the modal stays
   * mounted while closing and its fade-out still plays.
   */
  const [openCount, setOpenCount] = useState(0);
  const hasError = Boolean(error);
  const palette = usePalette();

  const close = () => {
    setOpen(false);
    // Fires react-hook-form's blur so the field is marked touched and validates,
    // which a control that never receives focus would otherwise skip.
    onBlur?.();
  };

  return (
    <View className={containerClassName}>
      {label ? <FieldLabel required={required}>{label}</FieldLabel> : null}

      <Pressable
        onPress={() => {
          setOpenCount((count) => count + 1);
          setOpen(true);
        }}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: value || "not set" }}
        accessibilityHint={error ?? "Opens a date picker"}
        // `selected-dark` matches Input: one rung lighter than the `element-dark`
        // card behind it, which is what keeps the field visible in dark mode.
        className={`h-14 flex-row items-center rounded-xl border bg-white px-4 dark:bg-selected-dark ${
          hasError ? "border-red-400" : "border-slate-200 dark:border-gray-700"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <Ionicons name="calendar" size={20} color={Brand.DEFAULT} style={{ marginRight: 12 }} />

        {/* Muted while empty, so an unset date reads as a placeholder rather than as
            a real value. Done with classes, not an inline colour, so both states
            follow the theme. */}
        <Text
          className={`flex-1 text-base ${
            value ? "text-content dark:text-content-dark" : "text-muted dark:text-muted-dark"
          }`}
        >
          {value || placeholder}
        </Text>

        <Ionicons name="chevron-down" size={18} color={palette.textSecondary} />
      </Pressable>

      {hasError ? <Text className="mt-1.5 text-xs text-red-500">{error}</Text> : null}

      <DatePickerModal
        key={openCount}
        visible={open}
        value={value}
        onCancel={close}
        onConfirm={(next) => {
          onChange(next);
          close();
        }}
      />
    </View>
  );
}
