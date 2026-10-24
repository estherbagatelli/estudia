import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { repo } from "@/repositories/base.repository";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "./useRealtimeTable";
import type { Workout, WorkoutExercise, WorkoutSession } from "@/types/models";
import { isThisMonth, parseISO } from "date-fns";

const workoutsRepo = repo("workouts");
const exercisesRepo = repo("workout_exercises");
const sessionsRepo = repo("workout_sessions");

export type ExercisePatch = Partial<
  Pick<WorkoutExercise, "name" | "sets" | "reps" | "load_kg" | "rest_seconds">
>;

const hoje = () => new Date().toISOString().slice(0, 10);

/** /treino — workouts + workout_exercises + workout_sessions (histórico e contador). */
export function useTreino() {
  const { user } = useAuth();
  const userId = user?.id;
  const qc = useQueryClient();
  const wKey = queryKeys.workouts(userId ?? "anon");
  const eKey = queryKeys.workoutExercises(userId ?? "anon");
  const sKey = ["workout_sessions", userId ?? "anon"] as const;

  const workoutsQuery = useQuery({
    queryKey: wKey,
    queryFn: () => workoutsRepo.list("position", true),
    enabled: !!userId,
  });
  const exercisesQuery = useQuery({
    queryKey: eKey,
    queryFn: () => exercisesRepo.list("position", true),
    enabled: !!userId,
  });
  const sessionsQuery = useQuery({
    queryKey: sKey,
    queryFn: () => sessionsRepo.list("performed_on", false),
    enabled: !!userId,
  });

  useRealtimeTable("workouts", userId, [wKey]);
  useRealtimeTable("workout_exercises", userId, [eKey]);
  useRealtimeTable("workout_sessions", userId, [sKey]);

  const exercises = exercisesQuery.data ?? [];
  const sessions = sessionsQuery.data ?? [];

  const settleE = () => qc.invalidateQueries({ queryKey: eKey });
  const settleW = () => qc.invalidateQueries({ queryKey: wKey });
  const settleS = () => qc.invalidateQueries({ queryKey: sKey });

  const patchE = (fn: (p: WorkoutExercise[]) => WorkoutExercise[]) =>
    qc.setQueryData<WorkoutExercise[]>(eKey, (p) => fn(p ?? []));

  const addWorkout = useMutation({
    mutationFn: (v: { name: string; focus: string; position: number }) =>
      workoutsRepo.insert({ name: v.name, focus: v.focus, position: v.position }),
    onSettled: settleW,
  });

  const removeWorkout = useMutation({
    mutationFn: (id: string) => workoutsRepo.remove(id),
    onSettled: () => {
      settleW();
      settleE();
      settleS();
    },
  });

  const addExercise = useMutation({
    mutationFn: (v: {
      workoutId: string;
      name: string;
      position: number;
      restSeconds?: number | null;
    }) =>
      exercisesRepo.insert({
        workout_id: v.workoutId,
        name: v.name,
        sets: 3,
        reps: "10",
        rest_seconds: v.restSeconds ?? 60,
        position: v.position,
      }),
    onSettled: settleE,
  });

  const editExercise = useMutation({
    mutationFn: (v: { id: string; patch: ExercisePatch }) => exercisesRepo.update(v.id, v.patch),
    onSettled: settleE,
  });

  const toggleExercise = useMutation({
    mutationFn: (ex: WorkoutExercise) => exercisesRepo.update(ex.id, { is_done: !ex.is_done }),
    onMutate: async (ex) => {
      await qc.cancelQueries({ queryKey: eKey });
      const prev = qc.getQueryData<WorkoutExercise[]>(eKey) ?? [];
      patchE((p) => p.map((x) => (x.id === ex.id ? { ...x, is_done: !x.is_done } : x)));
      return { prev };
    },
    onError: (_e, _v, c) => c?.prev && qc.setQueryData(eKey, c.prev),
    onSettled: settleE,
  });

  const removeExercise = useMutation({
    mutationFn: (id: string) => exercisesRepo.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: eKey });
      const prev = qc.getQueryData<WorkoutExercise[]>(eKey) ?? [];
      patchE((p) => p.filter((x) => x.id !== id));
      return { prev };
    },
    onError: (_e, _v, c) => c?.prev && qc.setQueryData(eKey, c.prev),
    onSettled: settleE,
  });

  // Item 4: Registrar sessão concluída
  const registrarSessao = useMutation({
    mutationFn: async (workoutId: string) => {
      const list = exercises.filter((e) => e.workout_id === workoutId);
      const done = list.filter((e) => e.is_done).length;
      const { error } = await supabase.from("workout_sessions").upsert(
        {
          workout_id: workoutId,
          performed_on: hoje(),
          done_count: done,
          total_count: list.length,
        },
        { onConflict: "workout_id,performed_on" },
      );
      if (error) throw error;
    },
    onSettled: settleS,
  });

  // Reset: desmarca is_done dos exercícios
  const resetWorkout = useMutation({
    mutationFn: async (workoutId: string) => {
      const { error } = await supabase
        .from("workout_exercises")
        .update({ is_done: false })
        .eq("workout_id", workoutId);
      if (error) throw error;
    },
    onMutate: async (workoutId) => {
      await qc.cancelQueries({ queryKey: eKey });
      const prev = qc.getQueryData<WorkoutExercise[]>(eKey) ?? [];
      patchE((p) => p.map((x) => (x.workout_id === workoutId ? { ...x, is_done: false } : x)));
      return { prev };
    },
    onError: (_e, _v, c) => c?.prev && qc.setQueryData(eKey, c.prev),
    onSettled: settleE,
  });

  // Contagem de treinos realizados neste mês
  const treinosNoMes = sessions.filter((s) => {
    try {
      return isThisMonth(parseISO(s.performed_on));
    } catch {
      return false;
    }
  }).length;

  return {
    workouts: workoutsQuery.data ?? [],
    sessions,
    treinosNoMes,
    isLoading: workoutsQuery.isLoading || exercisesQuery.isLoading || sessionsQuery.isLoading,
    exercisesOf: (workoutId: string) => exercises.filter((e) => e.workout_id === workoutId),
    addWorkout: (name: string, focus: string) =>
      addWorkout.mutate({ name, focus, position: (workoutsQuery.data ?? []).length }),
    removeWorkout: (id: string) => removeWorkout.mutate(id),
    addExercise: (workoutId: string, name: string, restSeconds = 60) =>
      addExercise.mutate({
        workoutId,
        name,
        restSeconds,
        position: exercises.filter((e) => e.workout_id === workoutId).length,
      }),
    editExercise: (id: string, patch: ExercisePatch) => editExercise.mutate({ id, patch }),
    toggleExercise: (ex: WorkoutExercise) => toggleExercise.mutate(ex),
    removeExercise: (id: string) => removeExercise.mutate(id),
    registrarSessao: (workoutId: string) => registrarSessao.mutate(workoutId),
    resetWorkout: (workoutId: string) => resetWorkout.mutate(workoutId),
  };
}
