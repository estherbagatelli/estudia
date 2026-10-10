import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Session, User } from "@supabase/supabase-js";

import { authService } from "@/services/auth.service";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;

  signInWithPassword: (email: string, password: string) => Promise<void>;

  signUp: (email: string, password: string, fullName?: string) => Promise<User | null>;

  signInWithGoogle: () => Promise<void>;

  sendMagicLink: (email: string) => Promise<void>;

  signOut: () => Promise<void>;

  resetPassword: (email: string) => Promise<void>;

  updatePassword: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  const [loading, setLoading] = useState(true);

  /**
   * Prevents the auth listener from clearing data
   * unnecessarily during the initial session load.
   */
  const initialized = useRef(false);

  useEffect(() => {
    let active = true;

    const unsubscribe = authService.onAuthStateChange((nextSession) => {
      if (!active) {
        return;
      }

      setSession(nextSession);

      /**
       * Once Supabase reports an auth state,
       * the initial auth check is considered resolved.
       */
      setLoading(false);
    });

    async function initialize() {
      try {
        const currentSession = await authService.getSession();

        if (!active) {
          return;
        }

        setSession(currentSession);
        initialized.current = true;
      } catch (error) {
        if (!active) {
          return;
        }

        console.error("Erro ao recuperar sessão:", error);

        setSession(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

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
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
