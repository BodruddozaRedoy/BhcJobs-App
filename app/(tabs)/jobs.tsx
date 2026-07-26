import { Text } from "react-native";

import { AppScreen } from "@/components/layout/AppScreen";

export default function JobsScreen() {
  // `edges={[]}`: AppHeader already consumed the top inset for every tab screen.
  return (
    <AppScreen center edges={[]}>
      <Text className="text-base font-semibold text-content dark:text-content-dark">
        JobsScreen
      </Text>
    </AppScreen>
  );
}
