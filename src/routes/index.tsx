import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estudia — Seu semestre, no seu ritmo." },
      {
        name: "description",
        content: "Organize seus estudos e sua rotina em um só lugar.",
      },
    ],
  }),
  component: Landing,
});

/**
 * Landing Page — a primeira tela de quem ainda não tem conta.
 *
 * É pública: `/` está em PUBLIC_PATHS (src/lib/public-routes.ts), então ela
 * abre sem login. O planner fica em `/inicio`, atrás da autenticação.
 *
 * O conteúdo é o definido no relatório de UX/UI: nome, uma frase, e dois
 * botões. Sem depoimentos, sem preços, sem explicação longa.
 */
function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Quem já está logado não precisa ver a apresentação do produto.
  useEffect(() => {
    if (!loading && user) navigate({ to: "/inicio", replace: true });
  }, [loading, user, navigate]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Fundo ambiente — usa as variáveis de tema, então acompanha o tema escolhido */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 50% at 15% 0%, var(--wine), transparent 60%)," +
            "radial-gradient(60% 45% at 95% 100%, var(--pink), transparent 60%)",
          opacity: 0.22,
        }}
      />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-muted-foreground mb-4 text-[10px] tracking-[0.4em] uppercase">
          Planner de rotina e estudos
        </p>

        <h1 className="font-script text-foreground text-6xl leading-none sm:text-7xl">Estudia</h1>

        <div className="from-magenta via-gold to-magenta mx-auto my-7 h-px w-32 bg-gradient-to-r opacity-70" />

        <p className="font-display text-foreground max-w-md text-2xl leading-snug sm:text-3xl">
          Seu semestre, no seu ritmo.
        </p>

        <p className="text-muted-foreground mt-4 max-w-sm text-base">
          Organize seus estudos e sua rotina em um só lugar.
        </p>

        <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
          <Link
            to="/cadastro"
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition"
          >
            Criar minha conta
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>

          <Link
            to="/entrar"
            className="border-border text-foreground hover:bg-accent w-full rounded-lg border px-5 py-3 text-sm font-medium transition"
          >
            Entrar
          </Link>
        </div>
      </main>

      <footer className="text-muted-foreground pb-8 text-center text-xs">
        Projeto Integrador II · 2026
      </footer>
    </div>
  );
}
