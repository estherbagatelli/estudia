import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";
import { authService } from "@/services/auth.service";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  /** True until the initial session has been resolved (avoids auth flicker). */
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<User | null>;
  signInWithGoogle: () => Promise<void>;
  /** Passwordless: send a magic sign-in link to the e-mail. */
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    authService
      .getSession()
      .then((s) => {
        if (active) {
          setSession(s);
          lastUserId.current = s?.user?.id ?? null;
        }
      })
      .catch(() => {
        // ignore — treated as logged out
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const unsubscribe = authService.onAuthStateChange((s) => {
      setSession(s);
      // Only drop cached data when the *identity* changes (login / logout /
      // switch account) — not on routine token refreshes, which would
      // needlessly refetch and wipe optimistic state.
      const nextId = s?.user?.id ?? null;
      if (nextId !== lastUserId.current) {
        lastUserId.current = nextId;
        queryClient.clear();
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signInWithPassword: async (email, password) => {
        await authService.signInWithPassword(email, password);
      },
      signUp: (email, password, fullName) => authService.signUp(email, password, fullName),
      signInWithGoogle: () => authService.signInWithGoogle(),
      sendMagicLink: (email) => authService.sendMagicLink(email),
      signOut: () => authService.signOut(),
      resetPassword: (email) => authService.resetPassword(email),
      updatePassword: (password) => authService.updatePassword(password),
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
