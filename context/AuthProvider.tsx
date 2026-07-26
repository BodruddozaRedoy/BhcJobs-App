import { router } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { endSession, restoreSession, startSession } from "@/services/session";
import type { JobSeeker, Session } from "@/types/auth.types";

interface AuthContextValue {
  /**
   * True until the token has been read back from secure storage on cold start.
   * Anything that branches on auth should wait for this, or it will briefly treat
   * a signed-in user as a guest.
   */
  isRestoring: boolean;
  isAuthenticated: boolean;
  user: JobSeeker | null;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isRestoring, setIsRestoring] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<JobSeeker | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Rehydrate on mount. `restoreSession` also pushes the token into the axios
    // interceptor, so requests are authenticated from here on.
    restoreSession()
      .then((restored) => {
        if (!cancelled) setToken(restored);
      })
      .finally(() => {
        if (!cancelled) setIsRestoring(false);
      });

    // Guards against setting state after unmount if the keychain read is slow.
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (session: Session) => {
    await startSession(session.token);
    setToken(session.token);
    setUser(session.user ?? null);
  }, []);

  const signOut = useCallback(async () => {
    // Clear local state first so the UI updates immediately; wiping the keychain
    // takes a moment and the user should not sit on an authenticated screen.
    setToken(null);
    setUser(null);
    await endSession();
    router.replace("/(auth)/login");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isRestoring,
      isAuthenticated: Boolean(token),
      user,
      signIn,
      signOut,
    }),
    [isRestoring, token, user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
