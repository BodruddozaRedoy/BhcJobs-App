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

const LOGOS = {
  light: { source: require("@/assets/images/logo.png"), aspect: 3558 / 704 },
  dark: { source: require("@/assets/images/logo-dark.png"), aspect: 475 / 97 },
} as const;

/** Brand wordmark, doubling as the way back to Home from anywhere. */
function Logo({ isDark }: { isDark: boolean }) {
  const { source, aspect } = isDark ? LOGOS.dark : LOGOS.light;

  return (
    <Pressable
      onPress={() => router.navigate("/(tabs)")}
      accessibilityRole="link"
      accessibilityLabel="BHC Jobs, go to home"
      hitSlop={8}
      className="active:opacity-70"
    >
      <Image
        source={source}
        style={{ height: LOGO_HEIGHT, width: LOGO_HEIGHT * aspect }}
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
          {isRestoring ? null : isAuthenticated ? (
            <IconCircle filled label="Open profile" onPress={() => router.push("/(tabs)/profile")}>
              <Ionicons name="person" size={18} color={Brand.DEFAULT} />
            </IconCircle>
          ) : (
            <Button
              label={guestAction.label}
              size="sm"
              variant="ghost"
              className="border border-brand"
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
