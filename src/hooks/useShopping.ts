import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { repo } from "@/repositories/base.repository";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "./useRealtimeTable";
import type { ShoppingItem } from "@/types/models";

const items = repo("shopping_items");

/** /mercado — relational, optimistic, realtime. */
export function useShopping() {
  const { user } = useAuth();
  const userId = user?.id;
  const qc = useQueryClient();
  const key = queryKeys.shopping(userId ?? "anon");

  const query = useQuery({
    queryKey: key,
    queryFn: () => items.list("created_at", true),
    enabled: !!userId,
    retry: 2,
  });
  useRealtimeTable("shopping_items", userId, [key]);

  const patch = (fn: (p: ShoppingItem[]) => ShoppingItem[]) =>
    qc.setQueryData<ShoppingItem[]>(key, (p) => fn(p ?? []));
  const settle = () => qc.invalidateQueries({ queryKey: key });

  const add = useMutation({
    mutationFn: (v: { name: string; quantity: number }) =>
      items.insert({ name: v.name, quantity: v.quantity }),
    onSettled: settle,
  });
  const toggle = useMutation({
    mutationFn: (it: ShoppingItem) => items.update(it.id, { is_checked: !it.is_checked }),
    onMutate: async (it) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<ShoppingItem[]>(key) ?? [];
      patch((p) => p.map((x) => (x.id === it.id ? { ...x, is_checked: !x.is_checked } : x)));
      return { prev };
    },
    onError: (_e, _v, c) => c?.prev && qc.setQueryData(key, c.prev),
    onSettled: settle,
  });
  const remove = useMutation({
    mutationFn: (id: string) => items.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<ShoppingItem[]>(key) ?? [];
      patch((p) => p.filter((x) => x.id !== id));
      return { prev };
    },
    onError: (_e, _v, c) => c?.prev && qc.setQueryData(key, c.prev),
    onSettled: settle,
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    add: (name: string, quantity: number) => add.mutate({ name, quantity }),
    toggle: (it: ShoppingItem) => toggle.mutate(it),
    remove: (id: string) => remove.mutate(id),
  };
}
