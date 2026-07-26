import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/context/AuthProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import { ToastProvider } from "@/context/ToastProvider";

import "../global.css";

/**
 * Root providers.
 *
 * Order matters: `ThemeProvider` is outermost so the colour scheme is applied
 * before anything renders, and `SafeAreaProvider` must wrap both — `AppHeader` and
 * `AppScreen` call `useSafeAreaInsets`, which reads 0 everywhere without it.
 *
 * `GestureHandlerRootView` has to be the outermost view (with an inline
 * `flex: 1`, since it renders before NativeWind's interop applies) or swipe
 * gestures go dead on Android.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          {/*
            Outside AuthProvider, so auth events (a failed session restore, a
            sign-out) can raise a toast too.
          */}
          <ToastProvider>
            <AuthProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
