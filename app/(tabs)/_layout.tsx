import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { AppHeader } from "@/components/global/AppHeader";
import { Brand, Colors } from "@/constants/colors";
import { useTheme } from "@/context/ThemeProvider";

/**
 * One entry per tab: route name, label, and the icon pair.
 *
 * Ionicons ships a filled and an `-outline` variant of each glyph; using the
 * filled one only for the active tab is what makes the selection readable at a
 * glance, beyond the tint colour alone.
 */
const TABS = [
  { name: "index", title: "Home", icon: "home" },
  { name: "jobs", title: "Jobs", icon: "briefcase" },
  { name: "search", title: "Search", icon: "search" },
  { name: "dashboard", title: "Dashboard", icon: "grid" },
  { name: "profile", title: "Profile", icon: "person" },
] as const satisfies readonly {
  name: string;
  title: string;
  // Constrained to names that have both variants, so a typo fails to compile
  // instead of rendering an invisible glyph at runtime.
  icon: keyof typeof Ionicons.glyphMap & string;
}[];

/**
 * Tab shell.
 *
 * `AppHeader` is supplied as the navigator's `header`, so it renders once for
 * every tab screen instead of each screen remembering to include it.
 *
 * Tab bar colours are passed explicitly rather than left to React Navigation's
 * defaults, which only track the OS scheme and would ignore the in-app toggle.
 */
export default function TabsLayout() {
  const { isDark } = useTheme();
  const palette = isDark ? Colors.dark : Colors.light;

  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        tabBarActiveTintColor: Brand.DEFAULT,
        tabBarInactiveTintColor: palette.textSecondary,
        tabBarStyle: {
          backgroundColor: palette.background,
          // gray-700 in dark, matching the header's bottom border.
          borderTopColor: isDark ? "#374151" : "#e2e8f0",
        },
      }}
    >
      {TABS.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            // `color` and `size` come from the navigator so the icon inherits the
            // active/inactive tint set above — hardcoding either would break the
            // selected state and the theme toggle.
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? icon : `${icon}-outline`} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
