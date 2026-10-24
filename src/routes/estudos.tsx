import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useRef, useState } from "react";
import { ArrowLeftRight, Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { useEstudos } from "@/hooks/useEstudos";
import type { StudyTrack, StudyTopic } from "@/types/models";


const TIPOS = {
  conteudo: { rotulo: "Conteúdo", cor: "text-silver" },
  estudo: { rotulo: "Estudo", cor: "text-gold" },
  revisao: { rotulo: "Revisão", cor: "text-gold" },
  atividade: { rotulo: "Atividade", cor: "text-pink" },
  trabalho: { rotulo: "Trabalho", cor: "text-magenta" },
  prova: { rotulo: "Prova", cor: "text-darkred" },
} as const;

type TipoConteudo = keyof typeof TIPOS;

export const Route = createFileRoute("/estudos")({
  head: () => ({ meta: [{ title: "Estudos — Estudia" }] }),
  component: EstudosPage,
});

function EstudosPage() {
  const estudos = useEstudos();
  const { tracks, isLoading } = estudos;
  const [pressing, setPressing] = useState<string | null>(null);

  const [nomeMateria, setNomeMateria] = useState("");
  const [curso, setCurso] = useState("");
  const [periodo, setPeriodo] = useState("");

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);


  const cadastrarMateria = () => {
    if (!nomeMateria.trim()) return;

    estudos.addTrack(
      nomeMateria.trim(),
      curso.trim(),
      periodo.trim()
    );

    setNomeMateria("");
    setCurso("");
    setPeriodo("");
  };


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

      <section className="glass-card p-6 mb-6">
        <h2 className="text-xl font-display text-gold mb-4">
          Cadastrar matéria
        </h2>

        <div className="grid gap-3">
          <input
            type="text"
            placeholder="Nome da matéria"
            value={nomeMateria}
            onChange={(e) => setNomeMateria(e.target.value)}
            className="w-full rounded-md border p-3 bg-transparent"
          />

          <input
            type="text"
            placeholder="Curso (opcional)"
            value={curso}
            onChange={(e) => setCurso(e.target.value)}
            className="w-full rounded-md border p-3 bg-transparent"
          />

          <input
            type="text"
            placeholder="Período (opcional)"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="w-full rounded-md border p-3 bg-transparent"
          />

          <button
            type="button"
            onClick={cadastrarMateria}
            className="rounded-md bg-gold px-4 py-3 text-primary-foreground"
          >
            Adicionar matéria
          </button>
        </div>
      </section>

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

          {tracks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Você ainda não adicionou nenhuma matéria.
            </p>
          )}

          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}

              onEditTrack={(name) => estudos.editTrack(track.id, name)}


              onDelete={() => estudos.removeTrack(track.id)}

              topics={estudos.topicsOf(track.id)}
              pressing={pressing === track.id}
              onPressStart={() => startPress(track.id)}
              onPressEnd={cancelPress}
              onAdd={(title, kind) =>
                estudos.addTopic(track.id, title, kind)
              }
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
  track,
  onDelete,
  onEditTrack,
  topics,
  pressing,
  onPressStart,
  onPressEnd,
  onAdd,
  onToggle,
  onEdit,
  onRemove,
}: {
  track: StudyTrack;
  topics: StudyTopic[];
  onDelete: () => void;
  onEditTrack: (name: string) => void;
  pressing: boolean;
  onPressStart: () => void;
  onPressEnd: () => void;

  onAdd: (title: string, kind: TipoConteudo) => void;

  onToggle: (t: StudyTopic) => void;
  onEdit: (id: string, title: string) => void;
  onRemove: (id: string) => void;
}) {
  const [newItem, setNewItem] = useState("");

  const [tipoConteudo, setTipoConteudo] =
    useState<TipoConteudo>("conteudo");



  const [editandoMateria, setEditandoMateria] = useState(false);
  const [novoNomeMateria, setNovoNomeMateria] = useState(track.name);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const done = topics.filter((t) => t.is_done).length;

  const progresso = topics.length
    ? Math.round((done / topics.length) * 100)
    : 0;


  const add = () => {
    if (!newItem.trim()) return;

    onAdd(newItem.trim(), tipoConteudo);

    setNewItem("");
    setTipoConteudo("conteudo");
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

      <button
        type="button"
        onClick={() => {
          setNovoNomeMateria(track.name);
          setEditandoMateria(true);
        }}
        className="text-gold hover:opacity-70 transition mt-2"
        aria-label="Editar matéria"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {editandoMateria && (
        <div className="flex gap-2 mt-3 mb-3">
          <input
            type="text"
            value={novoNomeMateria}
            onChange={(e) => setNovoNomeMateria(e.target.value)}
            className="flex-1 min-w-0 rounded-md border p-2 bg-transparent"
            placeholder="Novo nome da matéria"
          />

          <button
            type="button"
            onClick={() => {
              if (!novoNomeMateria.trim()) return;
              onEditTrack(novoNomeMateria.trim());
              setEditandoMateria(false);
            }}
            className="text-gold"
            aria-label="Salvar nome"
          >
            <Check className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setEditandoMateria(false)}
            className="text-muted-foreground"
            aria-label="Cancelar edição"
          >
            <X className="h-5 w-5" />
          </button>

        </div>
      )}



      <button
        type="button"
        onClick={() => {
          if (window.confirm("Deseja realmente excluir esta matéria?")) {
            onDelete();
          }
        }}
        className="text-darkred hover:opacity-70 transition mt-2"
        aria-label="Excluir matéria"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-5">
        {track.subtitle}
      </p>


      <div className="mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span>Progresso da matéria</span>
          <span>{progresso}%</span>
        </div>

        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all"
            style={{ width: `${progresso}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          {done} de {topics.length} conteúdos concluídos
        </p>
      </div>


      <div className="space-y-2">
        {topics.length > 0 && (
          <div className="flex items-center justify-between text-[10px] tracking-[0.3em] uppercase text-silver/70 mb-1">
            <span>Progresso</span>
            <span className="text-gold">
              {done}/{topics.length}
            </span>
          </div>
        )}
        <ul className="space-y-1.5">
          {topics.map((t) => (
            <li
              key={t.id}
              className={`group flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${t.is_done
                ? "border-wine/40 bg-wine/10"
                : "border-[oklch(0.85_0.008_250/0.12)] bg-black/30"
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
                  <button onClick={saveEdit} className="text-gold">
                    <Check className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-muted-foreground">
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onToggle(t)}
                    aria-label="Marcar concluído"
                    className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition ${t.is_done ? "bg-darkred border-darkred" : "border-silver/40 hover:border-gold"
                      }`}
                  >
                    {t.is_done && <Check className="h-3 w-3 text-silver" strokeWidth={2.5} />}
                  </button>
                  <span
                    className={`flex-1 ${t.is_done ? "line-through text-silver/50" : "text-foreground/85"}`}
                  >
                    {t.title}
                  </span>

                  <span
                    className={`text-xs rounded-md border px-2 py-1 ${TIPOS[t.kind ?? "conteudo"].cor
                      }`}
                  >
                    {TIPOS[t.kind ?? "conteudo"].rotulo}
                  </span>

                  <button
                    onClick={() => {
                      setEditingId(t.id);
                      setDraft(t.title);
                    }}
                    className="opacity-60 group-hover:opacity-100 text-gold transition"
                    aria-label="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => onRemove(t.id)}
                    className="opacity-60 group-hover:opacity-100 text-darkred transition"
                    aria-label="Remover"

                  >
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
            className="flex-1 min-w-0 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold"
          />

          <select
            value={tipoConteudo}
            onChange={(e) =>
              setTipoConteudo(e.target.value as TipoConteudo)
            }
            aria-label="Tipo de conteúdo"
            className="rounded-md border border-gold/40 bg-background text-foreground px-3 py-2 text-sm"
          >
            {Object.entries(TIPOS).map(([valor, info]) => (
              <option key={valor} value={valor}>
                {info.rotulo}
              </option>
            ))}
          </select>

          <button
            onClick={add}
            className="rounded-md border border-gold/40 text-gold px-3 py-2 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center gap-1"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} /> Add
          </button>
        </div>
      </div>
    </section>
  );
}

