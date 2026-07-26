import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Brand } from "@/constants/colors";
import { useAuth } from "@/context/AuthProvider";
import { useTheme } from "@/context/ThemeProvider";

/**
 * Height of the wordmark in the header; the width is derived so the asset is
 * never stretched.
 */
const LOGO_HEIGHT = 28;
/** `logo.png` is 3558 × 704. */
const LOGO_ASPECT = 3558 / 704;

/**
 * Brand wordmark.
 *
 * The asset's "BHCJOBS" text is dark charcoal, which all but disappears against
 * the dark-mode header. Until there is a light-on-dark variant of the file, dark
 * mode renders the same asset tinted white — `tintColor` flattens it to a single
 * colour, so the blue hexagon becomes a white silhouette. Readable, and honest
 * about being a stopgap: adding `logo-dark.png` and picking it by `isDark` here is
 * the better fix.
 */
function Logo({ isDark }: { isDark: boolean }) {
  return (
    <Image
      source={require("@/assets/images/logo.png")}
      style={{ height: LOGO_HEIGHT, width: LOGO_HEIGHT * LOGO_ASPECT }}
      // `contain` rather than `cover`, so an aspect-ratio drift in a future asset
      // letterboxes instead of cropping the wordmark.
      contentFit="contain"
      tintColor={isDark ? "#ffffff" : undefined}
      // Read out in place of the image for screen readers.
      accessibilityRole="image"
      accessibilityLabel="BHC Jobs"
    />
  );
}

/** Circular icon button, used for the avatar and the theme toggle. */
function IconCircle({
  onPress,
  label,
  children,
  filled = false,
}: {
  onPress: () => void;
  label: string;
  children: React.ReactNode;
  /** Solid brand fill (avatar) vs. outlined (theme toggle). */
  filled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      className={`h-9 w-9 items-center justify-center rounded-full ${
        filled ? "bg-blue-100 dark:bg-brand-dark" : "border border-brand active:bg-blue-50"
      }`}
    >
      {children}
    </Pressable>
  );
}

/**
 * App-wide header: wordmark on the left, account state and theme toggle on the
 * right.
 *
 * Mounted once by the tab layout rather than per screen, so it cannot drift
 * between screens or get forgotten on a new one. It applies its own top safe-area
 * inset because a custom navigator `header` is not inset automatically — which is
 * also why screens under it pass `edges={[]}` to `AppScreen`.
 */
export function AppHeader() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isRestoring } = useAuth();
  const { isDark, toggle } = useTheme();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-background-dark"
    >
      <View className="h-14 flex-row items-center justify-between px-4">
        <Logo isDark={isDark} />

        <View className="flex-row items-center gap-3">
          {/*
            While the token is still being read from secure storage we render
            neither state: showing "Sign Up" to an already-authenticated user and
            then swapping it for an avatar is a worse flicker than a brief gap.
          */}
          {isRestoring ? null : isAuthenticated ? (
            <IconCircle
              filled
              label="Open profile"
              onPress={() => router.push("/(tabs)/profile")}
            >
              <Ionicons name="person" size={18} color={Brand.DEFAULT} />
            </IconCircle>
          ) : (
            <Button
              label="Sign In"
              size="sm"
              variant="ghost"
              className="border-brand border"
              onPress={() => router.push("/(auth)/login")}
            />
          )}

          <IconCircle
            label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onPress={toggle}
          >
            <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={Brand.DEFAULT} />
          </IconCircle>
        </View>
      </View>
    </View>
  );
}
