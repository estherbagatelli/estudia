import { useState } from "react";
import { Mail, Loader2, MailCheck, ArrowLeft, Download, Share } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);

  if (/rate|too many|seconds/i.test(msg)) {
    return "Aguarde alguns segundos antes de pedir outro link.";
  }

  if (/email/i.test(msg) && /valid/i.test(msg)) {
    return "E-mail inválido.";
  }

  return msg;
}

export default function AuthScreen() {
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

      if (res === "unavailable") {
        setShowInstallHelp(true);
      }

      return;
    }

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
    <div
      className="font-sans relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{
        backgroundColor: "#fffafd",
        backgroundImage: `
          radial-gradient(
            ellipse at 0% 0%,
            rgba(255, 182, 213, 0.55),
            transparent 55%
          ),
          radial-gradient(
            ellipse at 100% 15%,
            rgba(159, 240, 224, 0.55),
            transparent 50%
          ),
          radial-gradient(
            ellipse at 50% 100%,
            rgba(210, 180, 255, 0.50),
            transparent 55%
          )
        `,
        color: "#000000",
      }}
    >
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1
            className="font-script text-6xl leading-none tracking-tight"
            style={{ color: "#000000" }}
          >
            Estudia
          </h1>

          <p
            className="font-display mt-3 text-sm uppercase tracking-[0.4em]"
            style={{ color: "#a83278" }}
          >
            Planner · 2026
          </p>
        </div>

        {/* Cartão principal */}
        <div
          className="rounded-3xl border border-white/80 bg-white/75 p-8 shadow-2xl backdrop-blur-xl"
          style={{
            color: "#000000",
            boxShadow:
              "0 12px 45px rgba(220, 120, 180, 0.18), 0 8px 30px rgba(100, 210, 195, 0.15), 0 4px 25px rgba(170, 130, 240, 0.12)",
          }}
        >
          {sent ? (
            /* Confirmação de envio */
            <div className="text-center">
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #ffe0ef, #d9fff6, #eee0ff)",
                }}
              >
                <MailCheck size={30} color="#a83278" />
              </div>

              <h2 className="font-display mb-3 text-2xl font-bold" style={{ color: "#a83278" }}>
                Confira seu e-mail!
              </h2>

              <p className="mb-2 text-sm" style={{ color: "#333333" }}>
                Enviamos um link de acesso para:
              </p>

              <p className="mb-5 break-all font-semibold" style={{ color: "#a83278" }}>
                {email}
              </p>

              <p className="mb-6 text-sm" style={{ color: "#444444" }}>
                Abra o link recebido no seu e-mail para entrar na sua conta. Se não encontrar a
                mensagem, confira também a caixa de spam.
              </p>

              {error && (
                <p
                  role="alert"
                  className="mb-4 rounded-lg bg-red-50 p-3 text-sm"
                  style={{ color: "#b91c1c" }}
                >
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={() => send()}
                disabled={busy}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: "linear-gradient(110deg, #ffd6e9, #c9f8ed, #e3d5ff)",
                  color: "#000000",
                }}
              >
                {busy ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    Reenviar link
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setError(null);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-200 bg-white px-4 py-3 font-semibold transition hover:bg-pink-50"
                style={{ color: "#000000" }}
              >
                <ArrowLeft size={18} />
                Usar outro e-mail
              </button>
            </div>
          ) : (
            /* Formulário de login */
            <>
              <div className="mb-7 text-center">
                <h2 className="font-display mb-2 text-2xl font-bold" style={{ color: "#a83278" }}>
                  Bem-vindo ao Estudia!
                </h2>

                <p className="text-sm" style={{ color: "#444444" }}>
                  Entre com seu e-mail para acessar seu planner.
                </p>
              </div>

              <form onSubmit={send} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold"
                    style={{ color: "#000000" }}
                  >
                    Seu e-mail
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      color="#b94c91"
                    />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="voce@exemplo.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-pink-200 bg-white/90 py-3.5 pl-12 pr-4 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                      style={{ color: "#000000" }}
                    />
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 p-3 text-sm"
                    style={{ color: "#b91c1c" }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-semibold transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: "linear-gradient(110deg, #ffd6e9, #c9f8ed, #e3d5ff)",
                    color: "#000000",
                    boxShadow: "0 5px 18px rgba(200, 130, 190, 0.20)",
                  }}
                >
                  {busy ? (
                    <>
                      <Loader2 size={19} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail size={19} />
                      Receber link de acesso
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Instalação do aplicativo */}
          {!installed && (
            <div className="mt-6 border-t border-pink-100 pt-5">
              <button
                type="button"
                onClick={install}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white/70 px-4 py-3 text-sm font-semibold transition hover:bg-purple-50"
                style={{ color: "#000000" }}
              >
                {isIOS ? <Share size={17} /> : <Download size={17} />}
                Instalar aplicativo
              </button>

              {showInstallHelp && (
                <div
                  className="mt-4 rounded-xl p-4 text-sm"
                  style={{
                    background: "linear-gradient(135deg, #fff0f7, #edfffa, #f4efff)",
                    color: "#222222",
                  }}
                >
                  <p className="font-display mb-2 font-semibold">Como instalar o Estudia</p>

                  {isIOS ? (
                    <p>
                      No Safari, toque em Compartilhar e depois em "Adicionar à Tela de Início".
                    </p>
                  ) : (
                    <p>
                      Abra o menu do navegador e procure a opção "Instalar aplicativo" ou "Adicionar
                      à tela inicial".
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Texto inferior */}
        <p className="font-script mt-6 text-center text-2xl" style={{ color: "#a83278" }}>
          All in God's Hands
        </p>
      </div>
    </div>
  );
}
