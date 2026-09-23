import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { migrationService } from "@/services/migration.service";
import { AuthScreen } from "./AuthScreen";

function Splash({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-foreground">
      <div className="font-script text-5xl">Esther's</div>
      <div className="flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-magenta" /> {label}
      </div>
    </div>
  );
}

/**
 * Gate the whole app behind authentication. While the session resolves we show
 * a splash (no login flicker). On first sign-in we run the one-time
 * localStorage -> Supabase migration before revealing the app.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const migratedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (migratedFor.current === user.id) return;
    migratedFor.current = user.id;
    setMigrating(true);
    migrationService
      .run(user.id)
      .catch((e) => console.error("[migration] failed:", e))
      .finally(() => setMigrating(false));
  }, [user]);

  if (loading) return <Splash label="Carregando" />;
  if (!user) return <AuthScreen />;
  if (migrating) return <Splash label="Preparando seus dados" />;

  return <>{children}</>;
}
