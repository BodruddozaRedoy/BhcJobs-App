import { Text } from "react-native";

import { AppScreen } from "@/components/layout/AppScreen";

export default function ProfileScreen() {
  return (
    <AppScreen center edges={[]}>
      <Text className="text-base font-semibold text-content dark:text-content-dark">
        ProfileScreen
      </Text>
    </AppScreen>
  );
}
