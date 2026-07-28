export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
  },

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

export const Gradients = {
  /** Diagonal wash behind the sign-in and register cards. */
  auth: {
    /** blue-300 → blue-100 → slate-50. */
    light: ["#93c5fd", "#dbeafe", "#f8fafc"],
    /** gray-600 → gray-800 → gray-900, landing on `Colors.dark.background`. */
    dark: ["#4b5563", "#1f2937", "#111827"],
  },
  homeBanner: {
    /** blue-600 → blue-500 → blue-400. */
    light: ["#2563eb", "#3b82f6", "#60a5fa"],
    /** gray-700 → gray-800. */
    dark: ["#374151", "#1f2937"],
  },
} as const satisfies Record<string, Record<"light" | "dark", GradientStops>>;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
