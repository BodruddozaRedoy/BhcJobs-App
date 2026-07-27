import { useRef } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  length?: number;
  disabled?: boolean;
  /** Validation message. Its presence is what puts the boxes in their error state. */
  error?: string;
  autoFocus?: boolean;
  /** Fired once the last digit is entered — for submitting without a button press. */
  onComplete?: (value: string) => void;
  containerClassName?: string;
}

/**
 * Segmented code entry.
 *
 * One real `TextInput`, held invisible behind the boxes, rather than one input per
 * digit. The per-digit version has to hand-roll focus advance, backspace-to-previous
 * and paste distribution, and it breaks OTP autofill — the platform fills a single
 * field, so four fields get the first digit each. With one input, all of that is the
 * platform's job: `autoComplete="sms-otp"` and `textContentType="oneTimeCode"` let
 * Android and iOS drop the code straight in.
 *
 * The boxes are therefore pure display, and hidden from assistive tech — the input
 * behind them carries the label and the value.
 */
export function OtpInput({
  value,
  onChange,
  onBlur,
  length = 4,
  disabled = false,
  error,
  autoFocus = false,
  onComplete,
  containerClassName = "",
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const hasError = Boolean(error);

  const handleChange = (text: string) => {
    // Strips anything a soft keyboard or a paste might slip in — spaces, dashes, the
    // "Your code is 1234" wrapper some SMS autofills hand over.
    const digits = text.replace(/\D/g, "").slice(0, length);

    onChange(digits);

    if (digits.length === length) onComplete?.(digits);
  };

  return (
    <View className={containerClassName}>
      <Pressable
        // Any tap in the row focuses the one input, so the boxes behave as if each
        // were tappable without any of them being focusable.
        onPress={() => inputRef.current?.focus()}
        disabled={disabled}
        accessible={false}
        className="flex-row justify-between"
      >
        {Array.from({ length }, (_, index) => {
          const digit = value[index] ?? "";
          // The box the next digit lands in, highlighted so there is a visible
          // caret equivalent. Sticks to the last box once the code is complete.
          const isActive = index === Math.min(value.length, length - 1);

          return (
            <View
              key={index}
              importantForAccessibility="no-hide-descendants"
              className={`h-14 w-[22%] items-center justify-center rounded-xl border bg-white dark:bg-selected-dark ${
                hasError
                  ? "border-red-400"
                  : isActive
                    ? "border-brand"
                    : "border-slate-200 dark:border-gray-600"
              } ${disabled ? "opacity-60" : ""}`}
            >
              <Text
                className={`text-lg font-bold ${
                  digit ? "text-content dark:text-content-dark" : "text-muted dark:text-muted-dark"
                }`}
              >
                {/* A dimmed zero as the placeholder, matching the design, rather
                    than an empty box that reads as broken. */}
                {digit || "0"}
              </Text>
            </View>
          );
        })}

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          onBlur={onBlur}
          editable={!disabled}
          keyboardType="number-pad"
          maxLength={length}
          // Platform OTP autofill: Android reads the SMS, iOS offers the code above
          // the keyboard.
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
          autoFocus={autoFocus}
          // The active box is the caret; a real one would sit at the row's left edge
          // where the input actually is.
          caretHidden
          accessibilityLabel={`Enter the ${length}-digit code`}
          accessibilityHint={error}
          // Stretched over the boxes so taps and focus land on it, invisible so the
          // boxes are what you see.
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0,
          }}
        />
      </Pressable>

      {hasError ? (
        <Text className="mt-2 text-center text-xs text-red-500">{error}</Text>
      ) : null}
    </View>
  );
}
