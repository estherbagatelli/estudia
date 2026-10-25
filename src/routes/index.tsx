import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CalendarDays,
  ChartColumn,
  Check,
  Clapperboard,
  Dumbbell,
  ListChecks,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { THEMES } from "@/lib/temas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estudia — Seu semestre, no seu ritmo." },
      {
        name: "description",
        content: "Organize seus estudos, suas tarefas e sua rotina em um só lugar.",
      },
    ],
  }),
  component: Landing,
});

const DESTAQUES = [
  {
    icone: CalendarDays,
    titulo: "Planeje",
    texto: "Seus estudos e tarefas em um só lugar.",
    cor: "bg-magenta/15 text-magenta",
  },
  {
    icone: ChartColumn,
    titulo: "Organize",
    texto: "Sua rotina de forma simples e visual.",
    cor: "bg-gold/15 text-gold",
  },
  {
    icone: Check,
    titulo: "Conquiste",
    texto: "Seus objetivos acadêmicos.",
    cor: "bg-wine/15 text-wine",
  },
];

const FUNCIONALIDADES = [
  {
    icone: CalendarClock,
    titulo: "Próximos prazos",
    texto: "Logo na entrada: “Prova amanhã”, “Trabalho em 3 dias”, “2 tarefas pendentes”.",
  },
  {
    icone: BookOpen,
    titulo: "Estudos",
    texto:
      "Seu curso, suas matérias e o progresso de cada uma, com prova, trabalho e revisão separados.",
  },
  {
    icone: ListChecks,
    titulo: "Tarefas",
    texto:
      "Prazo, prioridade e status, com as atrasadas em destaque e o filtro acadêmicas × pessoais.",
  },
  {
    icone: Dumbbell,
    titulo: "Rotina",
    texto: "Treino e dieta do dia, com a contagem dos treinos feitos no mês.",
  },
  {
    icone: Clapperboard,
    titulo: "Hobbies e mercado",
    texto: "Séries, filmes e livros com status e meta, e a lista de compras por categoria.",
  },
  {
    icone: Wallet,
    titulo: "Financeiro",
    texto: "Entradas e gastos do mês, pensado para o bolso de quem estuda.",
  },
];

/**
 * Landing Page — a primeira tela de quem ainda não tem conta.
 *
 * É pública: `/` está em PUBLIC_PATHS (src/lib/public-routes.ts), então ela
 * abre sem login. O planner fica em `/inicio`, atrás da autenticação.
 *
 * As cores vêm das variáveis do tema (magenta, gold, wine, pink), então o
 * fundo e os ícones acompanham o tema escolhido.
 */
function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Quem já está logado não precisa ver a apresentação do produto.
  useEffect(() => {
    if (!loading && user) navigate({ to: "/inicio", replace: true });
  }, [loading, user, navigate]);

  return (
    <div className="bg-background text-foreground relative isolate min-h-screen overflow-x-hidden">
      {/* ---------- Primeira tela ---------- */}
      <section id="inicio" className="relative flex min-h-screen flex-col">
        {/* Manchas de cor desfocadas no pé da tela */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[65%] overflow-hidden"
        >
          <div className="bg-magenta absolute -bottom-24 -left-40 h-[26rem] w-[34rem] rounded-full opacity-90 blur-[90px]" />
          <div className="bg-wine absolute -bottom-56 left-[12%] h-[24rem] w-[30rem] rounded-full opacity-90 blur-[90px]" />
          <div
            className="absolute -bottom-40 left-[38%] h-[22rem] w-[30rem] rounded-full blur-[90px]"
            style={{ background: "var(--glow-middle)" }}
          />
          <div className="bg-gold absolute -bottom-28 right-[8%] h-[26rem] w-[32rem] rounded-full opacity-90 blur-[90px]" />
          <div className="bg-pink absolute -right-40 bottom-0 h-[24rem] w-[28rem] rounded-full opacity-80 blur-[90px]" />
          {/* Some suavemente no fim da primeira tela, para não fazer uma linha reta com a seção Sobre */}
          <div className="from-background absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent" />
        </div>

        <header className="mx-auto flex w-full max-w-6xl items-center justify-end gap-8 px-6 py-6">
          <nav className="hidden items-center gap-8 text-sm sm:flex">
            <a href="#inicio" className="border-foreground border-b-2 pb-1 font-medium">
              Início
            </a>
            <a
              href="#sobre"
              className="text-muted-foreground hover:text-foreground pb-1 transition"
            >
              Sobre
            </a>
            <a
              href="#funcionalidades"
              className="text-muted-foreground hover:text-foreground pb-1 transition"
            >
              Funcionalidades
            </a>
          </nav>
          <Link
            to="/entrar"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-7 py-2.5 text-sm font-medium transition"
          >
            Entrar
          </Link>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
          <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
            Planner de rotina e estudos
          </p>

          <h1 className="font-script mt-4 text-8xl leading-[0.9] [-webkit-text-stroke:1.5px_currentColor] sm:text-9xl md:text-[12rem]">
            Estudia
          </h1>

          <p className="font-display mt-2 text-3xl leading-tight font-semibold md:text-5xl">
            Seu semestre, no seu ritmo.
          </p>

          <p className="text-muted-foreground mt-4 max-w-md text-base md:text-lg">
            Organize seus estudos, suas tarefas e sua rotina em um só lugar.
          </p>

          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            <Link
              to="/cadastro"
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition"
            >
              Criar minha conta
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              to="/entrar"
              className="border-foreground/15 bg-background/60 hover:bg-background w-full rounded-full border px-6 py-3.5 text-sm font-medium backdrop-blur transition"
            >
              Entrar
            </Link>
          </div>

          <div className="mt-10 grid w-full gap-4 sm:grid-cols-3 md:gap-6">
            {DESTAQUES.map(({ icone: Icone, titulo, texto, cor }) => (
              <div
                key={titulo}
                className="bg-card/70 border-border/60 flex items-center gap-4 rounded-2xl border p-5 text-left shadow-sm backdrop-blur-md"
              >
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${cor}`}
                >
                  <Icone className="h-6 w-6" strokeWidth={2} />
                </span>
                <div>
                  <p className="font-semibold">{titulo}</p>
                  <p className="text-muted-foreground text-sm leading-snug">{texto}</p>
                </div>
              </div>
            ))}
          </div>
        </main>

        <p className="text-muted-foreground pb-6 text-center text-xs">
          Projeto Integrador II · 2026
        </p>
      </section>

      {/* ---------- Sobre ---------- */}
      <section id="sobre" className="mx-auto max-w-3xl scroll-mt-6 px-6 py-24 text-center">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">Sobre</p>
        <h2 className="font-display mt-4 text-4xl md:text-5xl">
          Feito para a vida de universitário
        </h2>
        <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
          O Estudia junta num lugar só o que o semestre pede — matérias, provas, trabalhos e prazos
          — e o que a rotina pede: treino, dieta, hobbies e dinheiro. Cada pessoa tem a sua conta e
          vê só os próprios dados.
        </p>
      </section>

      {/* ---------- Funcionalidades ---------- */}
      <section id="funcionalidades" className="mx-auto max-w-6xl scroll-mt-6 px-6 pb-24">
        <div className="text-center">
          <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
            Funcionalidades
          </p>
          <h2 className="font-display mt-4 text-4xl md:text-5xl">Tudo o que o semestre pede</h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {FUNCIONALIDADES.map(({ icone: Icone, titulo, texto }) => (
            <div key={titulo} className="glass-card p-6">
              <Icone className="text-magenta h-6 w-6" strokeWidth={1.75} />
              <p className="mt-4 font-semibold">{titulo}</p>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{texto}</p>
            </div>
          ))}
        </div>

        {/* Personalização: o PDF pede para deixar claro que o sistema é personalizável */}
        <div className="glass-card mt-6 flex flex-col items-center gap-6 p-8 text-center md:flex-row md:text-left">
          <div className="flex-1">
            <p className="font-display text-3xl">Do seu jeito</p>
            <p className="text-muted-foreground mt-2">
              Escolha entre {THEMES.length} temas de cores e entre o modo claro e o escuro. O
              Estudia lembra da sua escolha.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {THEMES.map((tema) => (
              <div key={tema.id} className="flex flex-col items-center gap-1.5">
                <span
                  className="h-10 w-10 rounded-full shadow-sm"
                  style={{ background: tema.color }}
                />
                <span className="text-muted-foreground text-[11px]">{tema.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            to="/cadastro"
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium transition"
          >
            Criar minha conta
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </section>
    </div>
  );
}
