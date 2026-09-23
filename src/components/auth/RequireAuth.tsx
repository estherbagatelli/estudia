import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthScreen } from "./AuthScreen";

function Splash({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-foreground">
      <div className="font-script text-5xl">Estudia</div>
      <div className="flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-magenta" /> {label}
      </div>
    </div>
  );
}

/**
 * Protege o app inteiro atrás da autenticação. Enquanto a sessão é resolvida
 * mostramos um splash (para não piscar a tela de login).
 *
 * Uma conta nova começa VAZIA de propósito: os estados vazios da Fase 2
 * ("Você ainda não adicionou nenhuma matéria.") dependem disso. Para popular
 * uma conta com dados de exemplo, chame `seedService.run()` explicitamente.
 * Ver docs/DECISOES.md (decisão 4).
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <Splash label="Carregando" />;
  if (!user) return <AuthScreen />;

  return <>{children}</>;
}
