import { supabase } from "@/lib/supabase/client";
import { BaseRepository } from "./base.repository";
import type { ShoppingItem, ShoppingList } from "@/types/models";

class ShoppingListsRepository extends BaseRepository<"shopping_lists"> {
  constructor() {
    super("shopping_lists");
  }

  /**
   * Return the user's default shopping list, creating it on first use.
   * The /mercado screen uses a single implicit list.
   */
  async getOrCreateDefault(userId: string): Promise<ShoppingList> {
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (data) return data as ShoppingList;

    return this.create({ user_id: userId, name: "Mercado", is_default: true });
  }
}

class ShoppingItemsRepository extends BaseRepository<"shopping_items"> {
  constructor() {
    super("shopping_items");
  }

  /** Active items for a list, in insertion order. */
  async listForList(userId: string, listId: string): Promise<ShoppingItem[]> {
    const { data, error } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("user_id", userId)
      .eq("list_id", listId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as ShoppingItem[];
  }
}

export const shoppingListsRepository = new ShoppingListsRepository();
export const shoppingItemsRepository = new ShoppingItemsRepository();
