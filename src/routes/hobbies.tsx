import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useCloudState } from "@/hooks/useCloudState";
import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";

export const Route = createFileRoute("/hobbies")({
  head: () => ({ meta: [{ title: "Hobbies — Esther's Planner" }] }),
  component: HobbiesPage,
});

type Category = "Filmes" | "Séries" | "Animes" | "Livros";
type Item = { id: string; title: string; done: boolean; progress?: string; season?: string };

const CATS: Category[] = ["Filmes", "Séries", "Animes", "Livros"];

function HobbiesPage() {
  const [items, setItems] = useCloudState<Record<Category, Item[]>>("hobbies.v1", {
    Filmes: [], Séries: [], Animes: [], Livros: [],
  });
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState<Category>("Filmes");

  const add = () => {
    if (!title.trim()) return;
    setItems({ ...items, [cat]: [...items[cat], { id: crypto.randomUUID(), title: title.trim(), done: false, progress: "", season: "" }] });
    setTitle("");
  };
  const toggle = (c: Category, id: string) =>
    setItems({ ...items, [c]: items[c].map((i) => (i.id === id ? { ...i, done: !i.done } : i)) });
  const setProgress = (c: Category, id: string, v: string) =>
    setItems({ ...items, [c]: items[c].map((i) => (i.id === id ? { ...i, progress: v } : i)) });
  const setSeason = (c: Category, id: string, v: string) =>
    setItems({ ...items, [c]: items[c].map((i) => (i.id === id ? { ...i, season: v } : i)) });
  const remove = (c: Category, id: string) =>
    setItems({ ...items, [c]: items[c].filter((i) => i.id !== id) });

  return (
    <AppShell title="Hobbies" subtitle="Metas do ano · checklist pessoal">
      <div className="glass-card p-5 mb-6 flex flex-col md:flex-row gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título"
          className="flex-1 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold" />
        <select value={cat} onChange={(e) => setCat(e.target.value as Category)}
          className="rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold">
          {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={add}
          className="rounded-md border border-gold/40 text-gold px-4 py-2 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center gap-1 justify-center">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {CATS.map((c) => (
          <section key={c} className="glass-card p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-display text-2xl text-gold">{c}</h2>
              <span className="text-xs text-muted-foreground">
                {items[c].filter((i) => i.done).length}/{items[c].length}
              </span>
            </div>
            {items[c].length === 0 ? (
              <p className="text-sm text-muted-foreground italic font-display">Nada por aqui ainda.</p>
            ) : (
              <ul className="space-y-2">
                {items[c].map((it) => (
                  <li key={it.id} className="flex items-center gap-2 border border-[oklch(0.85_0.008_250/0.12)] rounded-md bg-black/30 px-3 py-2">
                    <button onClick={() => toggle(c, it.id)}
                      className={`h-5 w-5 rounded border flex items-center justify-center transition ${it.done ? "bg-gold border-gold" : "border-gold/40"}`}>
                      {it.done && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />}
                    </button>
                    <span className={`flex-1 text-sm ${it.done ? "line-through text-muted-foreground" : ""}`}>{it.title}</span>
                    {(c === "Séries" || c === "Animes") && !it.done && (
                      <>
                        <input value={it.season ?? ""} onChange={(e) => setSeason(c, it.id, e.target.value)} placeholder="Temp."
                          className="w-14 rounded bg-black/40 border border-gold/20 px-2 py-1 text-xs outline-none focus:border-gold text-center" />
                        <input value={it.progress ?? ""} onChange={(e) => setProgress(c, it.id, e.target.value)} placeholder="Ep."
                          className="w-14 rounded bg-black/40 border border-gold/20 px-2 py-1 text-xs outline-none focus:border-gold text-center" />
                      </>
                    )}
                    <button onClick={() => remove(c, it.id)} className="text-magenta opacity-70 hover:opacity-100">
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </AppShell>
  );
}