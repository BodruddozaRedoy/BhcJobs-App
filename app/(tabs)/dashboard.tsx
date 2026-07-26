import { Text } from "react-native";

import { AppScreen } from "@/components/layout/AppScreen";

export default function DashboardScreen() {
  return (
    <AppScreen center>
      <Text className="text-base font-semibold text-content dark:text-content-dark">
        DashboardScreen
      </Text>
    </AppScreen>
  );
}
