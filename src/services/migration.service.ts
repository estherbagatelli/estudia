import { supabase } from "@/lib/supabase/client";
import { plannerSettingsRepository } from "@/repositories/planner-settings.repository";
import { shoppingListsRepository } from "@/repositories/shopping.repository";
import type { Json } from "@/types/database.types";

/**
 * One-time migration of the pre-Supabase localStorage data into the database.
 *
 * Runs once per user (guarded by a planner_settings flag). The relational
 * features (tarefas -> tasks, mercado -> shopping_items) are expanded into
 * rows; the nested-blob features keep their exact JSON shape in
 * planner_settings under the SAME keys the UI already uses, so the components
 * read them back unchanged.
 */

const MIGRATION_FLAG = "__migration.localStorage.v1";

// localStorage keys whose JSON blob is copied verbatim into planner_settings.
const KV_KEYS = [
  "treino.v1",
  "treino.done.v1",
  "dieta.v1",
  "hobbies.v1",
  "estudos.order",
  "estudos.faculdade",
  "estudos.faculdade.done",
  "estudos.estagio",
  "estudos.estagio.done",
  "fin.cats.v1",
  "fin.budgets.v1",
  "fin.expenses.v1",
];

type LegacyTask = { id: string; text: string; done: boolean };
type LegacyItem = { id: string; name: string; qty: string; checked: boolean };

function readLS<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export const migrationService = {
  /** Idempotent. Safe to call on every app boot; exits fast once migrated. */
  async run(userId: string): Promise<void> {
    if (typeof window === "undefined") return;

    // Already migrated for this user?
    const done = await plannerSettingsRepository.get<boolean>(userId, MIGRATION_FLAG);
    if (done) return;

    // 1. tarefas.v1 -> tasks
    const tasks = readLS<LegacyTask[]>("tarefas.v1");
    if (tasks?.length) {
      const rows = tasks
        .filter((t) => t?.text?.trim())
        .map((t) => ({ user_id: userId, title: t.text, done: !!t.done }));
      if (rows.length) {
        const { error } = await supabase.from("tasks").insert(rows);
        if (error) throw error;
      }
    }

    // 2. mercado.v1 -> shopping_items (in the default list)
    const items = readLS<LegacyItem[]>("mercado.v1");
    if (items?.length) {
      const list = await shoppingListsRepository.getOrCreateDefault(userId);
      const rows = items
        .filter((i) => i?.name?.trim())
        .map((i) => ({
          user_id: userId,
          list_id: list.id,
          name: i.name,
          quantity: i.qty || "1",
          checked: !!i.checked,
        }));
      if (rows.length) {
        const { error } = await supabase.from("shopping_items").insert(rows);
        if (error) throw error;
      }
    }

    // 3. Nested blobs -> planner_settings (verbatim)
    for (const key of KV_KEYS) {
      const value = readLS<Json>(key);
      if (value !== null) {
        await plannerSettingsRepository.set(userId, key, value);
      }
    }

    // 4. Mark done so this never runs again for this user.
    await plannerSettingsRepository.set(userId, MIGRATION_FLAG, true);
  },
};
