import { Stack } from "expo-router";

import { AppHeader } from "@/components/global/AppHeader";

export default function AuthLayout() {
  return <Stack screenOptions={{ header: () => <AppHeader /> }} />;
}
