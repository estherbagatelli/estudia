import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Plus, Trash2, Check, Loader2 } from "lucide-react";
import { useHobbies, HOBBY_KINDS } from "@/hooks/useHobbies";
import type { HobbyItem, HobbyKind } from "@/types/models";

export const Route = createFileRoute("/hobbies")({
  head: () => ({ meta: [{ title: "Hobbies — Estudia" }] }),
  component: HobbiesPage,
});

function HobbiesPage() {
  const hobbies = useHobbies();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<HobbyKind>("filme");

  const add = () => {
    if (!title.trim()) return;
    hobbies.add(kind, title.trim());
    setTitle("");
  };

  return (
    <AppShell title="Hobbies" subtitle="Metas do ano · checklist pessoal">
      <div className="glass-card p-5 mb-6 flex flex-col md:flex-row gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Título"
          className="flex-1 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as HobbyKind)}
          className="rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold"
        >
          {HOBBY_KINDS.map((c) => (
            <option key={c.kind} value={c.kind}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          onClick={add}
          className="rounded-md border border-gold/40 text-gold px-4 py-2 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center gap-1 justify-center"
        >
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>

      {hobbies.isLoading ? (
        <p className="text-sm text-muted-foreground italic font-display flex items-center gap-2 py-10">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {HOBBY_KINDS.map((c) => {
            const items = hobbies.itemsOf(c.kind);
            return (
              <section key={c.kind} className="glass-card p-6">
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="font-display text-2xl text-gold">{c.label}</h2>
                  <span className="text-xs text-muted-foreground">
                    {items.filter((i) => i.is_done).length}/{items.length}
                  </span>
                </div>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic font-display">
                    Nada por aqui ainda.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((it) => (
                      <HobbyRow
                        key={it.id}
                        item={it}
                        withProgress={c.kind === "serie" || c.kind === "anime"}
                        onToggle={() => hobbies.toggle(it)}
                        onRemove={() => hobbies.remove(it.id)}
                        onProgress={(s, e) => hobbies.setProgress(it.id, s, e)}
                      />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function HobbyRow({
  item,
  withProgress,
  onToggle,
  onRemove,
  onProgress,
}: {
  item: HobbyItem;
  withProgress: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onProgress: (season: number | null, episode: number | null) => void;
}) {
  const [season, setSeason] = useState(item.season?.toString() ?? "");
  const [episode, setEpisode] = useState(item.episode?.toString() ?? "");

  const commit = () =>
    onProgress(season.trim() ? Number(season) : null, episode.trim() ? Number(episode) : null);

  return (
    <li className="flex items-center gap-2 border border-[oklch(0.85_0.008_250/0.12)] rounded-md bg-black/30 px-3 py-2">
      <button
        onClick={onToggle}
        className={`h-5 w-5 rounded border flex items-center justify-center transition ${item.is_done ? "bg-gold border-gold" : "border-gold/40"}`}
      >
        {item.is_done && (
          <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
        )}
      </button>
      <span
        className={`flex-1 text-sm ${item.is_done ? "line-through text-muted-foreground" : ""}`}
      >
        {item.title}
      </span>
      {withProgress && !item.is_done && (
        <>
          <input
            value={season}
            onChange={(e) => setSeason(e.target.value.replace(/\D/g, ""))}
            onBlur={commit}
            placeholder="Temp."
            inputMode="numeric"
            className="w-14 rounded bg-black/40 border border-gold/20 px-2 py-1 text-xs outline-none focus:border-gold text-center"
          />
          <input
            value={episode}
            onChange={(e) => setEpisode(e.target.value.replace(/\D/g, ""))}
            onBlur={commit}
            placeholder="Ep."
            inputMode="numeric"
            className="w-14 rounded bg-black/40 border border-gold/20 px-2 py-1 text-xs outline-none focus:border-gold text-center"
          />
        </>
      )}
      <button onClick={onRemove} className="text-magenta opacity-70 hover:opacity-100">
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
    </li>
  );
}
