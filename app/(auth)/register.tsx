import { Text } from "react-native";

import { AppScreen } from "@/components/layout/AppScreen";

/**
 * Placeholder so the "Create an account" link on the sign-in screen has a
 * destination. The real registration flow (register → OTP → phone_verify) is not
 * built yet.
 */
export default function RegisterScreen() {
  return (
    <AppScreen gradient center edges={["bottom"]}>
      <Text className="text-base font-semibold text-content dark:text-content-dark">
        Registration coming next
      </Text>
    </AppScreen>
  );
}
