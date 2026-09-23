import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { repo } from "@/repositories/base.repository";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "./useRealtimeTable";
import type { HobbyItem, HobbyKind } from "@/types/models";

const hobbies = repo("hobby_items");

export const HOBBY_KINDS: { kind: HobbyKind; label: string }[] = [
  { kind: "filme", label: "Filmes" },
  { kind: "serie", label: "Séries" },
  { kind: "anime", label: "Animes" },
  { kind: "livro", label: "Livros" },
];

/** /hobbies — hobby_items agrupados por tipo (filme/serie/anime/livro). */
export function useHobbies() {
  const { user } = useAuth();
  const userId = user?.id;
  const qc = useQueryClient();
  const key = queryKeys.hobbies(userId ?? "anon");

  const query = useQuery({
    queryKey: key,
    queryFn: () => hobbies.list("created_at", true),
    enabled: !!userId,
  });
  useRealtimeTable("hobby_items", userId, [key]);

  const items = query.data ?? [];
  const settle = () => qc.invalidateQueries({ queryKey: key });
  const patch = (fn: (p: HobbyItem[]) => HobbyItem[]) =>
    qc.setQueryData<HobbyItem[]>(key, (p) => fn(p ?? []));

  const add = useMutation({
    mutationFn: (v: { kind: HobbyKind; title: string }) =>
      hobbies.insert({ kind: v.kind, title: v.title }),
    onSettled: settle,
  });
  const toggle = useMutation({
    mutationFn: (it: HobbyItem) => hobbies.update(it.id, { is_done: !it.is_done }),
    onMutate: async (it) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<HobbyItem[]>(key) ?? [];
      patch((p) => p.map((x) => (x.id === it.id ? { ...x, is_done: !x.is_done } : x)));
      return { prev };
    },
    onError: (_e, _v, c) => c?.prev && qc.setQueryData(key, c.prev),
    onSettled: settle,
  });
  const setProgress = useMutation({
    mutationFn: (v: { id: string; season: number | null; episode: number | null }) =>
      hobbies.update(v.id, { season: v.season, episode: v.episode }),
    onSettled: settle,
  });
  const remove = useMutation({
    mutationFn: (id: string) => hobbies.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<HobbyItem[]>(key) ?? [];
      patch((p) => p.filter((x) => x.id !== id));
      return { prev };
    },
    onError: (_e, _v, c) => c?.prev && qc.setQueryData(key, c.prev),
    onSettled: settle,
  });

  return {
    isLoading: query.isLoading,
    itemsOf: (kind: HobbyKind) => items.filter((i) => i.kind === kind),
    add: (kind: HobbyKind, title: string) => add.mutate({ kind, title }),
    toggle: (it: HobbyItem) => toggle.mutate(it),
    setProgress: (id: string, season: number | null, episode: number | null) =>
      setProgress.mutate({ id, season, episode }),
    remove: (id: string) => remove.mutate(id),
  };
}
