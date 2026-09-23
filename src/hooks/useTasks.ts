import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { repo } from "@/repositories/base.repository";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "./useRealtimeTable";
import type { Task } from "@/types/models";

const tasks = repo("tasks");

/** /tarefas — relational, optimistic toggles/removes, realtime. */
export function useTasks() {
  const { user } = useAuth();
  const userId = user?.id;
  const qc = useQueryClient();
  const key = queryKeys.tasks(userId ?? "anon");

  const query = useQuery({
    queryKey: key,
    queryFn: () => tasks.list("created_at", false),
    enabled: !!userId,
    retry: 2,
  });
  useRealtimeTable("tasks", userId, [key]);

  const patch = (fn: (p: Task[]) => Task[]) =>
    qc.setQueryData<Task[]>(key, (p) => fn(p ?? []));
  const settle = () => qc.invalidateQueries({ queryKey: key });

  const add = useMutation({
    mutationFn: (title: string) => tasks.insert({ title }),
    onSettled: settle,
  });
  const toggle = useMutation({
    mutationFn: (t: Task) => tasks.update(t.id, { is_done: !t.is_done }),
    onMutate: async (t) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Task[]>(key) ?? [];
      patch((p) => p.map((x) => (x.id === t.id ? { ...x, is_done: !x.is_done } : x)));
      return { prev };
    },
    onError: (_e, _v, c) => c?.prev && qc.setQueryData(key, c.prev),
    onSettled: settle,
  });
  const remove = useMutation({
    mutationFn: (id: string) => tasks.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Task[]>(key) ?? [];
      patch((p) => p.filter((x) => x.id !== id));
      return { prev };
    },
    onError: (_e, _v, c) => c?.prev && qc.setQueryData(key, c.prev),
    onSettled: settle,
  });

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    add: (title: string) => add.mutate(title),
    toggle: (t: Task) => toggle.mutate(t),
    remove: (id: string) => remove.mutate(id),
  };
}
