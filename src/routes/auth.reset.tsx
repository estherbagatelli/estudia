import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/auth/reset")({
  head: () => ({ meta: [{ title: "Nova senha — Esther's Planner" }] }),
  component: ResetPage,
});

/**
 * Reached from the password-recovery e-mail link. Supabase establishes a
 * temporary recovery session (so RequireAuth lets this render), and here the
 * user sets a new password.
 */
function ResetPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await updatePassword(password);
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar a senha.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-foreground">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-script text-5xl">Esther's</div>
          <div className="font-display text-sm tracking-[0.4em] text-magenta uppercase mt-2">
            Planner · 2026
          </div>
        </div>
        <div className="glass-card p-8">
          <h1 className="font-display text-2xl text-gold mb-1">Definir nova senha</h1>
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">
            Escolha uma senha segura
          </p>
          <form onSubmit={submit} className="space-y-3">
            <div className="flex items-center gap-2 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 focus-within:border-gold transition">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nova senha"
                className="w-full bg-transparent outline-none text-sm py-2.5"
              />
            </div>
            {error && <p className="text-xs text-darkred">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md border border-gold/40 text-gold px-4 py-2.5 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar senha
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
