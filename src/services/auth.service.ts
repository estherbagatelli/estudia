import { supabase } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

/** Where OAuth / password-recovery links return the user. */
function redirectTo(path = "/auth/callback"): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${path}`;
}

export const authService = {
  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthStateChange(cb: (session: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
    return () => data.subscription.unsubscribe();
  },

  async signInWithPassword(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },

  async signUp(email: string, password: string, fullName?: string): Promise<User | null> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo(),
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
    if (error) throw error;
    return data.user;
  },

  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) throw error;
  },

  /**
   * Passwordless login via magic link. Sends an e-mail with a sign-in link;
   * clicking it returns to the app and the session is established
   * automatically (detectSessionInUrl). Works for both new and existing users
   * (`shouldCreateUser: true`) and needs no custom SMTP.
   */
  async sendMagicLink(email: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo("/"),
      },
    });
    if (error) throw error;
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /** Send a password-recovery email. */
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo("/auth/reset"),
    });
    if (error) throw error;
  },

  /** Set a new password for the currently-authenticated (recovery) session. */
  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },
};
