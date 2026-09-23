import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Single browser Supabase client.
 *
 * This app is a TanStack Start (SSR) project but the data layer is
 * client-centric: every query is gated on an authenticated session, which
 * only exists in the browser. During SSR there is no `window`, so we hand the
 * auth module an in-memory storage shim and disable persistence — the real
 * session is hydrated on the client.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Fail loudly and early with an actionable message instead of a cryptic
  // "fetch failed" later on.
  throw new Error(
    "[supabase] Missing env vars. Create a `.env` file with VITE_SUPABASE_URL " +
      "and VITE_SUPABASE_ANON_KEY (see .env.example).",
  );
}

const isBrowser = typeof window !== "undefined";

// No-op storage used during SSR so `createClient` never touches localStorage.
const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

let client: SupabaseClient<Database> | undefined;

export function getSupabase(): SupabaseClient<Database> {
  if (!client) {
    client = createClient<Database>(url!, anonKey!, {
      auth: {
        persistSession: isBrowser,
        autoRefreshToken: isBrowser,
        detectSessionInUrl: isBrowser,
        storage: isBrowser ? window.localStorage : memoryStorage,
        storageKey: "estudia.auth",
        // Implicit flow: the magic-link e-mail delivers the session in the URL
        // itself, so clicking the link from any browser/device (e.g. the iOS
        // Mail app opening a fresh Safari view) establishes the session.
        // PKCE would tie the link to the exact tab that requested it and fail
        // on mobile e-mail clients.
        flowType: "implicit",
      },
    });
  }
  return client;
}

/** Convenience singleton for direct imports. */
export const supabase = getSupabase();
