import { LinearGradient } from "expo-linear-gradient";
import { StatusBar, type StatusBarStyle } from "expo-status-bar";
import type { ReactElement, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type RefreshControlProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Gradients } from "@/constants/colors";

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
  /** Lifts content above the keyboard. Only needed on screens with inputs. */
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

  const content = scroll ? (
    <ScrollView
      // `flex-grow` (not `flex-1`) so short content can still centre while long
      // content is free to overflow and scroll.
      contentContainerClassName={`flex-grow ${contentClasses}`}
      // Lets a tap land on a button directly instead of being swallowed by the
      // keyboard dismissal.
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${contentClasses}`}>{children}</View>
  );

  const body = keyboardAvoiding ? (
    <KeyboardAvoidingView
      // iOS overlays the keyboard, so the view must shrink by its height. Android
      // already resizes the window; "padding" there would double-count and leave
      // a gap above the keyboard.
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={Gradients.auth}
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
