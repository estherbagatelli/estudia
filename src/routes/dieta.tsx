import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useCloudState } from "@/hooks/useCloudState";
import { useState } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

export const Route = createFileRoute("/dieta")({
  head: () => ({ meta: [{ title: "Dieta — Esther's Planner" }] }),
  component: DietaPage,
});

export type Meal = { label: string; text: string; kcal?: number };
export type DietDay = { day: string; meals: Meal[] };

export const WEEK: DietDay[] = [
  { day: "Segunda", meals: [
    { label: "Café", text: "Shake de morango", kcal: 250 },
    { label: "Lanche", text: "Bolinho fit + maçã (170) ou Pipoca + uvas (140)" },
    { label: "Pré-treino", text: "Banana", kcal: 90 },
    { label: "Almoço", text: "Marmita fit congelada" },
    { label: "Lanche tarde", text: "Iogurte + granola (150) ou Mingau (250)" },
    { label: "Janta", text: "Pizza fit Rap10", kcal: 420 },
  ]},
  { day: "Terça", meals: [
    { label: "Café", text: "Shake whey chocolate + ovos mexidos", kcal: 350 },
    { label: "Lanche", text: "Sanduíche natural (180) ou Pão com ovo (160)" },
    { label: "Pré-treino", text: "Banana", kcal: 90 },
    { label: "Almoço", text: "Marmita fit congelada" },
    { label: "Lanche tarde", text: "Gelatina zero + leite condensado", kcal: 100 },
    { label: "Janta", text: "Sanduíche integral", kcal: 350 },
  ]},
  { day: "Quarta", meals: [
    { label: "Café", text: "Shake whey chocolate + ovos mexidos", kcal: 350 },
    { label: "Lanche", text: "Pipoca + uvas (140) ou Bolinho + maçã (170)" },
    { label: "Pré-treino", text: "Banana + aveia", kcal: 120 },
    { label: "Almoço", text: "Marmita fit congelada" },
    { label: "Lanche tarde", text: "Iogurte + uvas (140) ou Mingau (250)" },
    { label: "Janta", text: "Pizza fit Rap10", kcal: 420 },
  ]},
  { day: "Quinta", meals: [
    { label: "Café", text: "Shake whey + ovos + pão", kcal: 510 },
    { label: "Almoço", text: "Frango grelhado + macarrão + salada", kcal: 400 },
    { label: "Lanche", text: "Gelatina", kcal: 100 },
    { label: "Janta", text: "Hambúrguer de frango + pão", kcal: 370 },
  ]},
  { day: "Sexta", meals: [
    { label: "Café", text: "Iogurte morango + banana + aveia", kcal: 270 },
    { label: "Almoço", text: "Músculo + purê + salada", kcal: 420 },
    { label: "Lanche", text: "Iogurte + doce de leite zero", kcal: 160 },
    { label: "Janta", text: "Pizza fit", kcal: 420 },
  ]},
  { day: "Sábado", meals: [
    { label: "Café", text: "Pão + requeijão + suco", kcal: 290 },
    { label: "Almoço", text: "Frango + macarrão + salada", kcal: 400 },
    { label: "Lanche", text: "Gelatina (100) ou Mingau (250)" },
    { label: "Janta", text: "Hambúrguer patinho + pão", kcal: 400 },
  ]},
  { day: "Domingo", meals: [
    { label: "Café", text: "Pão + frango + requeijão + maçã", kcal: 310 },
    { label: "Almoço", text: "Strogonoff + macarrão", kcal: 450 },
    { label: "Lanche", text: "Iogurte + uvas", kcal: 140 },
    { label: "Janta", text: "Pizza fit", kcal: 420 },
  ]},
];

function DietaPage() {
  const [week, setWeek] = useCloudState<DietDay[]>("dieta.v1", WEEK);
  const [editing, setEditing] = useState<{ day: number; meal: number } | null>(null);
  const [draft, setDraft] = useState<Meal>({ label: "", text: "", kcal: undefined });
  const [newDayName, setNewDayName] = useState("");
  const [newMealFor, setNewMealFor] = useState<number | null>(null);

  const updateDay = (i: number, nd: DietDay) => {
    const next = [...week]; next[i] = nd; setWeek(next);
  };
  const addDay = () => {
    if (!newDayName.trim()) return;
    setWeek([...week, { day: newDayName.trim(), meals: [] }]);
    setNewDayName("");
  };
  const removeDay = (i: number) => {
    if (!confirm(`Apagar ${week[i].day}?`)) return;
    setWeek(week.filter((_, idx) => idx !== i));
  };
  const startEdit = (di: number, mi: number) => {
    setEditing({ day: di, meal: mi });
    setDraft({ ...week[di].meals[mi] });
  };
  const saveEdit = () => {
    if (!editing) return;
    const d = week[editing.day];
    const meals = [...d.meals];
    meals[editing.meal] = { ...draft, kcal: draft.kcal ? Number(draft.kcal) : undefined };
    updateDay(editing.day, { ...d, meals });
    setEditing(null);
  };
  const removeMeal = (di: number, mi: number) => {
    const d = week[di];
    updateDay(di, { ...d, meals: d.meals.filter((_, i) => i !== mi) });
  };
  const addMeal = (di: number) => {
    if (!draft.label.trim() && !draft.text.trim()) return;
    const d = week[di];
    updateDay(di, { ...d, meals: [...d.meals, { ...draft, kcal: draft.kcal ? Number(draft.kcal) : undefined }] });
    setDraft({ label: "", text: "", kcal: undefined });
    setNewMealFor(null);
  };

  return (
    <AppShell title="Dieta" subtitle="Cardápio semanal · zero lactose">
      <div className="glass-card p-4 mb-6 flex flex-col md:flex-row gap-2">
        <input value={newDayName} onChange={(e) => setNewDayName(e.target.value)} placeholder="Nova dieta (ex: Domingo livre)"
          className="flex-1 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold" />
        <button onClick={addDay}
          className="rounded-md border border-gold/40 text-gold px-4 py-2 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center gap-1 justify-center">
          <Plus className="h-4 w-4" /> Criar dieta
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {week.map((d, di) => (
          <section key={di} className="glass-card p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-display text-2xl text-gold">{d.day}</h2>
              <button onClick={() => removeDay(di)} className="text-darkred opacity-60 hover:opacity-100" aria-label="Apagar dia">
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <ul className="space-y-3">
              {d.meals.map((m, mi) => (
                <li key={mi} className="text-sm group border-b border-[oklch(0.85_0.008_250/0.08)] pb-2 last:border-0">
                  {editing && editing.day === di && editing.meal === mi ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Refeição"
                          className="flex-1 bg-black/40 border border-gold/30 rounded px-2 py-1 text-xs outline-none focus:border-gold" />
                        <input value={draft.kcal ?? ""} onChange={(e) => setDraft({ ...draft, kcal: e.target.value ? Number(e.target.value) : undefined })}
                          placeholder="kcal" type="number"
                          className="w-20 bg-black/40 border border-gold/30 rounded px-2 py-1 text-xs outline-none focus:border-gold" />
                      </div>
                      <textarea value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} placeholder="Descrição"
                        className="w-full bg-black/40 border border-gold/30 rounded px-2 py-1 text-sm outline-none focus:border-gold" rows={2} />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditing(null)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                        <button onClick={saveEdit} className="text-gold"><Check className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs tracking-[0.2em] uppercase text-magenta">{m.label}</span>
                        <div className="flex items-center gap-2">
                          {m.kcal && <span className="text-xs text-gold/80 font-mono">{m.kcal} kcal</span>}
                          <button onClick={() => startEdit(di, mi)} className="opacity-0 group-hover:opacity-100 text-gold transition">
                            <Pencil className="h-3 w-3" strokeWidth={1.5} />
                          </button>
                          <button onClick={() => removeMeal(di, mi)} className="opacity-0 group-hover:opacity-100 text-darkred transition">
                            <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                      <p className="text-foreground/85 mt-1">{m.text}</p>
                    </>
                  )}
                </li>
              ))}
            </ul>

            {newMealFor === di ? (
              <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Refeição (ex: Lanche)"
                    className="flex-1 bg-black/40 border border-gold/30 rounded px-2 py-1 text-xs outline-none focus:border-gold" />
                  <input value={draft.kcal ?? ""} onChange={(e) => setDraft({ ...draft, kcal: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="kcal" type="number"
                    className="w-20 bg-black/40 border border-gold/30 rounded px-2 py-1 text-xs outline-none focus:border-gold" />
                </div>
                <textarea value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} placeholder="Descrição"
                  className="w-full bg-black/40 border border-gold/30 rounded px-2 py-1 text-sm outline-none focus:border-gold" rows={2} />
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setNewMealFor(null); setDraft({ label: "", text: "", kcal: undefined }); }} className="text-muted-foreground text-xs">Cancelar</button>
                  <button onClick={() => addMeal(di)} className="text-gold text-xs flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Salvar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setNewMealFor(di); setDraft({ label: "", text: "", kcal: undefined }); }}
                className="mt-3 w-full rounded-md border border-dashed border-gold/30 text-gold/80 py-1.5 text-xs hover:border-gold hover:text-gold transition flex items-center justify-center gap-1">
                <Plus className="h-3 w-3" /> Adicionar refeição
              </button>
            )}
          </section>
        ))}
      </div>

      <section className="glass-card p-8 mt-8">
        <h2 className="font-display text-2xl text-gold mb-1">Resumo nutricional</h2>
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">Médias diárias</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "Calorias", v: "1400–1600 kcal" },
            { l: "Proteínas", v: "90–110 g" },
            { l: "Carboidratos", v: "140–180 g" },
            { l: "Gorduras boas", v: "40–50 g" },
          ].map((s) => (
            <div key={s.l} className="border border-[oklch(0.85_0.008_250/0.2)] rounded-lg p-4 bg-black/30">
              <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{s.l}</div>
              <div className="mt-2 font-display text-xl text-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}