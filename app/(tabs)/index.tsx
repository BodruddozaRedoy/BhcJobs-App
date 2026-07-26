import { Text } from "react-native";

import { AppScreen } from "@/components/layout/AppScreen";

export default function HomeScreen() {
  // `edges={[]}`: AppHeader already consumed the top inset for every tab screen.
  return (
    <AppScreen scroll center edges={[]}>
      <Text className="text-2xl font-bold text-brand dark:text-brand-dark">HomeScreen</Text>
    </AppScreen>
  );
}
