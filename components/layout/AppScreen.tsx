import { LinearGradient } from "expo-linear-gradient";
import { StatusBar, type StatusBarStyle } from "expo-status-bar";
import { remapProps } from "nativewind";
import type { ReactElement, ReactNode } from "react";
import { ScrollView, View, type RefreshControlProps } from "react-native";
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Gradients } from "@/constants/colors";
import { useTheme } from "@/context/ThemeProvider";

/**
 * NativeWind only wires `className`/`contentContainerClassName` up to styles for
 * the components it ships with, so a third-party scroll view has to be registered
 * by hand or the classes are dropped silently. `remapProps` (rather than
 * `cssInterop`) because these classes are static — no hover/active variants that
 * would need the component to re-render on interaction state.
 */
const AwareScrollView = remapProps(KeyboardAwareScrollView, {
  className: "style",
  contentContainerClassName: "contentContainerStyle",
});

/** Gap left between the caret and the top of the keyboard. */
const CARET_CLEARANCE = 24;

/** Which screen edges get safe-area padding. */
export type ScreenEdge = "top" | "bottom";

export interface AppScreenProps {
  children: ReactNode;
  /** Wraps content in a ScrollView. Leave off for screens that own a FlatList. */
  scroll?: boolean;
  /** Paints the auth gradient instead of the flat theme background. */
  gradient?: boolean;
  /** Horizontal gutters. Turn off for full-bleed content like carousels. */
  padded?: boolean;
  /** Centres content in the remaining space — for short forms and empty states. */
  center?: boolean;
  /**
   * Lifts content above the keyboard. Only needed on screens with inputs.
   * Combined with `scroll`, the focused field is also scrolled into view — which
   * is what long forms need.
   */
  keyboardAvoiding?: boolean;
  /**
   * Edges to inset. Defaults to `["top"]`, which is what screens inside the tab
   * navigator want — the tab bar already handles the bottom. Pass
   * `["top", "bottom"]` for standalone screens like sign-in.
   */
  edges?: ScreenEdge[];
  /** Pull-to-refresh. Requires `scroll`. */
  refreshControl?: ReactElement<RefreshControlProps>;
  statusBarStyle?: StatusBarStyle;
  className?: string;
  contentClassName?: string;
}

/**
 * The frame every screen sits in.
 *
 * Exists so the four things that are easy to get subtly wrong per-screen — safe
 * area insets, keyboard avoidance, scroll behaviour, and the background — are
 * decided once here rather than copy-pasted and drifting.
 *
 * Insets come from `useSafeAreaInsets` rather than `SafeAreaView` because the
 * gradient has to extend *under* the status bar while the content stays clear of
 * it. `SafeAreaView` would inset the background too, leaving a white band.
 *
 * Keyboard handling uses `react-native-keyboard-controller` rather than React
 * Native's `KeyboardAvoidingView`, which Expo's keyboard-handling guide
 * recommends for "larger scrollable entry forms with several text input fields"
 * — the sign-up form is exactly that. It reads the native keyboard frame instead
 * of relying on Android resizing its own window, which stopped happening once
 * edge-to-edge became mandatory in SDK 54.
 */
export function AppScreen({
  children,
  scroll = false,
  gradient = false,
  padded = true,
  center = false,
  keyboardAvoiding = false,
  edges = ["top"],
  refreshControl,
  statusBarStyle = "auto",
  className = "",
  contentClassName = "",
}: AppScreenProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const insetStyle = {
    paddingTop: edges.includes("top") ? insets.top : 0,
    paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
  };

  const contentClasses = [
    padded ? "px-4" : "",
    center ? "items-center justify-center" : "",
    contentClassName,
  ]
    .filter(Boolean)
    .join(" ");

  // Shared by both scroll views. `flex-grow` (not `flex-1`) so short content can
  // still centre while long content is free to overflow and scroll.
  const scrollProps = {
    contentContainerClassName: `flex-grow ${contentClasses}`,
    // Lets a tap land on a button directly instead of being swallowed by the
    // keyboard dismissal.
    keyboardShouldPersistTaps: "handled",
    showsVerticalScrollIndicator: false,
    refreshControl,
  } as const;

  let body: ReactNode;

  if (scroll && keyboardAvoiding) {
    // The case the plain KeyboardAvoidingView cannot cover: a form long enough
    // that lifting the whole screen is not enough — the *focused* field has to be
    // scrolled into the remaining space. This does both.
    body = (
      <AwareScrollView {...scrollProps} bottomOffset={CARET_CLEARANCE}>
        {children}
      </AwareScrollView>
    );
  } else if (scroll) {
    body = <ScrollView {...scrollProps}>{children}</ScrollView>;
  } else if (keyboardAvoiding) {
    body = (
      <KeyboardAvoidingView
        // Unlike React Native's, this implementation drives the same padding from
        // the native keyboard frame on both platforms, so there is no
        // per-platform `behavior` to get wrong — which is what broke here under
        // the edge-to-edge layout that became mandatory in SDK 54.
        behavior="padding"
        style={{ flex: 1 }}
      >
        <View className={`flex-1 ${contentClasses}`}>{children}</View>
      </KeyboardAvoidingView>
    );
  } else {
    body = <View className={`flex-1 ${contentClasses}`}>{children}</View>;
  }

  if (gradient) {
    return (
      <LinearGradient
        // Picked from the theme context rather than a `dark:` class, because
        // `colors` is a real prop on the native view — NativeWind has no class to
        // drive it.
        colors={isDark ? Gradients.auth.dark : Gradients.auth.light}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <StatusBar style={statusBarStyle} />
        <View style={insetStyle} className={`flex-1 ${className}`}>
          {body}
        </View>
      </LinearGradient>
    );
  }

  return (
    <View
      style={insetStyle}
      className={`flex-1 bg-background dark:bg-background-dark ${className}`}
    >
      <StatusBar style={statusBarStyle} />
      {body}
    </View>
  );
}
