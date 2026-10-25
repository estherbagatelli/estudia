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
    mutationFn: (v: {
      categoryId: string;
      description: string;
      amount: number;
      isIncome?: boolean;
    }) =>
      expensesRepo.insert({
        category_id: v.categoryId,
        description: v.description,
        amount: v.amount,
        is_income: v.isIncome ?? false,
      }),
    onSettled: settleE,
  });
  const removeExpense = useMutation({
    mutationFn: (id: string) => expensesRepo.remove(id),
    onSettled: settleE,
  });

  const totalBy = (categoryId: string) =>
    expenses
      .filter((e) => e.category_id === categoryId && !e.is_income)
      .reduce((s, e) => s + Number(e.amount), 0);

  const entradas = expenses.filter((l) => l.is_income).reduce((s, l) => s + Number(l.amount), 0);
  const gastos = expenses.filter((l) => !l.is_income).reduce((s, l) => s + Number(l.amount), 0);
  const saldo = entradas - gastos;

  return {
    categories: catsQuery.data ?? [],
    expenses,
    isLoading: catsQuery.isLoading || expensesQuery.isLoading,
    expensesOf: (categoryId: string): FinanceExpense[] =>
      expenses.filter((e) => e.category_id === categoryId),
    totalBy,
    entradas,
    gastos,
    saldo,
    addCategory: (name: string) =>
      addCategory.mutate({ name, position: (catsQuery.data ?? []).length }),
    editCategory: (id: string, patch: CategoryPatch) => editCategory.mutate({ id, patch }),
    removeCategory: (id: string) => removeCategory.mutate(id),
    addExpense: (categoryId: string, description: string, amount: number, isIncome = false) =>
      addExpense.mutate({ categoryId, description, amount, isIncome }),
    removeExpense: (id: string) => removeExpense.mutate(id),
  };
}
