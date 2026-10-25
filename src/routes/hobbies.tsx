import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Plus, Trash2, Check, Loader2, Calendar, Star, Clock, Sparkles } from "lucide-react";
import { useHobbies, HOBBY_KINDS } from "@/hooks/useHobbies";
import type { HobbyItem, HobbyKind, HobbyStatus } from "@/types/models";
import { differenceInCalendarDays, startOfToday, parseISO } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/hobbies")({
  head: () => ({ meta: [{ title: "Hobbies — Estudia" }] }),
  component: HobbiesPage,
});

const STATUS_CONFIG: Record<HobbyStatus, { rotulo: string; cor: string; bg: string }> = {
  nao_iniciado: {
    rotulo: "Não iniciado",
    cor: "text-muted-foreground",
    bg: "bg-muted/40",
  },
  em_andamento: {
    rotulo: "Em andamento",
    cor: "text-gold",
    bg: "bg-gold/15",
  },
  concluido: {
    rotulo: "Concluído",
    cor: "text-magenta",
    bg: "bg-magenta/15",
  },
} as const;

function HobbiesPage() {
  const hobbies = useHobbies();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<HobbyKind>("filme");
  const [genre, setGenre] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [status, setStatus] = useState<HobbyStatus>("nao_iniciado");

  const add = () => {
    if (!title.trim()) {
      toast.error("Informe o título do hobby.");
      return;
    }
    hobbies.add({
      kind,
      title: title.trim(),
      genre: genre.trim() || null,
      goalDate: goalDate ? goalDate : null,
      status,
    });
    toast.success("Hobby adicionado com sucesso!");
    setTitle("");
    setGenre("");
    setGoalDate("");
    setStatus("nao_iniciado");
  };

  const hasAnyItems = hobbies.items.length > 0;

  return (
    <AppShell title="Hobbies" subtitle="Metas de entretenimento e cultura · checklist pessoal">
      {/* Formulário de adicionar hobby */}
      <section className="glass-card p-5 mb-6 rounded-xl border border-border">
        <h3 className="font-display text-base text-gold mb-3 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" /> Novo hobby ou meta
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Título (ex: Interestelar, Dom Casmurro)"
            className="rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:border-gold lg:col-span-2"
          />

          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as HobbyKind)}
            className="rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:border-gold text-foreground"
          >
            {HOBBY_KINDS.map((c) => (
              <option key={c.kind} value={c.kind}>
                {c.label}
              </option>
            ))}
          </select>

          <input
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Gênero (ex: Ficção, Ação)"
            className="rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:border-gold"
          />

          <input
            type="date"
            value={goalDate}
            onChange={(e) => setGoalDate(e.target.value)}
            title="Meta por data"
            className="rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:border-gold text-foreground"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 pt-3 border-t border-border/40">
          <div className="flex items-center gap-2 text-xs text-muted-foreground w-full sm:w-auto">
            <span>Status inicial:</span>
            <div className="flex rounded-md border border-border p-0.5 bg-background/50">
              {(Object.keys(STATUS_CONFIG) as HobbyStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`px-2.5 py-1 text-xs rounded transition ${
                    status === st
                      ? `${STATUS_CONFIG[st].bg} ${STATUS_CONFIG[st].cor} font-medium`
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {STATUS_CONFIG[st].rotulo}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={add}
            className="w-full sm:w-auto rounded-md border border-gold/40 text-gold px-5 py-2 text-sm hover:bg-gold hover:text-background transition flex items-center gap-1.5 justify-center font-medium"
          >
            <Plus className="h-4 w-4" /> Adicionar hobby
          </button>
        </div>
      </section>

      {hobbies.isLoading ? (
        <p className="text-sm text-muted-foreground italic font-display flex items-center gap-2 py-10">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </p>
      ) : !hasAnyItems ? (
        /* Estado vazio combinado com Esther */
        <div className="glass-card p-10 rounded-xl border border-border text-center my-6">
          <p className="text-sm text-muted-foreground italic">
            Você ainda não adicionou nenhum hobby. Que tal começar?
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {HOBBY_KINDS.map((c) => {
            const items = hobbies.itemsOf(c.kind);
            const total = items.length;
            const concluidos = items.filter((i) => i.status === "concluido" || i.is_done).length;

            return (
              <section key={c.kind} className="glass-card p-6 rounded-xl border border-border">
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="font-display text-2xl text-gold">{c.label}</h2>
                  <span className="text-xs text-muted-foreground font-mono">
                    {concluidos}/{total} concluído(s)
                  </span>
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-3 text-center">
                    Nenhum item nesta categoria ainda.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {items.map((it) => (
                      <HobbyRow
                        key={it.id}
                        item={it}
                        withProgress={c.kind === "serie" || c.kind === "anime"}
                        onToggle={() => hobbies.toggle(it)}
                        onStatusChange={(newStatus) => {
                          hobbies.setStatus(it.id, newStatus);
                          toast.success(
                            `Status alterado para "${STATUS_CONFIG[newStatus].rotulo}"`,
                          );
                        }}
                        onRatingChange={(newRating) => {
                          hobbies.updateItem(it.id, { rating: newRating });
                          toast.success("Avaliação atualizada!");
                        }}
                        onRemove={() => {
                          hobbies.remove(it.id);
                          toast.success("Hobby removido.");
                        }}
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
  onStatusChange,
  onRatingChange,
  onRemove,
  onProgress,
}: {
  item: HobbyItem;
  withProgress: boolean;
  onToggle: () => void;
  onStatusChange: (status: HobbyStatus) => void;
  onRatingChange: (rating: number | null) => void;
  onRemove: () => void;
  onProgress: (season: number | null, episode: number | null) => void;
}) {
  const [season, setSeason] = useState(item.season?.toString() ?? "");
  const [episode, setEpisode] = useState(item.episode?.toString() ?? "");

  const commitProgress = () =>
    onProgress(season.trim() ? Number(season) : null, episode.trim() ? Number(episode) : null);

  const currentStatus: HobbyStatus = item.status ?? (item.is_done ? "concluido" : "nao_iniciado");
  const isConcluido = currentStatus === "concluido" || item.is_done;

  // Cálculo da meta por data usando date-fns
  let goalBadge = null;
  if (item.goal_date) {
    try {
      const parsedDate = parseISO(item.goal_date);
      const dias = differenceInCalendarDays(parsedDate, startOfToday());

      if (isConcluido) {
        goalBadge = (
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Meta atingida
          </span>
        );
      } else if (dias < 0) {
        // Meta vencida e não concluída → destaque com text-darkred
        goalBadge = (
          <span className="text-[11px] text-darkred font-semibold flex items-center gap-1">
            <Clock className="h-3 w-3" /> Atrasada ({Math.abs(dias)}d atrás)
          </span>
        );
      } else if (dias === 0) {
        goalBadge = (
          <span className="text-[11px] text-darkred font-semibold flex items-center gap-1">
            <Clock className="h-3 w-3" /> Vence hoje!
          </span>
        );
      } else {
        goalBadge = (
          <span className="text-[11px] text-gold flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Em {dias} dia{dias > 1 ? "s" : ""}
          </span>
        );
      }
    } catch {
      goalBadge = null;
    }
  }

  return (
    <li className="flex flex-col gap-2 border border-border rounded-lg bg-card/60 p-3">
      <div className="flex items-center gap-2">
        {/* Checkbox rápido */}
        <button
          onClick={onToggle}
          className={`h-5 w-5 rounded border flex items-center justify-center transition shrink-0 ${
            isConcluido ? "bg-magenta border-magenta" : "border-gold/40 hover:border-gold"
          }`}
          title={isConcluido ? "Marcar como não concluído" : "Marcar como concluído"}
        >
          {isConcluido && <Check className="h-3.5 w-3.5 text-background" strokeWidth={2.5} />}
        </button>

        {/* Título */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm truncate font-medium ${
              isConcluido ? "line-through text-muted-foreground" : "text-foreground"
            }`}
          >
            {item.title}
          </p>
        </div>

        {/* Seletor de status com etiqueta visual */}
        <select
          value={currentStatus}
          onChange={(e) => onStatusChange(e.target.value as HobbyStatus)}
          className={`text-xs px-2 py-1 rounded-md border border-border bg-background/80 outline-none cursor-pointer font-medium ${
            STATUS_CONFIG[currentStatus].cor
          }`}
        >
          <option value="nao_iniciado">Não iniciado</option>
          <option value="em_andamento">Em andamento</option>
          <option value="concluido">Concluído</option>
        </select>

        {/* Botão de excluir */}
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-darkred transition p-1"
          aria-label="Excluir hobby"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Linha secundária: Gênero, Meta por data, Progresso e Estrelas */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/30 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {item.genre && (
            <span className="rounded bg-wine/25 border border-pink/30 px-1.5 py-0.5 text-[10px] text-silver font-medium">
              {item.genre}
            </span>
          )}

          {goalBadge}
        </div>

        <div className="flex items-center gap-3">
          {/* Progresso de série / anime */}
          {withProgress && !isConcluido && (
            <div className="flex items-center gap-1">
              <input
                value={season}
                onChange={(e) => setSeason(e.target.value.replace(/\D/g, ""))}
                onBlur={commitProgress}
                placeholder="T."
                title="Temporada"
                inputMode="numeric"
                className="w-10 rounded bg-background/80 border border-border px-1 py-0.5 text-xs outline-none focus:border-gold text-center"
              />
              <span className="text-muted-foreground text-[10px]">T</span>
              <input
                value={episode}
                onChange={(e) => setEpisode(e.target.value.replace(/\D/g, ""))}
                onBlur={commitProgress}
                placeholder="Ep."
                title="Episódio"
                inputMode="numeric"
                className="w-10 rounded bg-background/80 border border-border px-1 py-0.5 text-xs outline-none focus:border-gold text-center"
              />
              <span className="text-muted-foreground text-[10px]">Ep</span>
            </div>
          )}

          {/* Item 9: Avaliação por estrelas (1 a 5) */}
          <div className="flex items-center gap-0.5" title="Classificação por estrelas">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const filled = (item.rating ?? 0) >= starValue;
              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => onRatingChange(item.rating === starValue ? null : starValue)}
                  className="hover:scale-110 transition p-0.5"
                  aria-label={`Avaliar ${starValue} estrela${starValue > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-3.5 w-3.5 ${
                      filled ? "text-gold fill-gold" : "text-muted-foreground/40 hover:text-gold/60"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </li>
  );
}
