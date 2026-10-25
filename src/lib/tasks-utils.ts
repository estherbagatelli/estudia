import { addDays, differenceInCalendarDays, format, parseISO, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";

export type TarefaPrioridade = "baixa" | "media" | "alta";

export type TarefaStatus = "pendente" | "em_andamento" | "concluida";

export type TarefaCategoria =
  "conteudo" | "estudo" | "revisao" | "atividade" | "trabalho" | "prova";

export type FiltroTarefas = "todas" | "academicas" | "pessoais";

export type TarefaPlanejada = {
  id: string;
  title: string;
  due_date: string | null;
  priority: TarefaPrioridade;
  status: TarefaStatus;
  kind: TarefaCategoria | null;
  is_academic: boolean;
};

const PESO: Record<TarefaPrioridade, number> = {
  alta: 3,
  media: 2,
  baixa: 1,
};

const NOMES_CATEGORIA: Record<TarefaCategoria, string> = {
  conteudo: "Conteúdo",
  estudo: "Estudo",
  revisao: "Revisão",
  atividade: "Atividade",
  trabalho: "Trabalho",
  prova: "Prova",
};

export function nomeCategoria(categoria: TarefaCategoria | null): string {
  if (!categoria) return "Sem categoria";

  return NOMES_CATEGORIA[categoria];
}

export function nomePrioridade(prioridade: TarefaPrioridade): string {
  const nomes: Record<TarefaPrioridade, string> = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
  };

  return nomes[prioridade];
}

export function nomeStatus(status: TarefaStatus): string {
  const nomes: Record<TarefaStatus, string> = {
    pendente: "Pendente",
    em_andamento: "Em andamento",
    concluida: "Concluída",
  };

  return nomes[status];
}

export function ordenarTarefas<T extends TarefaPlanejada>(tarefas: T[]): T[] {
  return [...tarefas].sort((a, b) => {
    // Tarefas com prazo aparecem antes das tarefas sem prazo.
    const dataA = a.due_date ?? "9999-12-31";
    const dataB = b.due_date ?? "9999-12-31";

    const diferencaData = dataA.localeCompare(dataB);

    if (diferencaData !== 0) {
      return diferencaData;
    }

    // Em caso de empate, maior prioridade vem primeiro.
    return PESO[b.priority] - PESO[a.priority];
  });
}

export function urgencia(dueDate: string | null): "atrasada" | "urgente" | "proxima" | "neutro" {
  if (!dueDate) return "neutro";

  const dias = differenceInCalendarDays(parseISO(dueDate), startOfToday());

  if (dias < 0) return "atrasada";
  if (dias <= 1) return "urgente";
  if (dias <= 7) return "proxima";

  return "neutro";
}

export function filtrarTarefas<T extends TarefaPlanejada>(
  tarefas: T[],
  filtro: FiltroTarefas,
  status?: TarefaStatus,
): T[] {
  const filtradas = tarefas.filter((tarefa) => {
    const correspondeAoTipo =
      filtro === "todas" ||
      (filtro === "academicas" && tarefa.is_academic) ||
      (filtro === "pessoais" && !tarefa.is_academic);

    const correspondeAoStatus = status === undefined || tarefa.status === status;

    return correspondeAoTipo && correspondeAoStatus;
  });

  return ordenarTarefas(filtradas);
}

const FEMININO: Record<TarefaCategoria, boolean> = {
  conteudo: false,
  estudo: false,
  revisao: true,
  atividade: true,
  trabalho: false,
  prova: true,
};

export function frasePrazo(tipo: TarefaCategoria | null, dias: number): string {
  // Sem categoria, a frase fala de "Tarefa" ("Tarefa amanhã").
  const nome = tipo ? nomeCategoria(tipo) : "Tarefa";
  const atrasada = !tipo || FEMININO[tipo] ? "atrasada" : "atrasado";

  if (dias < 0) return `${nome} ${atrasada}`;
  if (dias === 0) return `${nome} hoje`;
  if (dias === 1) return `${nome} amanhã`;

  return `${nome} em ${dias} dias`;
}

export function formatarPrazo(dueDate: string | null): string {
  if (!dueDate) return "Sem prazo definido";

  return format(parseISO(dueDate), "dd/MM/yyyy", {
    locale: ptBR,
  });
}

export function contarPendentes(tarefas: TarefaPlanejada[]): number {
  return tarefas.filter((tarefa) => tarefa.status !== "concluida").length;
}

export function provasDeAmanha<T extends TarefaPlanejada>(tarefas: T[], hoje = new Date()): T[] {
  const amanha = format(addDays(hoje, 1), "yyyy-MM-dd");

  return ordenarTarefas(tarefas).filter(
    (tarefa) =>
      tarefa.kind === "prova" && tarefa.due_date === amanha && tarefa.status !== "concluida",
  );
}
