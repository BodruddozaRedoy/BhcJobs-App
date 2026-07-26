import { Stack } from "expo-router";

import { AppHeader } from "@/components/global/AppHeader";

/**
 * Auth flow.
 *
 * Uses the same `AppHeader` as the tab shell so the wordmark and theme toggle are
 * present everywhere. Because the header owns the top safe-area inset, screens in
 * this group pass `edges={["bottom"]}` to `AppScreen`.
 */
export default function AuthLayout() {
  return <Stack screenOptions={{ header: () => <AppHeader /> }} />;
}
