import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "../global.css";

/**
 * Root providers.
 *
 * `SafeAreaProvider` is required for `AppScreen`'s `useSafeAreaInsets` — without
 * it every inset reads 0 and content slides under the status bar.
 *
 * `GestureHandlerRootView` must be the outermost view (and needs `flex: 1`, not a
 * className, since it renders before styles are interop'd) or swipe gestures go
 * dead on Android.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
