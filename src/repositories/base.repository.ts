import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type PublicTables = Database["public"]["Tables"];
type TableName = keyof PublicTables;

/**
 * Generic, soft-delete-aware repository over a single table.
 *
 * All reads exclude rows where `deleted_at is not null`. `remove()` performs a
 * soft delete (sets `deleted_at`). RLS guarantees a user only ever sees/edits
 * their own rows, but we still scope by `user_id` explicitly for clarity and
 * to keep realtime/optimistic caches partitioned per user.
 *
 * The `as any` casts are confined to this file: Supabase cannot infer a table
 * name that is only known via a generic. Every public method returns fully
 * typed Row/Insert/Update shapes, so callers stay `any`-free.
 */
export class BaseRepository<T extends TableName> {
  constructor(
    protected readonly table: T,
    /** Owner column. `profiles` is keyed by `id`; everything else by `user_id`. */
    protected readonly ownerColumn: "user_id" | "id" = "user_id",
  ) {}

  // Supabase cannot type a table name that is only known via a generic, so the
  // builder is intentionally untyped here. Every public method re-applies the
  // correct Row/Insert/Update types, keeping callers fully `any`-free.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected get db(): any {
    return supabase.from(this.table as never);
  }

  /** List active rows for a user, optionally ordered. */
  async list(
    userId: string,
    opts?: { orderBy?: string; ascending?: boolean },
  ): Promise<PublicTables[T]["Row"][]> {
    let query = this.db
      .select("*")
      .eq(this.ownerColumn, userId)
      .is("deleted_at", null);

    if (opts?.orderBy) {
      query = query.order(opts.orderBy, { ascending: opts.ascending ?? true });
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as PublicTables[T]["Row"][];
  }

  async getById(id: string): Promise<PublicTables[T]["Row"] | null> {
    const { data, error } = await this.db
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    return (data ?? null) as PublicTables[T]["Row"] | null;
  }

  async create(
    payload: PublicTables[T]["Insert"],
  ): Promise<PublicTables[T]["Row"]> {
    const { data, error } = await this.db
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(payload as any)
      .select("*")
      .single();
    if (error) throw error;
    return data as PublicTables[T]["Row"];
  }

  async update(
    id: string,
    patch: PublicTables[T]["Update"],
  ): Promise<PublicTables[T]["Row"]> {
    const { data, error } = await this.db
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(patch as any)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data as PublicTables[T]["Row"];
  }

  /** Soft delete: mark the row deleted rather than removing it. */
  async remove(id: string): Promise<void> {
    const { error } = await this.db
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) throw error;
  }

  /** Permanently delete (rarely needed; prefer `remove`). */
  async hardDelete(id: string): Promise<void> {
    const { error } = await this.db.delete().eq("id", id);
    if (error) throw error;
  }
}
