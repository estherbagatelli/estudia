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
