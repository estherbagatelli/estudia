import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type TableName = keyof Database["public"]["Tables"];
type Row<K extends TableName> = Database["public"]["Tables"][K]["Row"];
type Ins<K extends TableName> = Database["public"]["Tables"][K]["Insert"];
type Upd<K extends TableName> = Database["public"]["Tables"][K]["Update"];

/**
 * Typed CRUD helper for a single table.
 *
 * Ownership is handled by the database: `owner_id` defaults to `auth.uid()` on
 * insert and RLS scopes every read/write to the current user — so callers pass
 * only business fields, never the owner. No soft delete (hard `delete`).
 *
 * The `as any` casts are confined here (Supabase can't type a table name known
 * only via a generic); every method returns fully typed Rows.
 */
export function repo<K extends TableName>(table: K) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = () => supabase.from(table as any) as any;

  return {
    async list(orderBy = "position", ascending = true): Promise<Row<K>[]> {
      const { data, error } = await db().select("*").order(orderBy, { ascending });
      if (error) throw error;
      return (data ?? []) as Row<K>[];
    },

    async listWhere(
      column: string,
      value: string,
      orderBy = "position",
      ascending = true,
    ): Promise<Row<K>[]> {
      const { data, error } = await db()
        .select("*")
        .eq(column, value)
        .order(orderBy, { ascending });
      if (error) throw error;
      return (data ?? []) as Row<K>[];
    },

    async insert(values: Ins<K>): Promise<Row<K>> {
      const { data, error } = await db().insert(values).select("*").single();
      if (error) throw error;
      return data as Row<K>;
    },

    async insertMany(values: Ins<K>[]): Promise<Row<K>[]> {
      if (values.length === 0) return [];
      const { data, error } = await db().insert(values).select("*");
      if (error) throw error;
      return (data ?? []) as Row<K>[];
    },

    async update(id: string, patch: Upd<K>): Promise<Row<K>> {
      const { data, error } = await db().update(patch).eq("id", id).select("*").single();
      if (error) throw error;
      return data as Row<K>;
    },

    async remove(id: string): Promise<void> {
      const { error } = await db().delete().eq("id", id);
      if (error) throw error;
    },
  };
}
