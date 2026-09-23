import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  shoppingItemsRepository,
  shoppingListsRepository,
} from "@/repositories/shopping.repository";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "./useRealtimeTable";
import type { ShoppingItem } from "@/types/models";

/**
 * Shopping data layer for /mercado — a single default list plus its items,
 * relational with optimistic updates and realtime sync.
 */
export function useShopping() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: queryKeys.shoppingList(userId ?? "anon"),
    queryFn: () => shoppingListsRepository.getOrCreateDefault(userId!),
    enabled: !!userId,
    retry: 2,
  });
  const listId = listQuery.data?.id;

  const itemsKey = queryKeys.shoppingItems(userId ?? "anon", listId ?? "none");
  const itemsQuery = useQuery({
    queryKey: itemsKey,
    queryFn: () => shoppingItemsRepository.listForList(userId!, listId!),
    enabled: !!userId && !!listId,
    retry: 2,
  });

  useRealtimeTable("shopping_items", userId, [itemsKey]);

  const setCache = (updater: (prev: ShoppingItem[]) => ShoppingItem[]) =>
    queryClient.setQueryData<ShoppingItem[]>(itemsKey, (prev) => updater(prev ?? []));

  const add = useMutation({
    mutationFn: (input: { name: string; quantity: string }) =>
      shoppingItemsRepository.create({
        user_id: userId!,
        list_id: listId!,
        name: input.name,
        quantity: input.quantity || "1",
        checked: false,
      }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: itemsKey });
      const previous = queryClient.getQueryData<ShoppingItem[]>(itemsKey) ?? [];
      const now = new Date().toISOString();
      const optimistic: ShoppingItem = {
        id: `optimistic-${crypto.randomUUID()}`,
        user_id: userId!,
        list_id: listId!,
        name: input.name,
        quantity: input.quantity || "1",
        checked: false,
        position: 0,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      setCache((prev) => [...prev, optimistic]);
      return { previous };
    },
    onError: (_e, _v, ctx) => ctx?.previous && queryClient.setQueryData(itemsKey, ctx.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: itemsKey }),
  });

  const toggle = useMutation({
    mutationFn: (item: ShoppingItem) =>
      shoppingItemsRepository.update(item.id, { checked: !item.checked }),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: itemsKey });
      const previous = queryClient.getQueryData<ShoppingItem[]>(itemsKey) ?? [];
      setCache((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => ctx?.previous && queryClient.setQueryData(itemsKey, ctx.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: itemsKey }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => shoppingItemsRepository.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: itemsKey });
      const previous = queryClient.getQueryData<ShoppingItem[]>(itemsKey) ?? [];
      setCache((prev) => prev.filter((i) => i.id !== id));
      return { previous };
    },
    onError: (_e, _v, ctx) => ctx?.previous && queryClient.setQueryData(itemsKey, ctx.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: itemsKey }),
  });

  return {
    items: itemsQuery.data ?? [],
    isLoading: listQuery.isLoading || itemsQuery.isLoading,
    isError: listQuery.isError || itemsQuery.isError,
    add: (name: string, quantity: string) => add.mutate({ name, quantity }),
    toggle: (item: ShoppingItem) => toggle.mutate(item),
    remove: (id: string) => remove.mutate(id),
  };
}
