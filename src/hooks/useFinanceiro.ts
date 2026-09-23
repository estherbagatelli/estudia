import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { repo } from "@/repositories/base.repository";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "./useRealtimeTable";
import type { FinanceExpense } from "@/types/models";

const catsRepo = repo("finance_categories");
const expensesRepo = repo("finance_expenses");

export type CategoryPatch = Partial<{ name: string; balance: number }>;

/** /financeiro — finance_categories (com balance) + finance_expenses. */
export function useFinanceiro() {
  const { user } = useAuth();
  const userId = user?.id;
  const qc = useQueryClient();
  const cKey = queryKeys.financeCategories(userId ?? "anon");
  const eKey = queryKeys.financeExpenses(userId ?? "anon");

  const catsQuery = useQuery({
    queryKey: cKey,
    queryFn: () => catsRepo.list("position", true),
    enabled: !!userId,
  });
  const expensesQuery = useQuery({
    queryKey: eKey,
    queryFn: () => expensesRepo.list("created_at", true),
    enabled: !!userId,
  });

  useRealtimeTable("finance_categories", userId, [cKey]);
  useRealtimeTable("finance_expenses", userId, [eKey]);

  const expenses = expensesQuery.data ?? [];
  const settleC = () => qc.invalidateQueries({ queryKey: cKey });
  const settleE = () => qc.invalidateQueries({ queryKey: eKey });

  const addCategory = useMutation({
    mutationFn: (v: { name: string; position: number }) =>
      catsRepo.insert({ name: v.name, balance: 0, position: v.position }),
    onSettled: settleC,
  });
  const editCategory = useMutation({
    mutationFn: (v: { id: string; patch: CategoryPatch }) => catsRepo.update(v.id, v.patch),
    onSettled: settleC,
  });
  const removeCategory = useMutation({
    mutationFn: (id: string) => catsRepo.remove(id),
    onSettled: () => {
      settleC();
      settleE();
    },
  });
  const addExpense = useMutation({
    mutationFn: (v: { categoryId: string; description: string; amount: number }) =>
      expensesRepo.insert({
        category_id: v.categoryId,
        description: v.description,
        amount: v.amount,
      }),
    onSettled: settleE,
  });
  const removeExpense = useMutation({
    mutationFn: (id: string) => expensesRepo.remove(id),
    onSettled: settleE,
  });

  const totalBy = (categoryId: string) =>
    expenses.filter((e) => e.category_id === categoryId).reduce((s, e) => s + Number(e.amount), 0);

  return {
    categories: catsQuery.data ?? [],
    isLoading: catsQuery.isLoading || expensesQuery.isLoading,
    expensesOf: (categoryId: string): FinanceExpense[] =>
      expenses.filter((e) => e.category_id === categoryId),
    totalBy,
    addCategory: (name: string) =>
      addCategory.mutate({ name, position: (catsQuery.data ?? []).length }),
    editCategory: (id: string, patch: CategoryPatch) => editCategory.mutate({ id, patch }),
    removeCategory: (id: string) => removeCategory.mutate(id),
    addExpense: (categoryId: string, description: string, amount: number) =>
      addExpense.mutate({ categoryId, description, amount }),
    removeExpense: (id: string) => removeExpense.mutate(id),
  };
}
