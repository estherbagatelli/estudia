import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { repo } from "@/repositories/base.repository";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "./useRealtimeTable";
import type { DietMeal, MealKind } from "@/types/models";

const daysRepo = repo("diet_days");
const mealsRepo = repo("diet_meals");

export const MEAL_KINDS: { kind: MealKind; label: string }[] = [
  { kind: "cafe", label: "Café" },
  { kind: "lanche", label: "Lanche" },
  { kind: "pre_treino", label: "Pré-treino" },
  { kind: "almoco", label: "Almoço" },
  { kind: "lanche_tarde", label: "Lanche tarde" },
  { kind: "janta", label: "Janta" },
  { kind: "ceia", label: "Ceia" },
];
export const mealLabel = (k: MealKind) => MEAL_KINDS.find((m) => m.kind === k)?.label ?? k;

export type MealPatch = Partial<Pick<DietMeal, "kind" | "description" | "calories">>;

/** /dieta — diet_days + diet_meals. */
export function useDieta() {
  const { user } = useAuth();
  const userId = user?.id;
  const qc = useQueryClient();
  const dKey = queryKeys.dietDays(userId ?? "anon");
  const mKey = queryKeys.dietMeals(userId ?? "anon");

  const daysQuery = useQuery({
    queryKey: dKey,
    queryFn: () => daysRepo.list("position", true),
    enabled: !!userId,
  });
  const mealsQuery = useQuery({
    queryKey: mKey,
    queryFn: () => mealsRepo.list("position", true),
    enabled: !!userId,
  });

  useRealtimeTable("diet_days", userId, [dKey]);
  useRealtimeTable("diet_meals", userId, [mKey]);

  const meals = mealsQuery.data ?? [];
  const settleD = () => qc.invalidateQueries({ queryKey: dKey });
  const settleM = () => qc.invalidateQueries({ queryKey: mKey });

  const addDay = useMutation({
    mutationFn: (v: { name: string; position: number }) =>
      daysRepo.insert({ name: v.name, position: v.position }),
    onSettled: settleD,
  });
  const removeDay = useMutation({
    mutationFn: (id: string) => daysRepo.remove(id),
    onSettled: () => {
      settleD();
      settleM();
    },
  });
  const addMeal = useMutation({
    mutationFn: (v: {
      dayId: string;
      kind: MealKind;
      description: string;
      calories: number | null;
      position: number;
    }) =>
      mealsRepo.insert({
        day_id: v.dayId,
        kind: v.kind,
        description: v.description,
        calories: v.calories,
        position: v.position,
      }),
    onSettled: settleM,
  });
  const editMeal = useMutation({
    mutationFn: (v: { id: string; patch: MealPatch }) => mealsRepo.update(v.id, v.patch),
    onSettled: settleM,
  });
  const removeMeal = useMutation({
    mutationFn: (id: string) => mealsRepo.remove(id),
    onSettled: settleM,
  });

  return {
    days: daysQuery.data ?? [],
    isLoading: daysQuery.isLoading || mealsQuery.isLoading,
    mealsOf: (dayId: string) => meals.filter((m) => m.day_id === dayId),
    addDay: (name: string) => addDay.mutate({ name, position: (daysQuery.data ?? []).length }),
    removeDay: (id: string) => removeDay.mutate(id),
    addMeal: (dayId: string, kind: MealKind, description: string, calories: number | null) =>
      addMeal.mutate({
        dayId,
        kind,
        description,
        calories,
        position: meals.filter((m) => m.day_id === dayId).length,
      }),
    editMeal: (id: string, patch: MealPatch) => editMeal.mutate({ id, patch }),
    removeMeal: (id: string) => removeMeal.mutate(id),
  };
}
