/**
 * Raw color palette — the single source of truth for app colors.
 *
 * This module must stay free of any `react-native` import: it is loaded both by
 * the app bundle AND by `tailwind.config.ts`, which runs in plain Node where
 * React Native's Flow-typed source cannot be parsed.
 */

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
  },
  /**
   * The Tailwind `gray` ramp — faintly blue-tinted, so the brand blue reads as an
   * accent rather than as a colour borrowed from another palette. The three
   * surfaces step apart far enough to stack legibly: page, then the card on it,
   * then the inputs inside the card.
   */
  dark: {
    text: "#ffffff",
    /** gray-900 — page, header, tab bar. */
    background: "#111827",
    /** gray-800 — cards, modals, and other raised surfaces. */
    backgroundElement: "#1f2937",
    /** gray-600 — inputs, and pressed/selected states. */
    backgroundSelected: "#4b5563",
    /** gray-400 */
    textSecondary: "#9ca3af",
  },
} as const;

/**
 * Primary brand color. `DEFAULT` is the app's primary; `dark` is the shade used
 * for pressed states and for the `dark:` variant, where the base tone is a touch
 * bright against a black surface.
 */
export const Brand = {
  DEFAULT: "#3b82f6",
  dark: "#2563eb",
} as const;

/** The tuple `expo-linear-gradient` expects — at least two stops. */
type GradientStops = readonly [string, string, ...string[]];

/**
 * Multi-stop gradients, one variant per colour scheme. Kept here so the auth
 * screens cannot drift apart.
 *
 * Both variants run saturated blue → mid tone → the flat page background of their
 * scheme, so the wash resolves into `Colors.<scheme>.background` at the bottom
 * instead of ending on a visible seam.
 */
export const Gradients = {
  /** Diagonal wash behind the sign-in and register cards. */
  auth: {
    /** blue-300 → blue-100 → slate-50. */
    light: ["#93c5fd", "#dbeafe", "#f8fafc"],
    /** gray-600 → gray-800 → gray-900, landing on `Colors.dark.background`. */
    dark: ["#4b5563", "#1f2937", "#111827"],
  },
  /**
   * Left-to-right blue behind the home banner. Stays blue in dark mode rather
   * than desaturating with the rest of the UI: it is the one deliberately branded
   * surface in the app, and the white headline needs the same contrast in both
   * schemes. Dark simply drops two rungs down the blue ramp.
   */
  homeBanner: {
    /** blue-600 → blue-500 → blue-400. */
    light: ["#2563eb", "#3b82f6", "#60a5fa"],
    /** blue-900 → blue-800 → blue-700. */
    dark: ["#1e3a8a", "#1e40af", "#1d4ed8"],
  },
} as const satisfies Record<string, Record<"light" | "dark", GradientStops>>;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
