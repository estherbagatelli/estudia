import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useCloudState } from "@/hooks/useCloudState";
import { useState } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

export const Route = createFileRoute("/treino")({
  head: () => ({ meta: [{ title: "Treino — Esther's Planner" }] }),
  component: TreinoPage,
});

export type Ex = { id: string; name: string; sets: string; reps: string; load?: string };
export type Day = { title: string; focus: string; exercises: Ex[] };

const mk = (name: string, sets: string, reps: string): Ex => ({ id: `${name}-${sets}-${reps}`, name, sets, reps, load: "" });

export const INITIAL: Day[] = [
  { title: "Segunda", focus: "Peitoral", exercises: [
    mk("Wall slide", "2", "15"),
    mk("Supino reto", "3", "10"),
    mk("Supino inclinado", "3", "10"),
    mk("Desenvolvimento máquina", "3", "10"),
    mk("Tríceps francês", "3", "10"),
    mk("Elevação lateral", "3", "10"),
    mk("Elevação frontal", "3", "10"),
    mk("Prancha ventral", "3", "30"),
  ]},
  { title: "Terça", focus: "Glúteo e Quadríceps", exercises: [
    mk("Cadeira abdutora (aquecimento)", "2", "15"),
    mk("Cadeira extensora", "3", "12"),
    mk("Step Up na polia", "3", "12 cada perna"),
    mk("Abdução na polia em pé", "3", "15 cada perna"),
    mk("Leg press 45°", "3", "10"),
    mk("Mesa flexora", "3", "12"),
    mk("Elevação pélvica com barra", "3", "12"),
    mk("Afundo búlgaro", "3", "10 cada perna"),
  ]},
  { title: "Quarta", focus: "Dorsais", exercises: [
    mk("Rotação interna ombro polia alta", "3", "10"),
    mk("Puxada articulada", "3", "10"),
    mk("Pulley frente com triângulo", "3", "10"),
    mk("Remada curvada barra fechada", "3", "10"),
    mk("Crucifixo invertido", "3", "10"),
    mk("Rosca direta na polia", "3", "10"),
    mk("Remada aberta máquina", "3", "10"),
    mk("Pallof press", "3", "10"),
  ]},
  { title: "Quinta", focus: "Inferiores", exercises: [
    mk("Retração escapular remada baixa", "2", "15"),
    mk("Recuo no smith", "3", "10"),
    mk("Agachamento barra hexagonal", "3", "10"),
    mk("Stiff com halter", "3", "10"),
    mk("Cadeira flexora", "3", "10"),
    mk("Panturrilha no leg press", "3", "10"),
  ]},
  { title: "Sexta", focus: "Braços e Core", exercises: [
    mk("Rosca alternada", "3", "12"),
    mk("Face pull", "3", "15"),
    mk("Retração escapular", "3", "15"),
    mk("Tríceps corda polia", "3", "12"),
    mk("Rosca martelo", "3", "12"),
    mk("Abdominal máquina", "3", "15"),
    mk("Prancha lateral", "3", "30s cada"),
    mk("Abdominal bicicleta", "3", "20"),
  ]},
];

function TreinoPage() {
  const [days, setDays] = useCloudState<Day[]>("treino.v1", INITIAL);
  const [done, setDone] = useCloudState<Record<string, string[]>>("treino.done.v1", {});
  const [activeIdx, setActiveIdx] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Ex | null>(null);
  const [newName, setNewName] = useState("");
  const [newDayTitle, setNewDayTitle] = useState("");
  const [newDayFocus, setNewDayFocus] = useState("");

  const day = days[activeIdx];
  const dayKey = day.title;
  const doneIds = done[dayKey] ?? [];
  const toggleDone = (id: string) => {
    const cur = done[dayKey] ?? [];
    setDone({ ...done, [dayKey]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  };
  const resetDone = () => setDone({ ...done, [dayKey]: [] });

  const update = (idx: number, newDay: Day) => {
    const next = [...days]; next[idx] = newDay; setDays(next);
  };

  const startEdit = (ex: Ex) => { setEditing(ex.id); setDraft({ ...ex }); };
  const saveEdit = () => {
    if (!draft || !editing) return;
    update(activeIdx, { ...day, exercises: day.exercises.map((e) => e.id === editing ? draft : e) });
    setEditing(null); setDraft(null);
  };
  const remove = (id: string) => update(activeIdx, { ...day, exercises: day.exercises.filter((e) => e.id !== id) });
  const add = () => {
    if (!newName.trim()) return;
    update(activeIdx, { ...day, exercises: [...day.exercises, { id: crypto.randomUUID(), name: newName.trim(), sets: "3", reps: "10", load: "" }] });
    setNewName("");
  };

  const addDay = () => {
    if (!newDayTitle.trim()) return;
    const novo: Day = { title: newDayTitle.trim(), focus: newDayFocus.trim() || "Livre", exercises: [] };
    const next = [...days, novo];
    setDays(next);
    setActiveIdx(next.length - 1);
    setNewDayTitle(""); setNewDayFocus("");
  };
  const removeDay = () => {
    if (days.length <= 1) return;
    if (!confirm(`Apagar o treino de ${day.title}?`)) return;
    const next = days.filter((_, i) => i !== activeIdx);
    setDays(next);
    setActiveIdx(Math.max(0, activeIdx - 1));
  };

  return (
    <AppShell title="Treino" subtitle="Disciplina é o caminho">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {days.map((d, i) => (
          <button key={d.title} onClick={() => setActiveIdx(i)}
            className={`shrink-0 rounded-lg border px-4 py-2 text-sm transition ${i === activeIdx ? "border-gold text-gold bg-gold/10" : "border-white/10 text-muted-foreground hover:text-foreground"}`}>
            <div className="font-display tracking-wider">{d.title}</div>
            <div className="text-[10px] uppercase tracking-widest opacity-70">{d.focus}</div>
          </button>
        ))}
      </div>

      <div className="glass-card p-4 mb-6 flex flex-col md:flex-row gap-2">
        <input value={newDayTitle} onChange={(e) => setNewDayTitle(e.target.value)} placeholder="Novo treino (ex: Sábado)"
          className="flex-1 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold" />
        <input value={newDayFocus} onChange={(e) => setNewDayFocus(e.target.value)} placeholder="Foco (ex: Cardio)"
          className="flex-1 md:flex-none md:w-56 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold" />
        <button onClick={addDay}
          className="rounded-md border border-gold/40 text-gold px-4 py-2 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center gap-1 justify-center">
          <Plus className="h-4 w-4" /> Criar treino
        </button>
        <button onClick={removeDay} disabled={days.length <= 1}
          className="rounded-md border border-darkred/50 text-darkred px-4 py-2 text-sm hover:bg-darkred/20 disabled:opacity-40 transition flex items-center gap-1 justify-center">
          <Trash2 className="h-4 w-4" /> Apagar atual
        </button>
      </div>

      <section className="glass-card p-6">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display text-2xl text-gold">{day.title}</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-[0.3em] uppercase text-gold/80">
              {doneIds.filter((id) => day.exercises.some((e) => e.id === id)).length}/{day.exercises.length}
            </span>
            <button onClick={resetDone} className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground hover:text-gold transition">
              Resetar
            </button>
          </div>
        </div>
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">{day.focus}</p>

        <ul className="space-y-2">
          {day.exercises.map((ex) => (
            <li key={ex.id} className={`border rounded-md px-3 py-2.5 transition ${doneIds.includes(ex.id) ? "border-wine/40 bg-wine/10" : "border-[oklch(0.85_0.008_250/0.12)] bg-black/30"}`}>
              {editing === ex.id && draft ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="flex-1 min-w-[180px] bg-transparent border-b border-gold/40 outline-none text-sm py-1" />
                  <input value={draft.sets} onChange={(e) => setDraft({ ...draft, sets: e.target.value })}
                    className="w-14 bg-transparent border-b border-gold/40 outline-none text-center text-sm py-1" placeholder="Sets" />
                  <span className="text-muted-foreground">×</span>
                  <input value={draft.reps} onChange={(e) => setDraft({ ...draft, reps: e.target.value })}
                    className="w-24 bg-transparent border-b border-gold/40 outline-none text-center text-sm py-1" placeholder="Reps" />
                  <input value={draft.load ?? ""} onChange={(e) => setDraft({ ...draft, load: e.target.value })}
                    className="w-20 bg-transparent border-b border-gold/40 outline-none text-center text-sm py-1" placeholder="Carga" />
                  <button onClick={saveEdit} className="text-gold"><Check className="h-4 w-4" /></button>
                  <button onClick={() => { setEditing(null); setDraft(null); }} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <div className="group flex items-center gap-3">
                  <button
                    onClick={() => toggleDone(ex.id)}
                    aria-label="Marcar concluído"
                    className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition ${
                      doneIds.includes(ex.id) ? "bg-darkred border-darkred" : "border-silver/40 hover:border-gold"
                    }`}
                  >
                    {doneIds.includes(ex.id) && <Check className="h-3 w-3 text-silver" strokeWidth={2.5} />}
                  </button>
                  <span className="text-gold/80 text-xs font-mono w-14">{ex.sets}×{ex.reps.split(" ")[0]}</span>
                  <span className={`flex-1 text-sm ${doneIds.includes(ex.id) ? "line-through text-silver/50" : "text-foreground/85"}`}>{ex.name}</span>
                  {ex.reps.includes(" ") && <span className="text-xs text-muted-foreground">{ex.reps}</span>}
                  {ex.load && <span className="text-xs text-magenta">{ex.load}kg</span>}
                  <button onClick={() => startEdit(ex)} className="opacity-60 group-hover:opacity-100 text-gold">
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => remove(ex.id)} className="opacity-60 group-hover:opacity-100 text-magenta">
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="flex gap-2 mt-4">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Novo exercício"
            className="flex-1 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold" />
          <button onClick={add} className="rounded-md border border-gold/40 text-gold px-3 py-2 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </section>
    </AppShell>
  );
}