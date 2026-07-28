import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { AppHeader } from "@/components/global/AppHeader";
import { Brand, Colors } from "@/constants/colors";
import { useTheme } from "@/context/ThemeProvider";

const TABS = [
  { name: "index", title: "Home", icon: "home" },
  { name: "jobs", title: "Jobs", icon: "briefcase" },
  { name: "search", title: "Search", icon: "search" },
  { name: "dashboard", title: "Dashboard", icon: "grid" },
  { name: "profile", title: "Profile", icon: "person" },
] as const satisfies readonly {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap & string;
}[];

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
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? icon : `${icon}-outline`} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
