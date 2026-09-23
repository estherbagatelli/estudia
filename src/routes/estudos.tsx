import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { EditableList } from "@/components/EditableList";
import { useEffect, useRef, useState } from "react";
import { useCloudState } from "@/hooks/useCloudState";
import { ArrowLeftRight } from "lucide-react";

export const Route = createFileRoute("/estudos")({
  head: () => ({ meta: [{ title: "Estudos — Esther's Planner" }] }),
  component: EstudosPage,
});

const FACULDADE = [
  "Informática Básica — Sistemas Operacionais",
  "Informática Básica — Organização de arquivos",
  "Informática Básica — Internet e Segurança",
  "Informática Básica — Ferramentas de produtividade",
  "Pacote Office — Word",
  "Pacote Office — Excel",
  "Pacote Office — PowerPoint",
  "Java — Lógica aplicada",
  "Java — Sintaxe",
  "Java — POO",
  "Java — Estruturas de Dados",
  "Java — Banco de Dados",
];

const ESTAGIO = [
  "Lógica de Programação — Algoritmos",
  "Lógica de Programação — Estruturas de decisão",
  "Lógica de Programação — Repetição",
  "Lógica de Programação — Funções",
  "Vibe Coding — Conceitos",
  "Vibe Coding — Engenharia de Prompt",
  "Vibe Coding — IA aplicada",
  "No-Code — Conceitos",
  "No-Code — Ferramentas",
  "No-Code — Fluxo",
  "Lovable — Interface",
  "Lovable — Estrutura",
  "Lovable — Criação",
  "Lovable — Componentes",
  "Lovable — Prompts",
  "Lovable — Publicação",
  "Engenharia de Software — Levantamento",
  "Engenharia de Software — Requisitos",
  "Engenharia de Software — Casos de Uso",
  "Engenharia de Software — Histórias de Usuário",
  "Metodologias Ágeis — Scrum",
  "Metodologias Ágeis — Kanban",
  "Metodologias Ágeis — Sprint",
  "Metodologias Ágeis — Backlog",
  "Metodologias Ágeis — Product Owner",
  "UI Design — Hierarquia",
  "UI Design — Tipografia",
  "UI Design — Cores",
  "UI Design — Grid",
  "UI Design — Gestalt",
  "UI Design — Design Systems",
  "UI Design — Responsividade",
  "UX Design — Usabilidade",
  "UX Design — Pesquisa",
  "UX Design — Personas",
  "UX Design — Jornada",
  "UX Design — Wireframes",
  "UX Design — Protótipos",
  "UX Design — Testes",
  "Ferramentas de Design — Figma",
  "Front-end — HTML",
  "Front-end — CSS",
  "Front-end — JavaScript",
];

function EstudosPage() {
  const [order, setOrder] = useCloudState<("faculdade" | "estagio")[]>("estudos.order", ["faculdade", "estagio"]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [pressing, setPressing] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const swap = () => setOrder([order[1], order[0]]);
  const startPress = (id: string) => {
    setPressing(id);
    timer.current = setTimeout(() => { swap(); setPressing(null); }, 600);
  };
  const cancelPress = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPressing(null);
  };

  const sections: Record<"faculdade" | "estagio", { title: string; subtitle: string; storageKey: string; initial: string[] }> = {
    faculdade: { title: "Faculdade", subtitle: "Ciência da Computação", storageKey: "estudos.faculdade", initial: FACULDADE },
    estagio: { title: "Estágio", subtitle: "UI/UX + Front-end", storageKey: "estudos.estagio", initial: ESTAGIO },
  };

  const renderOrder = mounted ? order : (["faculdade", "estagio"] as const);

  return (
    <AppShell title="Estudos" subtitle="Conhecimento que se acumula em silêncio">
      <p className="text-[10px] tracking-[0.3em] uppercase text-silver/60 mb-3 flex items-center gap-2">
        <ArrowLeftRight className="h-3 w-3" strokeWidth={1.5} />
        Pressione e segure o título para inverter a ordem
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        {renderOrder.map((id) => {
          const s = sections[id];
          return (
            <section key={id} className="glass-card p-6">
              <h2
                onMouseDown={() => startPress(id)}
                onMouseUp={cancelPress}
                onMouseLeave={cancelPress}
                onTouchStart={() => startPress(id)}
                onTouchEnd={cancelPress}
                onTouchCancel={cancelPress}
                className={`font-display text-2xl text-gold mb-1 cursor-pointer select-none inline-block transition ${pressing === id ? "scale-95 text-magenta" : ""}`}
              >
                {s.title}
              </h2>
              <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-5">{s.subtitle}</p>
              <EditableList storageKey={s.storageKey} initial={s.initial} placeholder="Novo tópico" checkable />
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}