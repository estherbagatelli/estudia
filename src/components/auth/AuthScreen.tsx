import { useState } from "react";
import { Mail, Loader2, MailCheck, ArrowLeft, Download, Share } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/rate|too many|seconds/i.test(msg))
    return "Aguarde alguns segundos antes de pedir outro link.";
  if (/email/i.test(msg) && /valid/i.test(msg)) return "E-mail inválido.";
  return msg;
}

export function AuthScreen() {
  const { sendMagicLink } = useAuth();
  const { canPrompt, installed, isIOS, promptInstall } = useInstallPrompt();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  const install = async () => {
    if (canPrompt) {
      const res = await promptInstall();
      if (res === "unavailable") setShowInstallHelp(true);
      return;
    }
    // iOS Safari (and other cases without a native prompt): show instructions.
    setShowInstallHelp(true);
  };

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setBusy(true);
    try {
      await sendMagicLink(email.trim());
      setSent(true);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 text-foreground overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 40% at 15% 10%, oklch(0.34 0.10 15 / 0.18), transparent 60%), radial-gradient(50% 35% at 90% 85%, oklch(0.85 0.008 250 / 0.10), transparent 60%), linear-gradient(180deg, oklch(0.06 0.005 30), oklch(0.04 0.005 30))",
        }}
      />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-script text-6xl leading-none text-foreground">Estudia</div>
          <div className="font-display text-sm tracking-[0.4em] text-magenta uppercase mt-2">
            Planner · 2026
          </div>
        </div>

        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center">
              <MailCheck className="h-10 w-10 text-gold mx-auto mb-4" strokeWidth={1.25} />
              <h1 className="font-display text-2xl text-gold mb-2">Confira seu e-mail</h1>
              <p className="text-sm text-muted-foreground">
                Enviamos um link de acesso para{" "}
                <span className="text-foreground">{email.trim()}</span>. Abra o e-mail e clique em{" "}
                <span className="text-gold">Entrar</span> para acessar o planner.
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Não recebeu? Veja o spam ou peça outro link.
              </p>
              <div className="mt-6 flex flex-col gap-2 text-center text-xs text-muted-foreground">
                <button
                  onClick={() => send()}
                  disabled={busy}
                  className="hover:text-gold transition disabled:opacity-50"
                >
                  {busy ? "Reenviando…" : "Reenviar link"}
                </button>
                <button
                  onClick={() => {
                    setSent(false);
                    setError(null);
                  }}
                  className="hover:text-gold transition flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Usar outro e-mail
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl text-gold mb-1">Entrar</h1>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">
                Digite seu e-mail e enviamos um link de acesso
              </p>
              <form onSubmit={send} className="space-y-3">
                <div className="flex items-center gap-2 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 focus-within:border-gold transition">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
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
                  Enviar link de acesso
                </button>
              </form>
            </>
          )}

          {!installed && (
            <div className="mt-6 pt-5 border-t border-white/10">
              <button
                type="button"
                onClick={install}
                className="w-full flex items-center justify-center gap-2 rounded-md border border-magenta/40 text-silver px-4 py-2.5 text-sm hover:bg-magenta/15 transition"
              >
                <Download className="h-4 w-4" /> Instalar aplicativo
              </button>
              {showInstallHelp && (
                <p className="mt-3 text-xs text-muted-foreground text-center leading-relaxed">
                  {isIOS ? (
                    <>
                      No iPhone: toque em{" "}
                      <Share className="inline h-3.5 w-3.5 mx-0.5 align-text-bottom" />
                      <span className="text-foreground">Compartilhar</span> e depois em{" "}
                      <span className="text-foreground">"Adicionar à Tela de Início"</span>.
                    </>
                  ) : (
                    <>
                      Abra o menu do navegador e escolha{" "}
                      <span className="text-foreground">"Instalar app"</span> ou{" "}
                      <span className="text-foreground">"Adicionar à tela inicial"</span>.
                    </>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        <p className="font-script text-2xl text-center text-foreground/70 mt-8">
          All in God's Hands
        </p>
      </div>
    </div>
  );
}
