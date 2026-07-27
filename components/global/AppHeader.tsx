import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
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

/**
 * The two wordmark variants, each with its own intrinsic aspect ratio.
 *
 * Two files rather than one tinted asset because the light variant's "BHCJOBS"
 * text is dark charcoal, which all but disappears against the dark-mode header,
 * and flattening it with `tintColor` would take the blue hexagon with it.
 *
 * The ratios are per-asset because the files are not the same shape (3558 × 704
 * vs. 475 × 97); sharing one constant would letterbox whichever variant did not
 * match it.
 */
const LOGOS = {
  light: { source: require("@/assets/images/logo.png"), aspect: 3558 / 704 },
  dark: { source: require("@/assets/images/logo-dark.png"), aspect: 475 / 97 },
} as const;

/** Brand wordmark, doubling as the way back to Home from anywhere. */
function Logo({ isDark }: { isDark: boolean }) {
  const { source, aspect } = isDark ? LOGOS.dark : LOGOS.light;

  return (
    <Pressable
      // `navigate`, not `push`: the header is on every screen, so pushing would
      // stack duplicate Home entries behind the back gesture. This re-uses the
      // existing route when there is one.
      onPress={() => router.navigate("/(tabs)")}
      accessibilityRole="link"
      // Announced in place of the image, which is why the image itself carries no
      // label — it would be read out twice.
      accessibilityLabel="BHC Jobs, go to home"
      hitSlop={8}
      className="active:opacity-70"
    >
      <Image
        source={source}
        style={{ height: LOGO_HEIGHT, width: LOGO_HEIGHT * aspect }}
        // `contain` rather than `cover`, so an aspect-ratio drift in a future asset
        // letterboxes instead of cropping the wordmark.
        contentFit="contain"
      />
    </Pressable>
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
  const pathname = usePathname();
  const { isAuthenticated, isRestoring } = useAuth();
  const { isDark, toggle } = useTheme();

  // Route groups in parentheses are stripped from the URL, so `app/(auth)/login.tsx`
  // is simply `/login`.
  const onLogin = pathname === "/login";

  // The guest button always offers the screen you are *not* on: "Sign Up" while
  // signing in, "Sign In" while registering. Anywhere else it points at sign-in.
  const guestAction = onLogin
    ? { label: "Sign Up", go: () => router.replace("/(auth)/register") }
    : { label: "Sign In", go: () => router.replace("/(auth)/login") };

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="border-b border-slate-200 bg-white dark:border-gray-700 dark:bg-element-dark"
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
              label={guestAction.label}
              size="sm"
              variant="ghost"
              className="border border-brand"
              // Brand blue on the dark header is legible but recedes next to the
              // white wordmark; white gives the only action up here equal weight.
              labelClassName="dark:text-white"
              onPress={guestAction.go}
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
