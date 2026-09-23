import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { tasksRepository } from "@/repositories/tasks.repository";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "./useRealtimeTable";
import type { Task } from "@/types/models";

/**
 * Tasks data layer for /tarefas — relational, with optimistic updates,
 * automatic retry, error handling and realtime sync across devices.
 */
export function useTasks() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const key = queryKeys.tasks(userId ?? "anon");

  const query = useQuery({
    queryKey: key,
    queryFn: () => tasksRepository.listForUser(userId!),
    enabled: !!userId,
    retry: 2,
  });

  useRealtimeTable("tasks", userId, [key]);

  const setCache = (updater: (prev: Task[]) => Task[]) =>
    queryClient.setQueryData<Task[]>(key, (prev) => updater(prev ?? []));

  const addTask = useMutation({
    mutationFn: (title: string) =>
      tasksRepository.create({ user_id: userId!, title, done: false }),
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Task[]>(key) ?? [];
      const now = new Date().toISOString();
      const optimistic: Task = {
        id: `optimistic-${crypto.randomUUID()}`,
        user_id: userId!,
        category_id: null,
        title,
        notes: null,
        done: false,
        priority: 0,
        due_date: null,
        position: 0,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      setCache((prev) => [optimistic, ...prev]);
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const toggleTask = useMutation({
    mutationFn: (task: Task) => tasksRepository.update(task.id, { done: !task.done }),
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Task[]>(key) ?? [];
      setCache((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const removeTask = useMutation({
    mutationFn: (id: string) => tasksRepository.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Task[]>(key) ?? [];
      setCache((prev) => prev.filter((t) => t.id !== id));
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    add: (title: string) => addTask.mutate(title),
    toggle: (task: Task) => toggleTask.mutate(task),
    remove: (id: string) => removeTask.mutate(id),
  };
}
