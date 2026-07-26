/**
 * Raw color palette — the single source of truth for app colors.
 *
 * This module must stay free of any `react-native` import: it is loaded both by
 * the app bundle AND by `tailwind.config.ts`, which runs in plain Node where
 * React Native's Flow-typed source cannot be parsed.
 */

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

/**
 * Primary brand color. `DEFAULT` is the app's primary; `dark` is the shade used
 * for pressed states and for the `dark:` variant, where the base tone is a touch
 * bright against a black surface.
 */
export const Brand = {
  DEFAULT: '#3b82f6',
  dark: '#2563eb',
} as const;

/**
 * Multi-stop gradients, typed as the tuple `expo-linear-gradient` expects (at
 * least two stops). Kept here so the auth screens cannot drift apart.
 */
export const Gradients = {
  /** Diagonal blue → near-white wash behind the sign-in and register cards. */
  auth: ['#93c5fd', '#dbeafe', '#f8fafc'],
} as const satisfies Record<string, readonly [string, string, ...string[]]>;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
