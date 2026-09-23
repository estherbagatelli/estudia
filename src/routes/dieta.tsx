import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Pencil, Trash2, Plus, Check, X, Loader2 } from "lucide-react";
import { useDieta, MEAL_KINDS, mealLabel } from "@/hooks/useDieta";
import type { DietDay, DietMeal, MealKind } from "@/types/models";

export const Route = createFileRoute("/dieta")({
  head: () => ({ meta: [{ title: "Dieta — Estudia" }] }),
  component: DietaPage,
});

function DietaPage() {
  const dieta = useDieta();
  const [newDayName, setNewDayName] = useState("");

  const addDay = () => {
    if (!newDayName.trim()) return;
    dieta.addDay(newDayName.trim());
    setNewDayName("");
  };

  return (
    <AppShell title="Dieta" subtitle="Cardápio semanal · zero lactose">
      <div className="glass-card p-4 mb-6 flex flex-col md:flex-row gap-2">
        <input
          value={newDayName}
          onChange={(e) => setNewDayName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addDay()}
          placeholder="Nova dieta (ex: Domingo livre)"
          className="flex-1 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <button
          onClick={addDay}
          className="rounded-md border border-gold/40 text-gold px-4 py-2 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center gap-1 justify-center"
        >
          <Plus className="h-4 w-4" /> Criar dieta
        </button>
      </div>

      {dieta.isLoading ? (
        <p className="text-sm text-muted-foreground italic font-display flex items-center gap-2 py-10">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {dieta.days.map((day) => (
            <DayCard
              key={day.id}
              day={day}
              meals={dieta.mealsOf(day.id)}
              onRemoveDay={() => {
                if (confirm(`Apagar ${day.name}?`)) dieta.removeDay(day.id);
              }}
              onAddMeal={(k, d, c) => dieta.addMeal(day.id, k, d, c)}
              onEditMeal={(id, patch) => dieta.editMeal(id, patch)}
              onRemoveMeal={(id) => dieta.removeMeal(id)}
            />
          ))}
        </div>
      )}

      <section className="glass-card p-8 mt-8">
        <h2 className="font-display text-2xl text-gold mb-1">Resumo nutricional</h2>
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
          Médias diárias
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "Calorias", v: "1400–1600 kcal" },
            { l: "Proteínas", v: "90–110 g" },
            { l: "Carboidratos", v: "140–180 g" },
            { l: "Gorduras boas", v: "40–50 g" },
          ].map((s) => (
            <div
              key={s.l}
              className="border border-[oklch(0.85_0.008_250/0.2)] rounded-lg p-4 bg-black/30"
            >
              <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                {s.l}
              </div>
              <div className="mt-2 font-display text-xl text-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

const emptyDraft = { kind: "cafe" as MealKind, description: "", calories: "" };

function DayCard({
  day,
  meals,
  onRemoveDay,
  onAddMeal,
  onEditMeal,
  onRemoveMeal,
}: {
  day: DietDay;
  meals: DietMeal[];
  onRemoveDay: () => void;
  onAddMeal: (kind: MealKind, description: string, calories: number | null) => void;
  onEditMeal: (
    id: string,
    patch: { kind: MealKind; description: string; calories: number | null },
  ) => void;
  onRemoveMeal: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);

  const startAdd = () => {
    setDraft(emptyDraft);
    setAdding(true);
    setEditingId(null);
  };
  const startEdit = (m: DietMeal) => {
    setDraft({ kind: m.kind, description: m.description, calories: m.calories?.toString() ?? "" });
    setEditingId(m.id);
    setAdding(false);
  };
  const parseCal = () => (draft.calories.trim() ? Number(draft.calories) : null);
  const saveAdd = () => {
    if (!draft.description.trim()) return;
    onAddMeal(draft.kind, draft.description.trim(), parseCal());
    setDraft(emptyDraft);
    setAdding(false);
  };
  const saveEdit = () => {
    if (!editingId) return;
    onEditMeal(editingId, {
      kind: draft.kind,
      description: draft.description.trim(),
      calories: parseCal(),
    });
    setEditingId(null);
  };

  const Form = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          value={draft.kind}
          onChange={(e) => setDraft({ ...draft, kind: e.target.value as MealKind })}
          className="flex-1 bg-black/40 border border-gold/30 rounded px-2 py-1 text-xs outline-none focus:border-gold"
        >
          {MEAL_KINDS.map((m) => (
            <option key={m.kind} value={m.kind}>
              {m.label}
            </option>
          ))}
        </select>
        <input
          value={draft.calories}
          onChange={(e) => setDraft({ ...draft, calories: e.target.value.replace(/\D/g, "") })}
          placeholder="kcal"
          inputMode="numeric"
          className="w-20 bg-black/40 border border-gold/30 rounded px-2 py-1 text-xs outline-none focus:border-gold"
        />
      </div>
      <textarea
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        placeholder="Descrição"
        className="w-full bg-black/40 border border-gold/30 rounded px-2 py-1 text-sm outline-none focus:border-gold"
        rows={2}
      />
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
        <button onClick={onSave} className="text-gold">
          <Check className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <section className="glass-card p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display text-2xl text-gold">{day.name}</h2>
        <button
          onClick={onRemoveDay}
          className="text-darkred opacity-60 hover:opacity-100"
          aria-label="Apagar dia"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>
      <ul className="space-y-3">
        {meals.map((m) => (
          <li
            key={m.id}
            className="text-sm group border-b border-[oklch(0.85_0.008_250/0.08)] pb-2 last:border-0"
          >
            {editingId === m.id ? (
              <Form onSave={saveEdit} onCancel={() => setEditingId(null)} />
            ) : (
              <>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs tracking-[0.2em] uppercase text-magenta">
                    {mealLabel(m.kind)}
                  </span>
                  <div className="flex items-center gap-2">
                    {m.calories != null && (
                      <span className="text-xs text-gold/80 font-mono">{m.calories} kcal</span>
                    )}
                    <button
                      onClick={() => startEdit(m)}
                      className="opacity-0 group-hover:opacity-100 text-gold transition"
                    >
                      <Pencil className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => onRemoveMeal(m.id)}
                      className="opacity-0 group-hover:opacity-100 text-darkred transition"
                    >
                      <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                <p className="text-foreground/85 mt-1">{m.description}</p>
              </>
            )}
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="mt-3">
          <Form onSave={saveAdd} onCancel={() => setAdding(false)} />
        </div>
      ) : (
        <button
          onClick={startAdd}
          className="mt-3 w-full rounded-md border border-dashed border-gold/30 text-gold/80 py-1.5 text-xs hover:border-gold hover:text-gold transition flex items-center justify-center gap-1"
        >
          <Plus className="h-3 w-3" /> Adicionar refeição
        </button>
      )}
    </section>
  );
}
