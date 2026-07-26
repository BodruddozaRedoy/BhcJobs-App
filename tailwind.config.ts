// Import from `constants/colors` — NOT `constants/theme`, which imports
// react-native and cannot be parsed by the Node process that loads this config.
const { Brand, Colors } = require("./constants/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Semantic color tokens, generated from `constants/theme.ts` so the palette
      // has a single source of truth.
      //
      // Each token exposes a light default plus a `-dark` shade, so dark mode is
      // written as an explicit variant at the call site:
      //   <View className="bg-background dark:bg-background-dark" />
      colors: {
        brand: Brand,
        background: {
          DEFAULT: Colors.light.background,
          dark: Colors.dark.background,
        },
        element: {
          DEFAULT: Colors.light.backgroundElement,
          dark: Colors.dark.backgroundElement,
        },
        selected: {
          DEFAULT: Colors.light.backgroundSelected,
          dark: Colors.dark.backgroundSelected,
        },
        content: {
          DEFAULT: Colors.light.text,
          dark: Colors.dark.text,
        },
        muted: {
          DEFAULT: Colors.light.textSecondary,
          dark: Colors.dark.textSecondary,
        },
      },
    },
  },
  plugins: [],
};
