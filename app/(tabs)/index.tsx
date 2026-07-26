import { Text } from "react-native";

import { AppScreen } from "@/components/layout/AppScreen";

export default function HomeScreen() {
  return (
    <AppScreen scroll center>
      <Text className="text-2xl font-bold text-brand dark:text-brand-dark">HomeScreen</Text>
    </AppScreen>
  );
}
