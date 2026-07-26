import { Stack } from "expo-router";

/**
 * Auth flow. Headers are off because each screen draws its own gradient
 * background edge to edge; a navigation bar would cut it off.
 */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
