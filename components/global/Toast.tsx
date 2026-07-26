import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ToastType = "success" | "error" | "info";

export interface ToastData {
  /** Changes on every show, so a replacement toast re-runs its entry animation. */
  id: number;
  type: ToastType;
  message: string;
  /** Milliseconds before auto-dismiss. */
  duration?: number;
}

/** Per-type colours and glyph. Colours are literals because these are semantic
 *  status colours, not brand tokens that should follow the theme. */
const STYLES: Record<ToastType, { bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { bg: "#16a34a", icon: "checkmark-circle" },
  error: { bg: "#dc2626", icon: "alert-circle" },
  info: { bg: "#3b82f6", icon: "information-circle" },
};

/** Errors get longer on screen — there is more to read and more at stake. */
export const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 2500,
  error: 4000,
  info: 3000,
};

const ENTER_MS = 220;
const EXIT_MS = 180;

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

/**
 * Toast overlay. Rendered once by `ToastProvider`, above the navigator.
 *
 * Slides down from under the status bar and fades in, waits, then reverses. Tapping
 * dismisses early.
 */
export function Toast({ toast, onDismiss }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-24)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // `toast?.id` in the dependency list is what makes a second toast arriving while
  // the first is still visible restart the animation and the timer, rather than
  // inheriting the old one's remaining time.
  useEffect(() => {
    if (!toast) return;

    translateY.setValue(-24);
    opacity.setValue(0);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: ENTER_MS,
        easing: Easing.out(Easing.cubic),
        // Transform and opacity can both run on the UI thread, so the animation
        // stays smooth even while JS is busy handling the request that triggered it.
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ENTER_MS,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(
      () => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -24,
            duration: EXIT_MS,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: EXIT_MS,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          // Only clear if the animation ran to completion; if it was interrupted by
          // a new toast, that toast now owns the state.
          if (finished) onDismiss();
        });
      },
      toast.duration ?? DEFAULT_DURATION[toast.type],
    );

    return () => clearTimeout(timer);
  }, [toast?.id, toast, onDismiss, opacity, translateY]);

  if (!toast) return null;

  const { bg, icon } = STYLES[toast.type];

  return (
    // `pointerEvents="box-none"` so the container never swallows taps meant for the
    // screen underneath — only the toast itself is interactive.
    <View
      pointerEvents="box-none"
      style={{ top: insets.top + 8 }}
      className="absolute left-0 right-0 z-50 items-center px-4"
    >
      <Animated.View style={{ opacity, transform: [{ translateY }], width: "100%" }}>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="alert"
          // Announced by screen readers as soon as it appears, which a purely
          // visual toast would not be.
          accessibilityLiveRegion="assertive"
          accessibilityLabel={toast.message}
          style={{ backgroundColor: bg }}
          className="flex-row items-center rounded-xl px-4 py-3 shadow-lg"
        >
          <Ionicons name={icon} size={20} color="#ffffff" />
          <Text className="ml-3 flex-1 text-sm font-medium text-white">{toast.message}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
