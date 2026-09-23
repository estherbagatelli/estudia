import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/types/database.types";

/**
 * Key/value store (one row per user+key) used to persist the nested UI state
 * that used to live in localStorage: treino, dieta, estudos, hobbies,
 * financeiro. Values are arbitrary JSON, mirroring the old `useLocalStorage`.
 */
class PlannerSettingsRepository {
  /** Read a single setting's value, or null if it doesn't exist yet. */
  async get<T = Json>(userId: string, key: string): Promise<T | null> {
    const { data, error } = await supabase
      .from("planner_settings")
      .select("value")
      .eq("user_id", userId)
      .eq("key", key)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    return data ? (data.value as T) : null;
  }

  /** Read every setting for a user as a plain object keyed by `key`. */
  async getAll(userId: string): Promise<Record<string, Json>> {
    const { data, error } = await supabase
      .from("planner_settings")
      .select("key, value")
      .eq("user_id", userId)
      .is("deleted_at", null);
    if (error) throw error;
    const out: Record<string, Json> = {};
    for (const row of data ?? []) out[row.key] = row.value;
    return out;
  }

  /** Insert or update a setting (unique on user_id + key). */
  async set(userId: string, key: string, value: Json): Promise<void> {
    const { error } = await supabase
      .from("planner_settings")
      .upsert(
        { user_id: userId, key, value, deleted_at: null },
        { onConflict: "user_id,key" },
      );
    if (error) throw error;
  }
}

export const plannerSettingsRepository = new PlannerSettingsRepository();
