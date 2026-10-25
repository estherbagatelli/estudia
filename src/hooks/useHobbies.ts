import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { repo } from "@/repositories/base.repository";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "./useRealtimeTable";
import type { HobbyItem, HobbyKind, HobbyStatus } from "@/types/models";
import { avisar } from "@/lib/feedback";

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
    mutationFn: (v: {
      kind: HobbyKind;
      title: string;
      goalDate?: string | null;
      genre?: string | null;
      status?: HobbyStatus;
    }) =>
      hobbies.insert({
        kind: v.kind,
        title: v.title,
        goal_date: v.goalDate ?? null,
        genre: v.genre ?? null,
        status: v.status ?? "nao_iniciado",
        is_done: v.status === "concluido",
      }),
    onSuccess: avisar.adicionado,
    onSettled: settle,
  });

  const toggle = useMutation({
    mutationFn: (it: HobbyItem) => {
      const nextDone = !it.is_done;
      const nextStatus: HobbyStatus = nextDone ? "concluido" : "nao_iniciado";
      return hobbies.update(it.id, {
        is_done: nextDone,
        status: nextStatus,
        completed_at: nextDone ? new Date().toISOString() : null,
      });
    },
    onMutate: async (it) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<HobbyItem[]>(key) ?? [];
      const nextDone = !it.is_done;
      const nextStatus: HobbyStatus = nextDone ? "concluido" : "nao_iniciado";
      patch((p) =>
        p.map((x) =>
          x.id === it.id
            ? {
                ...x,
                is_done: nextDone,
                status: nextStatus,
                completed_at: nextDone ? new Date().toISOString() : null,
              }
            : x,
        ),
      );
      return { prev };
    },
    onError: (_e, _v, c) => c?.prev && qc.setQueryData(key, c.prev),
    onSettled: settle,
  });

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: HobbyStatus }) =>
      hobbies.update(v.id, {
        status: v.status,
        is_done: v.status === "concluido",
        completed_at: v.status === "concluido" ? new Date().toISOString() : null,
      }),
    onSettled: settle,
  });

  const setProgress = useMutation({
    mutationFn: (v: { id: string; season: number | null; episode: number | null }) =>
      hobbies.update(v.id, { season: v.season, episode: v.episode }),
    onSettled: settle,
  });

  const updateItem = useMutation({
    mutationFn: (v: { id: string; patch: Partial<HobbyItem> }) => hobbies.update(v.id, v.patch),
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
    onSuccess: avisar.removido,
    onSettled: settle,
  });

  return {
    items,
    isLoading: query.isLoading,
    itemsOf: (kind: HobbyKind) => items.filter((i) => i.kind === kind),
    add: (v: {
      kind: HobbyKind;
      title: string;
      goalDate?: string | null;
      genre?: string | null;
      status?: HobbyStatus;
    }) => add.mutate(v),
    toggle: (it: HobbyItem) => toggle.mutate(it),
    setStatus: (id: string, status: HobbyStatus) => setStatus.mutate({ id, status }),
    setProgress: (id: string, season: number | null, episode: number | null) =>
      setProgress.mutate({ id, season, episode }),
    updateItem: (id: string, patch: Partial<HobbyItem>) => updateItem.mutate({ id, patch }),
    remove: (id: string) => remove.mutate(id),
  };
}
