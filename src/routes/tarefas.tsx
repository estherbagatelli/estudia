import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useTasks } from "@/hooks/useTasks";
import { useState } from "react";
import { Plus, Trash2, Check, Loader2 } from "lucide-react";

export const Route = createFileRoute("/tarefas")({
  head: () => ({ meta: [{ title: "Tarefas — Esther's Planner" }] }),
  component: TarefasPage,
});

function TarefasPage() {
  const { tasks, isLoading, add, toggle, remove } = useTasks();
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    add(text.trim());
    setText("");
  };

  const remaining = tasks.filter((t) => !t.is_done).length;

  return (
    <AppShell title="Tarefas" subtitle={`${remaining} pendente${remaining === 1 ? "" : "s"}`}>
      <section className="glass-card p-6 max-w-2xl">
        <div className="flex gap-2 mb-5">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="O que precisa ser feito hoje?"
            className="flex-1 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold" />
          <button onClick={submit} className="rounded-md border border-gold/40 text-gold px-4 py-2 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground italic font-display text-center py-10 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground italic font-display text-center py-10">Nada por aqui. Respire fundo.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 border border-[oklch(0.85_0.008_250/0.12)] bg-black/30 rounded-md px-3 py-2.5">
                <button onClick={() => toggle(t)}
                  className={`h-5 w-5 rounded border flex items-center justify-center transition ${t.is_done ? "bg-gold border-gold" : "border-gold/40"}`}>
                  {t.is_done && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />}
                </button>
                <span className={`flex-1 text-sm ${t.is_done ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                <button onClick={() => remove(t.id)} className="text-magenta opacity-70 hover:opacity-100">
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
