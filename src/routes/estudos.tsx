import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useRef, useState } from "react";
import { ArrowLeftRight, Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { useEstudos } from "@/hooks/useEstudos";
import type { StudyTrack, StudyTopic } from "@/types/models";

export const Route = createFileRoute("/estudos")({
  head: () => ({ meta: [{ title: "Estudos — Esther's Planner" }] }),
  component: EstudosPage,
});

function EstudosPage() {
  const estudos = useEstudos();
  const { tracks, isLoading } = estudos;
  const [pressing, setPressing] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canSwap = tracks.length >= 2;
  const startPress = (id: string) => {
    if (!canSwap) return;
    setPressing(id);
    timer.current = setTimeout(() => {
      estudos.swapTracks(tracks[0], tracks[1]);
      setPressing(null);
    }, 600);
  };
  const cancelPress = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPressing(null);
  };

  return (
    <AppShell title="Estudos" subtitle="Conhecimento que se acumula em silêncio">
      <p className="text-[10px] tracking-[0.3em] uppercase text-silver/60 mb-3 flex items-center gap-2">
        <ArrowLeftRight className="h-3 w-3" strokeWidth={1.5} />
        Pressione e segure o título para inverter a ordem
      </p>
      {isLoading ? (
        <p className="text-sm text-muted-foreground italic font-display flex items-center gap-2 py-10">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              topics={estudos.topicsOf(track.id)}
              pressing={pressing === track.id}
              onPressStart={() => startPress(track.id)}
              onPressEnd={cancelPress}
              onAdd={(title) => estudos.addTopic(track.id, title)}
              onToggle={(t) => estudos.toggleTopic(t)}
              onEdit={(id, title) => estudos.editTopic(id, title)}
              onRemove={(id) => estudos.removeTopic(id)}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function TrackCard({
  track, topics, pressing, onPressStart, onPressEnd, onAdd, onToggle, onEdit, onRemove,
}: {
  track: StudyTrack;
  topics: StudyTopic[];
  pressing: boolean;
  onPressStart: () => void;
  onPressEnd: () => void;
  onAdd: (title: string) => void;
  onToggle: (t: StudyTopic) => void;
  onEdit: (id: string, title: string) => void;
  onRemove: (id: string) => void;
}) {
  const [newItem, setNewItem] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const done = topics.filter((t) => t.is_done).length;

  const add = () => {
    if (!newItem.trim()) return;
    onAdd(newItem.trim());
    setNewItem("");
  };
  const saveEdit = () => {
    if (editingId && draft.trim()) onEdit(editingId, draft.trim());
    setEditingId(null);
  };

  return (
    <section className="glass-card p-6">
      <h2
        onMouseDown={onPressStart}
        onMouseUp={onPressEnd}
        onMouseLeave={onPressEnd}
        onTouchStart={onPressStart}
        onTouchEnd={onPressEnd}
        onTouchCancel={onPressEnd}
        className={`font-display text-2xl text-gold mb-1 cursor-pointer select-none inline-block transition ${pressing ? "scale-95 text-magenta" : ""}`}
      >
        {track.name}
      </h2>
      <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-5">{track.subtitle}</p>

      <div className="space-y-2">
        {topics.length > 0 && (
          <div className="flex items-center justify-between text-[10px] tracking-[0.3em] uppercase text-silver/70 mb-1">
            <span>Progresso</span>
            <span className="text-gold">{done}/{topics.length}</span>
          </div>
        )}
        <ul className="space-y-1.5">
          {topics.map((t) => (
            <li
              key={t.id}
              className={`group flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                t.is_done ? "border-wine/40 bg-wine/10" : "border-[oklch(0.85_0.008_250/0.12)] bg-black/30"
              }`}
            >
              {editingId === t.id ? (
                <>
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    className="flex-1 bg-transparent outline-none border-b border-gold/40 pb-0.5"
                  />
                  <button onClick={saveEdit} className="text-gold"><Check className="h-4 w-4" strokeWidth={1.5} /></button>
                  <button onClick={() => setEditingId(null)} className="text-muted-foreground"><X className="h-4 w-4" strokeWidth={1.5} /></button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onToggle(t)}
                    aria-label="Marcar concluído"
                    className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition ${
                      t.is_done ? "bg-darkred border-darkred" : "border-silver/40 hover:border-gold"
                    }`}
                  >
                    {t.is_done && <Check className="h-3 w-3 text-silver" strokeWidth={2.5} />}
                  </button>
                  <span className={`flex-1 ${t.is_done ? "line-through text-silver/50" : "text-foreground/85"}`}>{t.title}</span>
                  <button onClick={() => { setEditingId(t.id); setDraft(t.title); }} className="opacity-60 group-hover:opacity-100 text-gold transition" aria-label="Editar">
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => onRemove(t.id)} className="opacity-60 group-hover:opacity-100 text-darkred transition" aria-label="Remover">
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
        <div className="flex gap-2 pt-1">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Novo tópico"
            className="flex-1 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <button onClick={add} className="rounded-md border border-gold/40 text-gold px-3 py-2 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center gap-1">
            <Plus className="h-4 w-4" strokeWidth={1.5} /> Add
          </button>
        </div>
      </div>
    </section>
  );
}
