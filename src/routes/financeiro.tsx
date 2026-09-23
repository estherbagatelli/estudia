import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X, Loader2 } from "lucide-react";
import { useFinanceiro } from "@/hooks/useFinanceiro";

export const Route = createFileRoute("/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Esther's Planner" }] }),
  component: FinanceiroPage,
});

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function FinanceiroPage() {
  const fin = useFinanceiro();
  const { categories } = fin;

  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [cat, setCat] = useState<string>("");
  const [editingBalance, setEditingBalance] = useState<string | null>(null);
  const [balanceDraft, setBalanceDraft] = useState("");
  const [editingName, setEditingName] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");

  const activeCat = cat || categories[0]?.id || "";

  const addExpense = () => {
    const v = parseFloat(value.replace(",", "."));
    if (!name.trim() || !v || v <= 0 || !activeCat) return;
    fin.addExpense(activeCat, name.trim(), v);
    setName(""); setValue("");
  };
  const saveBalance = () => {
    if (!editingBalance) return;
    fin.editCategory(editingBalance, { balance: parseFloat(balanceDraft.replace(",", ".")) || 0 });
    setEditingBalance(null); setBalanceDraft("");
  };
  const saveName = () => {
    if (!editingName) return;
    const lbl = nameDraft.trim();
    if (lbl) fin.editCategory(editingName, { name: lbl });
    setEditingName(null); setNameDraft("");
  };
  const addCategory = () => {
    if (!newCatLabel.trim()) return;
    fin.addCategory(newCatLabel.trim());
    setNewCatLabel("");
  };
  const removeCategory = (id: string) => {
    if (!confirm("Apagar a categoria e todos os gastos vinculados?")) return;
    fin.removeCategory(id);
  };

  return (
    <AppShell title="Financeiro" subtitle="Controle de despesas">
      {fin.isLoading ? (
        <p className="text-sm text-muted-foreground italic font-display flex items-center gap-2 py-10">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-6">
          {categories.map((category) => {
            const spent = fin.totalBy(category.id);
            const bal = Number(category.balance);
            const remaining = bal - spent;
            const pct = bal > 0 ? Math.min(100, (spent / bal) * 100) : 0;
            return (
              <section key={category.id} className="glass-card p-6">
                <div className="flex items-baseline justify-between mb-4">
                  {editingName === category.id ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input autoFocus value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveName()}
                        className="flex-1 bg-transparent border-b border-gold/40 outline-none font-display text-2xl text-gold py-1" />
                      <button onClick={saveName} className="text-gold"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditingName(null)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <h2 className="font-display text-2xl text-gold">{category.name}</h2>
                      <button onClick={() => { setEditingName(category.id); setNameDraft(category.name); }} className="text-gold/70 hover:text-gold" aria-label="Editar nome">
                        <Pencil className="h-3 w-3" strokeWidth={1.5} />
                      </button>
                      <button onClick={() => removeCategory(category.id)} className="text-darkred/70 hover:text-darkred" aria-label="Apagar categoria">
                        <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                      </button>
                    </div>
                  )}
                  {editingBalance === category.id ? (
                    <div className="flex items-center gap-1">
                      <input value={balanceDraft} onChange={(e) => setBalanceDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveBalance()}
                        placeholder="Saldo" className="w-28 bg-transparent border-b border-gold/40 outline-none text-sm py-1 text-right" />
                      <button onClick={saveBalance} className="text-gold"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditingBalance(null)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingBalance(category.id); setBalanceDraft(String(bal)); }} className="text-xs text-muted-foreground hover:text-gold flex items-center gap-1">
                      <Pencil className="h-3 w-3" /> Saldo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center mb-4">
                  <div>
                    <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">Saldo</div>
                    <div className="font-display text-base mt-1">{brl(bal)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.25em] uppercase text-magenta">Gasto</div>
                    <div className="font-display text-base mt-1 text-magenta">{brl(spent)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.25em] uppercase text-gold">Disponível</div>
                    <div className="font-display text-base mt-1 text-gold">{brl(remaining)}</div>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[oklch(0.85_0.008_250)] to-[oklch(0.34_0.10_15)] transition-all" style={{ width: `${pct}%` }} />
                </div>

                <ul className="mt-5 space-y-1.5">
                  {fin.expensesOf(category.id).map((e) => (
                    <li key={e.id} className="flex items-center gap-2 text-sm border border-[oklch(0.85_0.008_250/0.1)] bg-black/30 rounded-md px-3 py-2">
                      <span className="flex-1 text-foreground/85">{e.description}</span>
                      <span className="text-magenta font-mono text-xs">{brl(Number(e.amount))}</span>
                      <button onClick={() => fin.removeExpense(e.id)} className="text-magenta opacity-70 hover:opacity-100">
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </li>
                  ))}
                  {fin.expensesOf(category.id).length === 0 && (
                    <li className="text-xs italic text-muted-foreground text-center py-3">Sem gastos.</li>
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <section className="glass-card p-4 mb-6 flex flex-col md:flex-row gap-2">
        <input value={newCatLabel} onChange={(e) => setNewCatLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCategory()}
          placeholder="Nova categoria (ex: Despesas Casa)"
          className="flex-1 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold" />
        <button onClick={addCategory}
          className="rounded-md border border-gold/40 text-gold px-4 py-2 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center gap-1 justify-center">
          <Plus className="h-4 w-4" /> Criar categoria
        </button>
      </section>

      <section className="glass-card p-6">
        <h3 className="font-display text-lg text-gold mb-4">Adicionar gasto</h3>
        <div className="flex flex-col md:flex-row gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Descrição"
            className="flex-1 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold" />
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Valor (R$)" inputMode="decimal"
            className="md:w-32 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold" />
          <select value={activeCat} onChange={(e) => setCat(e.target.value)}
            className="rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={addExpense} className="rounded-md border border-gold/40 text-gold px-4 py-2 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center gap-1 justify-center">
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>
      </section>
    </AppShell>
  );
}
