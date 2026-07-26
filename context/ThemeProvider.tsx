import { colorScheme, useColorScheme } from "nativewind";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { StorageKeys } from "@/services/storage/keys";
import * as mmkv from "@/services/storage/mmkv";

/** `system` defers to the OS; the other two are explicit user overrides. */
export type ThemeMode = "light" | "dark" | "system";

/**
 * The app opens in light mode. NativeWind's own default is `system`, so this has
 * to be set explicitly — otherwise a user whose phone is in dark mode would get a
 * dark first launch, which is not what the design specifies.
 */
const DEFAULT_MODE: ThemeMode = "light";

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === "light" || value === "dark" || value === "system";

/**
 * Saved preference, resolved once when this module is first imported.
 *
 * Both the read and the `colorScheme.set` happen at module scope, deliberately:
 *
 *   - Not in an effect, because effects run *after* the first paint — long enough
 *     to show a visible flash of the wrong theme. MMKV's synchronous reads are
 *     what make an earlier read possible at all.
 *   - Not during render either. `colorScheme.set` notifies every `useColorScheme`
 *     subscriber, and doing that while React is rendering triggers "Can't perform
 *     a React state update on a component that hasn't mounted yet" — a state
 *     update on a component that is still being built.
 *
 * At module-evaluation time no component is rendering and nothing is subscribed
 * yet, so the write is both safe and early enough to avoid the flash.
 */
const INITIAL_MODE: ThemeMode = (() => {
  const stored = mmkv.getString(StorageKeys.THEME);
  return isThemeMode(stored) ? stored : DEFAULT_MODE;
})();

colorScheme.set(INITIAL_MODE);

interface ThemeContextValue {
  /** What the user chose — may be `system`. */
  mode: ThemeMode;
  /** What is actually rendered right now; never `system`. */
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  /** Flips between light and dark, resolving `system` to its current value first. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(INITIAL_MODE);
  // Subscribing to the resolved scheme keeps `isDark` correct even in `system`
  // mode, where the OS can change it without the app doing anything.
  const { colorScheme: active } = useColorScheme();

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    colorScheme.set(next);
    mmkv.set(StorageKeys.THEME, next);
  }, []);

  const toggle = useCallback(() => {
    // In `system` mode, "toggle" has to mean "override whatever it currently
    // resolves to" — reading the live value avoids switching to the scheme the
    // user is already looking at.
    const current = colorScheme.get();
    setMode(current === "dark" ? "light" : "dark");
  }, [setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, isDark: active === "dark", setMode, toggle }),
    [mode, active, setMode, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}
