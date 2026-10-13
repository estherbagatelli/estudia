import type { ReactNode } from "react";

import { Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-foreground">
      <div className="font-script text-5xl">Estudia</div>

      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-magenta" />
        Carregando
      </div>
    </div>
  );
}

/**
 * Protege as telas do planner. Enquanto a sessão é resolvida mostramos um
 * splash (para não piscar a tela de login); sem conta, manda para `/entrar`.
 *
 * Uma conta nova começa VAZIA de propósito: os estados vazios da Fase 2
 * ("Você ainda não adicionou nenhuma matéria.") dependem disso. Para popular
 * uma conta com dados de exemplo, chame `seedService.run()` explicitamente.
 * Ver docs/DECISOES.md (decisão 4).
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Splash />;
  }

  if (!user) {
    return <Navigate to="/entrar" />;
  }

  return <>{children}</>;
}

/**
 * O inverso: telas de login e cadastro. Quem já está logado vai direto para o
 * planner — inclusive logo depois de entrar ou criar a conta.
 */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Splash />;
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
