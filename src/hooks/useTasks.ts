import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { repo } from "@/repositories/base.repository";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "./useRealtimeTable";
import type { Task } from "@/types/models";
import type { TarefaCategoria, TarefaPrioridade, TarefaStatus } from "@/lib/tasks-utils";

const tasksRepo = repo("tasks");

export type NovaTarefa = {
  title: string;
  due_date: string | null;
  priority: TarefaPrioridade;
  status: TarefaStatus;
  kind: TarefaCategoria | null;
  is_academic: boolean;
  track_id: string | null;
};

export type EdicaoTarefa = NovaTarefa & {
  id: string;
};

/** Busca, cria, edita, conclui e remove tarefas. */
export function useTasks() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const key = queryKeys.tasks(userId ?? "anon");

  const query = useQuery({
    queryKey: key,
    queryFn: () => tasksRepo.list("created_at", false),
    enabled: !!userId,
    retry: 2,
  });

  useRealtimeTable("tasks", userId, [key]);

  const atualizarCache = (fn: (tarefas: Task[]) => Task[]) => {
    queryClient.setQueryData<Task[]>(key, (anteriores) => fn(anteriores ?? []));
  };

  const atualizarServidor = () => queryClient.invalidateQueries({ queryKey: key });

  const addMutation = useMutation({
    mutationFn: (dados: NovaTarefa) =>
      tasksRepo.insert({
        title: dados.title,
        due_date: dados.due_date,
        priority: dados.priority,
        status: dados.status,
        kind: dados.kind,
        is_academic: dados.is_academic,
        track_id: dados.track_id,
        is_done: dados.status === "concluida",
        completed_at: dados.status === "concluida" ? new Date().toISOString() : null,
      }),
    onSettled: atualizarServidor,
  });

  const editMutation = useMutation({
    mutationFn: ({ id, ...dados }: EdicaoTarefa) =>
      tasksRepo.update(id, {
        title: dados.title,
        due_date: dados.due_date,
        priority: dados.priority,
        status: dados.status,
        kind: dados.kind,
        is_academic: dados.is_academic,
        track_id: dados.track_id,
        is_done: dados.status === "concluida",
        completed_at: dados.status === "concluida" ? new Date().toISOString() : null,
      }),
    onMutate: async ({ id, ...dados }) => {
      await queryClient.cancelQueries({ queryKey: key });

      const anteriores = queryClient.getQueryData<Task[]>(key) ?? [];

      atualizarCache((lista) =>
        lista.map((tarefa) =>
          tarefa.id === id
            ? {
                ...tarefa,
                ...dados,
                is_done: dados.status === "concluida",
                completed_at: dados.status === "concluida" ? new Date().toISOString() : null,
              }
            : tarefa,
        ),
      );

      return { anteriores };
    },
    onError: (_erro, _dados, contexto) => {
      if (contexto?.anteriores) {
        queryClient.setQueryData(key, contexto.anteriores);
      }
    },
    onSettled: atualizarServidor,
  });

  const toggleMutation = useMutation({
    mutationFn: (tarefa: Task) => {
      const concluida = tarefa.status !== "concluida";

      return tasksRepo.update(tarefa.id, {
        status: concluida ? "concluida" : "pendente",
        is_done: concluida,
        completed_at: concluida ? new Date().toISOString() : null,
      });
    },
    onMutate: async (tarefa) => {
      await queryClient.cancelQueries({ queryKey: key });

      const anteriores = queryClient.getQueryData<Task[]>(key) ?? [];

      atualizarCache((lista) =>
        lista.map((item) => {
          if (item.id !== tarefa.id) return item;

          const concluida = item.status !== "concluida";

          return {
            ...item,
            status: concluida ? "concluida" : "pendente",
            is_done: concluida,
            completed_at: concluida ? new Date().toISOString() : null,
          };
        }),
      );

      return { anteriores };
    },
    onError: (_erro, _tarefa, contexto) => {
      if (contexto?.anteriores) {
        queryClient.setQueryData(key, contexto.anteriores);
      }
    },
    onSettled: atualizarServidor,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => tasksRepo.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key });

      const anteriores = queryClient.getQueryData<Task[]>(key) ?? [];

      atualizarCache((lista) => lista.filter((tarefa) => tarefa.id !== id));

      return { anteriores };
    },
    onError: (_erro, _id, contexto) => {
      if (contexto?.anteriores) {
        queryClient.setQueryData(key, contexto.anteriores);
      }
    },
    onSettled: atualizarServidor,
  });

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    add: (dados: NovaTarefa) => addMutation.mutate(dados),
    edit: (dados: EdicaoTarefa) => editMutation.mutate(dados),
    toggle: (tarefa: Task) => toggleMutation.mutate(tarefa),
    remove: (id: string) => removeMutation.mutate(id),
  };
}
