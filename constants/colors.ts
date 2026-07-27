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
   * Left-to-right wash behind the home banner.
   *
   * Dark mode desaturates onto the same `gray` ramp as every other surface, rather
   * than staying blue — the banner reads as part of the page, not as a lit panel
   * sitting on it.
   *
   * It stops at gray-800 rather than continuing to gray-900 on purpose: the wave
   * below is filled with the page background (gray-900), so a gradient that reached
   * the same value would make the wave vanish into it.
   */
  homeBanner: {
    /** blue-600 → blue-500 → blue-400. */
    light: ["#2563eb", "#3b82f6", "#60a5fa"],
    /** gray-700 → gray-800. */
    dark: ["#374151", "#1f2937"],
  },
} as const satisfies Record<string, Record<"light" | "dark", GradientStops>>;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
