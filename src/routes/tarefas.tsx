import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Clock, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import type { NovaTarefa } from "@/hooks/useTasks";
import {
  filtrarTarefas,
  formatarPrazo,
  nomeCategoria,
  nomePrioridade,
  nomeStatus,
  urgencia,
  type FiltroTarefas,
  type TarefaCategoria,
  type TarefaPrioridade,
  type TarefaStatus,
} from "@/lib/tasks-utils";
import type { Task } from "@/types/models";

export const Route = createFileRoute("/tarefas")({
  head: () => ({
    meta: [{ title: "Tarefas — Estudia" }],
  }),
  component: TarefasPage,
});

const tarefaInicial: NovaTarefa = {
  title: "",
  due_date: null,
  priority: "media",
  status: "pendente",
  kind: null,
  is_academic: true,
  track_id: null,
};

const categorias: {
  valor: TarefaCategoria;
  label: string;
}[] = [
  { valor: "conteudo", label: "Conteúdo" },
  { valor: "estudo", label: "Estudo" },
  { valor: "revisao", label: "Revisão" },
  { valor: "atividade", label: "Atividade" },
  { valor: "trabalho", label: "Trabalho" },
  { valor: "prova", label: "Prova" },
];

function TarefasPage() {
  const { tasks, isLoading, add, edit, toggle, remove } = useTasks();

  const [formulario, setFormulario] = useState<NovaTarefa>(tarefaInicial);

  const [filtro, setFiltro] = useState<FiltroTarefas>("todas");

  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [mensagem, setMensagem] = useState("");

  const tarefasFiltradas = filtrarTarefas(
    tasks,
    filtro,
    mostrarConcluidas ? "concluida" : undefined,
  ).filter((tarefa) =>
    mostrarConcluidas ? tarefa.status === "concluida" : tarefa.status !== "concluida",
  );

  function atualizarFormulario<K extends keyof NovaTarefa>(campo: K, valor: NovaTarefa[K]) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function salvarTarefa(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const titulo = formulario.title.trim();

    if (!titulo) {
      setMensagem("Digite o título da tarefa.");
      return;
    }

    const dados: NovaTarefa = {
      ...formulario,
      title: titulo,
      due_date: formulario.due_date || null,
      kind: formulario.kind || null,
      track_id: formulario.track_id || null,
    };

    if (editingId) {
      edit({ id: editingId, ...dados });
      setMensagem("Tarefa atualizada.");
    } else {
      add(dados);
      setMensagem("Tarefa cadastrada.");
    }

    setFormulario(tarefaInicial);
    setEditingId(null);
  }

  function iniciarEdicao(tarefa: Task) {
    setEditingId(tarefa.id);

    setFormulario({
      title: tarefa.title,
      due_date: tarefa.due_date ?? null,
      priority: tarefa.priority,
      status: tarefa.status,
      kind: tarefa.kind,
      is_academic: tarefa.is_academic,
      track_id: tarefa.track_id,
    });

    setMensagem("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicao() {
    setEditingId(null);
    setFormulario(tarefaInicial);
    setMensagem("");
  }

  function excluirTarefa(id: string) {
    const confirmar = window.confirm("Deseja realmente excluir esta tarefa?");

    if (confirmar) {
      remove(id);
      setMensagem("Tarefa excluída.");
    }
  }

  function classesUrgencia(dueDate: string | null) {
    const tipo = urgencia(dueDate);

    if (tipo === "atrasada") {
      return "border-darkred text-darkred";
    }

    if (tipo === "urgente") {
      return "border-magenta text-magenta";
    }

    if (tipo === "proxima") {
      return "border-gold text-gold";
    }

    return "border-border text-muted-foreground";
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Minhas tarefas</h1>
        <p className="text-muted-foreground">Organize sua rotina acadêmica e pessoal.</p>
      </header>

      <section className="glass-card space-y-4 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">{editingId ? "Editar tarefa" : "Nova tarefa"}</h2>

        <form onSubmit={salvarTarefa} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="titulo" className="text-sm font-medium">
              Título *
            </label>

            <input
              id="titulo"
              value={formulario.title}
              onChange={(evento) => atualizarFormulario("title", evento.target.value)}
              placeholder="Ex.: Estudar para a prova"
              required
              maxLength={200}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="tipo" className="text-sm font-medium">
                Tipo de tarefa
              </label>

              <select
                id="tipo"
                value={formulario.kind ?? ""}
                onChange={(evento) =>
                  atualizarFormulario(
                    "kind",
                    (evento.target.value || null) as TarefaCategoria | null,
                  )
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              >
                <option value="">Sem categoria</option>

                {categorias.map((categoria) => (
                  <option key={categoria.valor} value={categoria.valor}>
                    {categoria.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="data" className="text-sm font-medium">
                Prazo
              </label>

              <input
                id="data"
                type="date"
                value={formulario.due_date ?? ""}
                onChange={(evento) => atualizarFormulario("due_date", evento.target.value || null)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="prioridade" className="text-sm font-medium">
                Prioridade
              </label>

              <select
                id="prioridade"
                value={formulario.priority}
                onChange={(evento) =>
                  atualizarFormulario("priority", evento.target.value as TarefaPrioridade)
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>

              <select
                id="status"
                value={formulario.status}
                onChange={(evento) =>
                  atualizarFormulario("status", evento.target.value as TarefaStatus)
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              >
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em andamento</option>
                <option value="concluida">Concluída</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="tipo-tarefa" className="text-sm font-medium">
              Categoria geral
            </label>

            <select
              id="tipo-tarefa"
              value={formulario.is_academic ? "academica" : "pessoal"}
              onChange={(evento) =>
                atualizarFormulario("is_academic", evento.target.value === "academica")
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            >
              <option value="academica">Acadêmica</option>
              <option value="pessoal">Pessoal</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="disciplina" className="text-sm font-medium">
              ID da disciplina (opcional)
            </label>

            <input
              id="disciplina"
              value={formulario.track_id ?? ""}
              onChange={(evento) =>
                atualizarFormulario("track_id", evento.target.value.trim() || null)
              }
              placeholder="ID da disciplina cadastrada"
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />

            <p className="text-xs text-muted-foreground">
              Para vincular a tarefa a uma disciplina, informe o ID correspondente. Deixe vazio se
              não houver disciplina.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground"
            >
              <Plus size={18} />
              {editingId ? "Salvar alterações" : "Adicionar tarefa"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelarEdicao}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2"
              >
                <X size={18} />
                Cancelar
              </button>
            )}
          </div>

          {mensagem && (
            <p role="status" className="text-sm text-muted-foreground">
              {mensagem}
            </p>
          )}
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">
            {mostrarConcluidas ? "Tarefas concluídas" : "Tarefas pendentes"}
          </h2>

          <button
            type="button"
            onClick={() => setMostrarConcluidas((atual) => !atual)}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            {mostrarConcluidas ? "Ver pendentes" : "Ver concluídas"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["todas", "Todas"],
              ["academicas", "Acadêmicas"],
              ["pessoais", "Pessoais"],
            ] as const
          ).map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setFiltro(valor)}
              aria-pressed={filtro === valor}
              className={`rounded-lg border px-3 py-2 text-sm ${
                filtro === valor
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              {texto}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-8 text-muted-foreground">
            <Loader2 size={20} className="animate-spin" />
            Carregando tarefas...
          </div>
        ) : tarefasFiltradas.length === 0 ? (
          <div className="glass-card rounded-xl border border-border p-8 text-center">
            <p className="font-medium">
              {mostrarConcluidas
                ? "Você ainda não possui tarefas concluídas."
                : "Você não possui tarefas pendentes."}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Cadastre uma tarefa para organizar sua rotina.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tarefasFiltradas.map((tarefa) => {
              const prazo = urgencia(tarefa.due_date);

              return (
                <article
                  key={tarefa.id}
                  className={`glass-card rounded-xl border p-4 ${classesUrgencia(tarefa.due_date)}`}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1 space-y-2">
                      <h3
                        className={`break-words text-lg font-semibold ${
                          tarefa.status === "concluida" ? "line-through opacity-70" : ""
                        }`}
                      >
                        {tarefa.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="rounded-md border border-border px-2 py-1">
                          {tarefa.is_academic ? "Acadêmica" : "Pessoal"}
                        </span>

                        <span className="rounded-md border border-border px-2 py-1">
                          {nomeCategoria(tarefa.kind)}
                        </span>

                        <span className="rounded-md border border-border px-2 py-1">
                          Prioridade: {nomePrioridade(tarefa.priority)}
                        </span>

                        <span className="rounded-md border border-border px-2 py-1">
                          {nomeStatus(tarefa.status)}
                        </span>
                      </div>

                      <p className="flex items-center gap-2 text-sm">
                        <Clock size={16} />
                        Prazo: {formatarPrazo(tarefa.due_date)}
                      </p>

                      {prazo === "atrasada" && tarefa.status !== "concluida" && (
                        <p className="text-sm font-semibold">Esta tarefa está atrasada.</p>
                      )}

                      {prazo === "urgente" && tarefa.status !== "concluida" && (
                        <p className="text-sm font-semibold">Prazo para hoje ou amanhã.</p>
                      )}

                      {prazo === "proxima" && tarefa.status !== "concluida" && (
                        <p className="text-sm">Prazo nos próximos sete dias.</p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggle(tarefa)}
                        title={tarefa.status === "concluida" ? "Reabrir tarefa" : "Concluir tarefa"}
                        aria-label={
                          tarefa.status === "concluida" ? "Reabrir tarefa" : "Concluir tarefa"
                        }
                        className="rounded-lg border border-border p-2"
                      >
                        <Check size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => iniciarEdicao(tarefa)}
                        title="Editar tarefa"
                        aria-label="Editar tarefa"
                        className="rounded-lg border border-border p-2"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => excluirTarefa(tarefa.id)}
                        title="Excluir tarefa"
                        aria-label="Excluir tarefa"
                        className="rounded-lg border border-border p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
