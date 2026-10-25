import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
} from "lucide-react";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { toast } from "sonner";

export const Route = createFileRoute("/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Estudia" }] }),
  component: FinanceiroPage,
});

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function FinanceiroPage() {
  const fin = useFinanceiro();
  const { categories, expenses, entradas, gastos, saldo } = fin;

  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [isIncome, setIsIncome] = useState(false);
  const [cat, setCat] = useState<string>("");
  const [editingBalance, setEditingBalance] = useState<string | null>(null);
  const [balanceDraft, setBalanceDraft] = useState("");
  const [editingName, setEditingName] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");

  const activeCat = cat || categories[0]?.id || "";

  const addExpense = () => {
    const v = parseFloat(value.replace(",", "."));
    if (!name.trim()) {
      toast.error("Informe a descrição do lançamento.");
      return;
    }
    if (!v || v <= 0) {
      toast.error("Informe um valor válido maior que zero.");
      return;
    }
    if (!activeCat) {
      toast.error("Crie ou selecione uma categoria primeiro.");
      return;
    }
    fin.addExpense(activeCat, name.trim(), v, isIncome);
    toast.success(isIncome ? "Entrada registrada com sucesso!" : "Gasto adicionado com sucesso!");
    setName("");
    setValue("");
  };

  const saveBalance = () => {
    if (!editingBalance) return;
    fin.editCategory(editingBalance, { balance: parseFloat(balanceDraft.replace(",", ".")) || 0 });
    toast.success("Saldo da categoria atualizado!");
    setEditingBalance(null);
    setBalanceDraft("");
  };

  const saveName = () => {
    if (!editingName) return;
    const lbl = nameDraft.trim();
    if (lbl) {
      fin.editCategory(editingName, { name: lbl });
      toast.success("Categoria renomeada!");
    }
    setEditingName(null);
    setNameDraft("");
  };

  const addCategory = () => {
    if (!newCatLabel.trim()) return;
    fin.addCategory(newCatLabel.trim());
    toast.success("Categoria criada com sucesso!");
    setNewCatLabel("");
  };

  const removeCategory = (id: string) => {
    if (!confirm("Apagar a categoria e todos os lançamentos vinculados?")) return;
    fin.removeCategory(id);
    toast.success("Categoria removida.");
  };

  const handleRemoveExpense = (id: string) => {
    fin.removeExpense(id);
    toast.success("Lançamento removido.");
  };

  return (
    <AppShell title="Financeiro" subtitle="Controle de entradas e gastos">
      {fin.isLoading ? (
        <p className="text-sm text-muted-foreground italic font-display flex items-center gap-2 py-10">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </p>
      ) : (
        <>
          {/* Item 5: Totais de entradas, gastos e saldo no topo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4 rounded-xl border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Total de Entradas
                </p>
                <p className="text-xl font-display font-semibold text-gold">{brl(entradas)}</p>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-magenta/15 flex items-center justify-center text-magenta">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Total de Gastos
                </p>
                <p className="text-xl font-display font-semibold text-magenta">{brl(gastos)}</p>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-wine/25 flex items-center justify-center text-silver">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Saldo Líquido
                </p>
                <p
                  className={`text-xl font-display font-semibold ${
                    saldo >= 0 ? "text-gold" : "text-darkred"
                  }`}
                >
                  {brl(saldo)}
                </p>
              </div>
            </div>
          </div>

          {/* Form de novo lançamento: gasto ou entrada */}
          <section className="glass-card p-6 mb-6 rounded-xl border border-border">
            <h3 className="font-display text-lg text-gold mb-4">Adicionar lançamento</h3>
            <div className="flex flex-col md:flex-row gap-3">
              {/* Seletor Gasto / Entrada */}
              <div className="flex rounded-md border border-border overflow-hidden p-0.5 bg-background/50">
                <button
                  type="button"
                  onClick={() => setIsIncome(false)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition flex items-center gap-1 ${
                    !isIncome
                      ? "bg-magenta text-card shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ArrowDownLeft className="h-3.5 w-3.5" /> Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setIsIncome(true)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition flex items-center gap-1 ${
                    isIncome
                      ? "bg-gold text-card shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" /> Entrada
                </button>
              </div>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  isIncome
                    ? "Descrição da entrada (ex: Bolsa, Estágio)"
                    : "Descrição do gasto (ex: Almoço)"
                }
                className="flex-1 rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Valor (R$)"
                inputMode="decimal"
                className="md:w-32 rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <select
                value={activeCat}
                onChange={(e) => setCat(e.target.value)}
                className="rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:border-gold text-foreground"
              >
                {categories.length === 0 && <option value="">Sem categorias</option>}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={addExpense}
                className="rounded-md border border-gold/40 text-gold px-4 py-2 text-sm hover:bg-gold hover:text-background transition flex items-center gap-1 justify-center font-medium"
              >
                <Plus className="h-4 w-4" /> Adicionar
              </button>
            </div>
          </section>

          {/* Categorias e Lançamentos */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-6">
            {categories.map((category) => {
              const catExpenses = fin.expensesOf(category.id);
              const spent = fin.totalBy(category.id);
              const bal = Number(category.balance);
              const remaining = bal - spent;
              const pct = bal > 0 ? Math.min(100, (spent / bal) * 100) : 0;

              return (
                <section
                  key={category.id}
                  className="glass-card p-6 rounded-xl border border-border"
                >
                  <div className="flex items-baseline justify-between mb-4">
                    {editingName === category.id ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          autoFocus
                          value={nameDraft}
                          onChange={(e) => setNameDraft(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveName()}
                          className="flex-1 bg-transparent border-b border-gold/40 outline-none font-display text-2xl text-gold py-1"
                        />
                        <button onClick={saveName} className="text-gold hover:opacity-80">
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingName(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-1">
                        <h2 className="font-display text-2xl text-gold">{category.name}</h2>
                        <button
                          onClick={() => {
                            setEditingName(category.id);
                            setNameDraft(category.name);
                          }}
                          className="text-gold/70 hover:text-gold"
                          aria-label="Editar nome"
                        >
                          <Pencil className="h-3 w-3" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => removeCategory(category.id)}
                          className="text-darkred/70 hover:text-darkred"
                          aria-label="Apagar categoria"
                        >
                          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                        </button>
                      </div>
                    )}
                    {editingBalance === category.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={balanceDraft}
                          onChange={(e) => setBalanceDraft(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveBalance()}
                          placeholder="Saldo"
                          className="w-28 bg-transparent border-b border-gold/40 outline-none text-sm py-1 text-right"
                        />
                        <button onClick={saveBalance} className="text-gold">
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingBalance(null)}
                          className="text-muted-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingBalance(category.id);
                          setBalanceDraft(String(bal));
                        }}
                        className="text-xs text-muted-foreground hover:text-gold flex items-center gap-1"
                      >
                        <Pencil className="h-3 w-3" /> Saldo
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center mb-4">
                    <div>
                      <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                        Saldo
                      </div>
                      <div className="font-display text-base mt-1">{brl(bal)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] tracking-[0.25em] uppercase text-magenta">
                        Gasto
                      </div>
                      <div className="font-display text-base mt-1 text-magenta">{brl(spent)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] tracking-[0.25em] uppercase text-gold">
                        Disponível
                      </div>
                      <div className="font-display text-base mt-1 text-gold">{brl(remaining)}</div>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-magenta transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <ul className="mt-5 space-y-1.5">
                    {catExpenses.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-center gap-2 text-sm border border-border bg-card/60 rounded-md px-3 py-2"
                      >
                        <span className="flex-1 text-foreground/85">{e.description}</span>
                        <span
                          className={`font-mono text-xs font-medium ${
                            e.is_income ? "text-gold" : "text-magenta"
                          }`}
                        >
                          {e.is_income
                            ? `+ ${brl(Number(e.amount))}`
                            : `- ${brl(Number(e.amount))}`}
                        </span>
                        <button
                          onClick={() => handleRemoveExpense(e.id)}
                          className="text-muted-foreground hover:text-darkred transition"
                          aria-label="Excluir lançamento"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </li>
                    ))}
                    {catExpenses.length === 0 && (
                      <li className="text-xs italic text-muted-foreground text-center py-3">
                        Nenhum lançamento nesta categoria.
                      </li>
                    )}
                  </ul>
                </section>
              );
            })}
          </div>

          {/* Estado vazio global se não houver gastos/lançamentos */}
          {expenses.length === 0 && (
            <div className="glass-card p-8 rounded-xl border border-border text-center mb-6">
              <p className="text-sm text-muted-foreground italic">
                Você ainda não registrou nenhum gasto.
              </p>
            </div>
          )}

          {/* Criar nova categoria */}
          <section className="glass-card p-4 mb-6 rounded-xl border border-border flex flex-col md:flex-row gap-2">
            <input
              value={newCatLabel}
              onChange={(e) => setNewCatLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="Nova categoria (ex: Moradia, Alimentação, Estágio)"
              className="flex-1 rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <button
              onClick={addCategory}
              className="rounded-md border border-gold/40 text-gold px-4 py-2 text-sm hover:bg-gold hover:text-background transition flex items-center gap-1 justify-center font-medium"
            >
              <Plus className="h-4 w-4" /> Criar categoria
            </button>
          </section>
        </>
      )}
    </AppShell>
  );
}
