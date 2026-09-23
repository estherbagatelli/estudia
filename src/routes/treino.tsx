import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Pencil, Trash2, Plus, Check, X, Loader2 } from "lucide-react";
import { useTreino } from "@/hooks/useTreino";
import type { WorkoutExercise } from "@/types/models";

export const Route = createFileRoute("/treino")({
  head: () => ({ meta: [{ title: "Treino — Estudia" }] }),
  component: TreinoPage,
});

type Draft = { name: string; sets: string; reps: string; load: string };

function TreinoPage() {
  const treino = useTreino();
  const { workouts, isLoading } = treino;
  const [activeIdx, setActiveIdx] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [newName, setNewName] = useState("");
  const [newDayTitle, setNewDayTitle] = useState("");
  const [newDayFocus, setNewDayFocus] = useState("");

  if (isLoading) {
    return (
      <AppShell title="Treino" subtitle="Disciplina é o caminho">
        <p className="text-sm text-muted-foreground italic font-display flex items-center gap-2 py-10">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </p>
      </AppShell>
    );
  }

  const idx = Math.min(activeIdx, Math.max(0, workouts.length - 1));
  const workout = workouts[idx];
  const exercises = workout ? treino.exercisesOf(workout.id) : [];
  const doneCount = exercises.filter((e) => e.is_done).length;

  const startEdit = (ex: WorkoutExercise) => {
    setEditing(ex.id);
    setDraft({
      name: ex.name,
      sets: ex.sets?.toString() ?? "",
      reps: ex.reps ?? "",
      load: ex.load_kg?.toString() ?? "",
    });
  };
  const saveEdit = () => {
    if (!draft || !editing) return;
    treino.editExercise(editing, {
      name: draft.name.trim(),
      sets: draft.sets.trim() ? Number(draft.sets) : null,
      reps: draft.reps.trim() || null,
      load_kg: draft.load.trim() ? Number(draft.load) : null,
    });
    setEditing(null);
    setDraft(null);
  };
  const addExercise = () => {
    if (!newName.trim() || !workout) return;
    treino.addExercise(workout.id, newName.trim());
    setNewName("");
  };
  const addDay = () => {
    if (!newDayTitle.trim()) return;
    treino.addWorkout(newDayTitle.trim(), newDayFocus.trim() || "Livre");
    setNewDayTitle("");
    setNewDayFocus("");
    setActiveIdx(workouts.length);
  };
  const removeDay = () => {
    if (!workout || workouts.length <= 1) return;
    if (!confirm(`Apagar o treino de ${workout.name}?`)) return;
    treino.removeWorkout(workout.id);
    setActiveIdx(Math.max(0, idx - 1));
  };

  return (
    <AppShell title="Treino" subtitle="Disciplina é o caminho">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {workouts.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setActiveIdx(i)}
            className={`shrink-0 rounded-lg border px-4 py-2 text-sm transition ${i === idx ? "border-gold text-gold bg-gold/10" : "border-white/10 text-muted-foreground hover:text-foreground"}`}
          >
            <div className="font-display tracking-wider">{d.name}</div>
            <div className="text-[10px] uppercase tracking-widest opacity-70">{d.focus}</div>
          </button>
        ))}
      </div>

      <div className="glass-card p-4 mb-6 flex flex-col md:flex-row gap-2">
        <input
          value={newDayTitle}
          onChange={(e) => setNewDayTitle(e.target.value)}
          placeholder="Novo treino (ex: Sábado)"
          className="flex-1 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          value={newDayFocus}
          onChange={(e) => setNewDayFocus(e.target.value)}
          placeholder="Foco (ex: Cardio)"
          className="flex-1 md:flex-none md:w-56 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <button
          onClick={addDay}
          className="rounded-md border border-gold/40 text-gold px-4 py-2 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center gap-1 justify-center"
        >
          <Plus className="h-4 w-4" /> Criar treino
        </button>
        <button
          onClick={removeDay}
          disabled={workouts.length <= 1}
          className="rounded-md border border-darkred/50 text-darkred px-4 py-2 text-sm hover:bg-darkred/20 disabled:opacity-40 transition flex items-center gap-1 justify-center"
        >
          <Trash2 className="h-4 w-4" /> Apagar atual
        </button>
      </div>

      {workout && (
        <section className="glass-card p-6">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display text-2xl text-gold">{workout.name}</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs tracking-[0.3em] uppercase text-gold/80">
                {doneCount}/{exercises.length}
              </span>
              <button
                onClick={() => treino.resetWorkout(workout.id)}
                className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground hover:text-gold transition"
              >
                Resetar
              </button>
            </div>
          </div>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            {workout.focus}
          </p>

          <ul className="space-y-2">
            {exercises.map((ex) => (
              <li
                key={ex.id}
                className={`border rounded-md px-3 py-2.5 transition ${ex.is_done ? "border-wine/40 bg-wine/10" : "border-[oklch(0.85_0.008_250/0.12)] bg-black/30"}`}
              >
                {editing === ex.id && draft ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="flex-1 min-w-[180px] bg-transparent border-b border-gold/40 outline-none text-sm py-1"
                    />
                    <input
                      value={draft.sets}
                      onChange={(e) =>
                        setDraft({ ...draft, sets: e.target.value.replace(/\D/g, "") })
                      }
                      className="w-14 bg-transparent border-b border-gold/40 outline-none text-center text-sm py-1"
                      placeholder="Sets"
                      inputMode="numeric"
                    />
                    <span className="text-muted-foreground">×</span>
                    <input
                      value={draft.reps}
                      onChange={(e) => setDraft({ ...draft, reps: e.target.value })}
                      className="w-24 bg-transparent border-b border-gold/40 outline-none text-center text-sm py-1"
                      placeholder="Reps"
                    />
                    <input
                      value={draft.load}
                      onChange={(e) =>
                        setDraft({ ...draft, load: e.target.value.replace(/[^\d.]/g, "") })
                      }
                      className="w-20 bg-transparent border-b border-gold/40 outline-none text-center text-sm py-1"
                      placeholder="Carga"
                      inputMode="decimal"
                    />
                    <button onClick={saveEdit} className="text-gold">
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(null);
                        setDraft(null);
                      }}
                      className="text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="group flex items-center gap-3">
                    <button
                      onClick={() => treino.toggleExercise(ex)}
                      aria-label="Marcar concluído"
                      className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition ${ex.is_done ? "bg-darkred border-darkred" : "border-silver/40 hover:border-gold"}`}
                    >
                      {ex.is_done && <Check className="h-3 w-3 text-silver" strokeWidth={2.5} />}
                    </button>
                    <span className="text-gold/80 text-xs font-mono w-14">
                      {ex.sets ?? "-"}×{(ex.reps ?? "").split(" ")[0]}
                    </span>
                    <span
                      className={`flex-1 text-sm ${ex.is_done ? "line-through text-silver/50" : "text-foreground/85"}`}
                    >
                      {ex.name}
                    </span>
                    {(ex.reps ?? "").includes(" ") && (
                      <span className="text-xs text-muted-foreground">{ex.reps}</span>
                    )}
                    {ex.load_kg != null && (
                      <span className="text-xs text-magenta">{ex.load_kg}kg</span>
                    )}
                    <button
                      onClick={() => startEdit(ex)}
                      className="opacity-60 group-hover:opacity-100 text-gold"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => treino.removeExercise(ex.id)}
                      className="opacity-60 group-hover:opacity-100 text-magenta"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="flex gap-2 mt-4">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addExercise()}
              placeholder="Novo exercício"
              className="flex-1 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <button
              onClick={addExercise}
              className="rounded-md border border-gold/40 text-gold px-3 py-2 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </section>
      )}
    </AppShell>
  );
}
