import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  Loader2,
  Trophy,
  RotateCcw,
  Timer,
  Flame,
} from "lucide-react";
import { useTreino } from "@/hooks/useTreino";
import type { WorkoutExercise } from "@/types/models";
import { toast } from "sonner";

export const Route = createFileRoute("/treino")({
  head: () => ({ meta: [{ title: "Treino — Estudia" }] }),
  component: TreinoPage,
});

type Draft = {
  name: string;
  sets: string;
  reps: string;
  load: string;
  rest: string;
};

function TreinoPage() {
  const treino = useTreino();
  const { workouts, isLoading, treinosNoMes } = treino;
  const [activeIdx, setActiveIdx] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [newName, setNewName] = useState("");
  const [newRest, setNewRest] = useState("60");
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
      rest: ex.rest_seconds?.toString() ?? "60",
    });
  };

  const saveEdit = () => {
    if (!draft || !editing) return;
    treino.editExercise(editing, {
      name: draft.name.trim(),
      sets: draft.sets.trim() ? Number(draft.sets) : null,
      reps: draft.reps.trim() || null,
      load_kg: draft.load.trim() ? Number(draft.load) : null,
      rest_seconds: draft.rest.trim() ? Number(draft.rest) : null,
    });
    toast.success("Exercício atualizado!");
    setEditing(null);
    setDraft(null);
  };

  const addExercise = () => {
    if (!newName.trim() || !workout) return;
    treino.addExercise(workout.id, newName.trim(), newRest.trim() ? Number(newRest) : 60);
    toast.success("Exercício adicionado!");
    setNewName("");
  };

  const addDay = () => {
    if (!newDayTitle.trim()) return;
    treino.addWorkout(newDayTitle.trim(), newDayFocus.trim() || "Geral");
    toast.success("Novo treino criado!");
    setNewDayTitle("");
    setNewDayFocus("");
    setActiveIdx(workouts.length);
  };

  const removeDay = () => {
    if (!workout || workouts.length <= 1) return;
    if (!confirm(`Apagar o treino de ${workout.name}?`)) return;
    treino.removeWorkout(workout.id);
    toast.success("Treino apagado.");
    setActiveIdx(Math.max(0, idx - 1));
  };

  const handleConcluirTreino = () => {
    if (!workout) return;
    treino.registrarSessao(workout.id);
    toast.success(`Parabéns! Sessão de "${workout.name}" registrada.`);
  };

  const handleReset = () => {
    if (!workout) return;
    treino.resetWorkout(workout.id);
    toast.info("Exercícios resetados para uma nova sessão.");
  };

  return (
    <AppShell title="Treino" subtitle="Disciplina é o caminho">
      {/* Item 4: Contador de treinos concluídos no mês */}
      <div className="glass-card p-4 rounded-xl border border-border mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Frequência mensal
            </p>
            <p className="text-xl font-display font-semibold text-gold">
              {treinosNoMes} {treinosNoMes === 1 ? "treino concluído" : "treinos concluídos"} neste
              mês
            </p>
          </div>
        </div>

        {workout && (
          <button
            onClick={handleConcluirTreino}
            className="w-full sm:w-auto rounded-lg bg-magenta hover:bg-magenta/90 text-card font-medium px-4 py-2 text-sm transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Trophy className="h-4 w-4" /> Concluí este treino
          </button>
        )}
      </div>

      {/* Abas dos treinos (dias da semana / divisões) */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {workouts.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setActiveIdx(i)}
            className={`shrink-0 rounded-lg border px-4 py-2 text-sm transition ${
              i === idx
                ? "border-gold text-gold bg-gold/10"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="font-display tracking-wider">{d.name}</div>
            <div className="text-[10px] uppercase tracking-widest opacity-70">{d.focus}</div>
          </button>
        ))}
      </div>

      {/* Formulário para novo treino */}
      <div className="glass-card p-4 mb-6 rounded-xl border border-border flex flex-col md:flex-row gap-2">
        <input
          value={newDayTitle}
          onChange={(e) => setNewDayTitle(e.target.value)}
          placeholder="Novo treino (ex: Treino C, Sábado)"
          className="flex-1 rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          value={newDayFocus}
          onChange={(e) => setNewDayFocus(e.target.value)}
          placeholder="Foco (ex: Ombros e Abdômen)"
          className="flex-1 md:flex-none md:w-56 rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <button
          onClick={addDay}
          className="rounded-md border border-gold/40 text-gold px-4 py-2 text-sm hover:bg-gold hover:text-background transition flex items-center gap-1 justify-center font-medium"
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
        <section className="glass-card p-6 rounded-xl border border-border">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-display text-2xl text-gold">{workout.name}</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs tracking-[0.2em] uppercase text-gold font-mono">
                {doneCount}/{exercises.length} concluídos
              </span>
              <button
                onClick={handleReset}
                title="Desmarcar todos os exercícios deste treino"
                className="text-xs text-muted-foreground hover:text-gold transition flex items-center gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Resetar
              </button>
            </div>
          </div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
            {workout.focus}
          </p>

          <ul className="space-y-2">
            {exercises.map((ex) => (
              <li
                key={ex.id}
                className={`border rounded-lg px-3 py-2.5 transition ${
                  ex.is_done ? "border-wine/40 bg-wine/10" : "border-border bg-card/60"
                }`}
              >
                {editing === ex.id && draft ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="flex-1 min-w-[160px] bg-transparent border-b border-gold/40 outline-none text-sm py-1"
                      placeholder="Exercício"
                    />
                    <input
                      value={draft.sets}
                      onChange={(e) =>
                        setDraft({ ...draft, sets: e.target.value.replace(/\D/g, "") })
                      }
                      className="w-12 bg-transparent border-b border-gold/40 outline-none text-center text-sm py-1"
                      placeholder="Séries"
                      inputMode="numeric"
                    />
                    <span className="text-muted-foreground">×</span>
                    <input
                      value={draft.reps}
                      onChange={(e) => setDraft({ ...draft, reps: e.target.value })}
                      className="w-16 bg-transparent border-b border-gold/40 outline-none text-center text-sm py-1"
                      placeholder="Reps"
                    />
                    <input
                      value={draft.load}
                      onChange={(e) =>
                        setDraft({ ...draft, load: e.target.value.replace(/[^\d.]/g, "") })
                      }
                      className="w-16 bg-transparent border-b border-gold/40 outline-none text-center text-sm py-1"
                      placeholder="Kg"
                      inputMode="decimal"
                    />
                    {/* Item 8: Tempo de descanso em segundos */}
                    <div className="flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        value={draft.rest}
                        onChange={(e) =>
                          setDraft({ ...draft, rest: e.target.value.replace(/\D/g, "") })
                        }
                        className="w-12 bg-transparent border-b border-gold/40 outline-none text-center text-sm py-1"
                        placeholder="s"
                        title="Descanso em segundos"
                        inputMode="numeric"
                      />
                      <span className="text-xs text-muted-foreground">s</span>
                    </div>

                    <button onClick={saveEdit} className="text-gold p-1 hover:opacity-80">
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(null);
                        setDraft(null);
                      }}
                      className="text-muted-foreground p-1 hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="group flex items-center gap-3">
                    <button
                      onClick={() => treino.toggleExercise(ex)}
                      aria-label="Marcar exercício como concluído"
                      className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition ${
                        ex.is_done ? "bg-magenta border-magenta" : "border-border hover:border-gold"
                      }`}
                    >
                      {ex.is_done && (
                        <Check className="h-3 w-3 text-background" strokeWidth={2.5} />
                      )}
                    </button>

                    <span className="text-gold/90 text-xs font-mono w-14">
                      {ex.sets ?? "-"}×{(ex.reps ?? "").split(" ")[0]}
                    </span>

                    <span
                      className={`flex-1 text-sm font-medium ${
                        ex.is_done ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {ex.name}
                    </span>

                    {/* Item 8: Badge de tempo de descanso */}
                    {ex.rest_seconds != null && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 bg-background/50 border border-border/50 px-1.5 py-0.5 rounded">
                        <Timer className="h-3 w-3 text-gold/70" /> {ex.rest_seconds}s
                      </span>
                    )}

                    {ex.load_kg != null && (
                      <span className="text-xs text-magenta font-mono">{ex.load_kg}kg</span>
                    )}

                    <button
                      onClick={() => startEdit(ex)}
                      className="opacity-50 group-hover:opacity-100 text-gold transition"
                      aria-label="Editar exercício"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>

                    <button
                      onClick={() => {
                        treino.removeExercise(ex.id);
                        toast.success("Exercício removido.");
                      }}
                      className="opacity-50 group-hover:opacity-100 text-muted-foreground hover:text-darkred transition"
                      aria-label="Excluir exercício"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                )}
              </li>
            ))}

            {exercises.length === 0 && (
              <li className="text-xs italic text-muted-foreground text-center py-4">
                Nenhum exercício cadastrado neste treino.
              </li>
            )}
          </ul>

          {/* Adicionar exercício */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-border/40">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addExercise()}
              placeholder="Novo exercício (ex: Supino inclinado)"
              className="flex-1 rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <div className="flex items-center gap-1 sm:w-28">
              <Timer className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                value={newRest}
                onChange={(e) => setNewRest(e.target.value.replace(/\D/g, ""))}
                placeholder="60s"
                title="Tempo de descanso em segundos"
                inputMode="numeric"
                className="w-full rounded-md bg-background/60 border border-border px-2 py-2 text-sm outline-none focus:border-gold text-center"
              />
              <span className="text-xs text-muted-foreground">s</span>
            </div>
            <button
              onClick={addExercise}
              className="rounded-md border border-gold/40 text-gold px-4 py-2 text-sm hover:bg-gold hover:text-background transition flex items-center gap-1 justify-center font-medium"
            >
              <Plus className="h-4 w-4" /> Adicionar
            </button>
          </div>
        </section>
      )}
    </AppShell>
  );
}
