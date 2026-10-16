import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, Lock, User, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

type Mode = "login" | "signup";

function friendlyError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);

  if (/rate|too many|seconds|over_request_rate_limit/i.test(msg)) {
    return "Muitas tentativas. Aguarde alguns segundos.";
  }

  if (/invalid login credentials|invalid credentials/i.test(msg)) {
    return "E-mail ou senha incorretos.";
  }

  if (/email not confirmed|email.*confirm/i.test(msg)) {
    return "Confirme seu e-mail antes de entrar.";
  }

  if (/user already registered/i.test(msg)) {
    return 'Este e-mail já tem conta. Entre ou use "Esqueci minha senha".';
  }

  if (/email/i.test(msg) && /valid/i.test(msg)) {
    return "E-mail inválido.";
  }

  if (/password/i.test(msg) && /6|short|characters/i.test(msg)) {
    return "A senha precisa de pelo menos 6 caracteres.";
  }

  return "Não foi possível concluir a operação. Tente novamente.";
}

/**
 * Tela única de acesso. `/entrar` abre no modo login e `/cadastro` no modo
 * cadastro; a troca entre os dois é por link, para o endereço acompanhar a tela.
 */
export function AuthScreen({ initialMode = "login" }: { initialMode?: Mode }) {
  const { signInWithPassword, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [forgotPassword, setForgotPassword] = useState(false);

  const isLogin = mode === "login";

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();

    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Digite seu e-mail.");
      return;
    }

    if (forgotPassword) {
      setBusy(true);

      try {
        await resetPassword(cleanEmail);

        setSuccess("Enviamos as instruções para redefinir sua senha. Confira seu e-mail.");
      } catch (err) {
        console.error("Erro ao redefinir senha:", err);
        setError(friendlyError(err));
      } finally {
        setBusy(false);
      }

      return;
    }

    if (!password) {
      setError("Digite sua senha.");
      return;
    }

    if (password.length < 6) {
      setError("A senha precisa de pelo menos 6 caracteres.");
      return;
    }

    if (!isLogin && !name.trim()) {
      setError("Digite seu nome.");
      return;
    }

    if (!isLogin && !confirmPassword) {
      setError("Confirme sua senha.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("As senhas não são iguais.");
      return;
    }

    setBusy(true);

    try {
      if (isLogin) {
        await signInWithPassword(cleanEmail, password);
      } else {
        const user = await signUp(cleanEmail, password, name.trim());

        if (user) {
          setSuccess("Conta criada com sucesso! Você já pode entrar no Estudia.");
        } else {
          setSuccess("Cadastro realizado! Verifique seu e-mail para confirmar sua conta.");
        }

        setMode("login");
        setPassword("");
        setConfirmPassword("");
        setName("");
      }
    } catch (err) {
      console.error("Erro de autenticação:", err);
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 text-foreground overflow-hidden">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-script text-6xl leading-none text-foreground">Estudia</div>

          <div className="font-display text-sm tracking-[0.4em] text-magenta uppercase mt-2">
            Planner · 2026
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl text-primary mb-1">
              {forgotPassword ? "Redefinir senha" : isLogin ? "Entrar" : "Criar conta"}
            </h1>

            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
              {forgotPassword
                ? "Receba um link para criar uma nova senha"
                : isLogin
                  ? "Acesse seu planner"
                  : "Comece seu planejamento"}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-darkred/40 bg-darkred/10 px-3 py-2 text-xs text-darkred"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-4 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary"
            >
              {success}
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            {!isLogin && !forgotPassword && (
              <div className="flex items-center gap-2 rounded-md bg-background/70 border border-input px-3 focus-within:border-primary transition">
                <User className="h-4 w-4 text-muted-foreground" />

                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                  disabled={busy}
                  className="w-full bg-transparent outline-none text-sm py-2.5 disabled:opacity-50"
                />
              </div>
            )}

            <div className="flex items-center gap-2 rounded-md bg-background/70 border border-input px-3 focus-within:border-primary transition">
              <Mail className="h-4 w-4 text-muted-foreground" />

              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                disabled={busy}
                className="w-full bg-transparent outline-none text-sm py-2.5 disabled:opacity-50"
              />
            </div>

            {!forgotPassword && (
              <div className="flex items-center gap-2 rounded-md bg-background/70 border border-input px-3 focus-within:border-primary transition">
                <Lock className="h-4 w-4 text-muted-foreground" />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Sua senha"
                  disabled={busy}
                  className="w-full bg-transparent outline-none text-sm py-2.5 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={busy}
                  className="text-muted-foreground hover:text-primary transition disabled:opacity-50"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            )}

            {!isLogin && !forgotPassword && (
              <div className="flex items-center gap-2 rounded-md bg-background/70 border border-input px-3 focus-within:border-primary transition">
                <Lock className="h-4 w-4 text-muted-foreground" />

                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirmar senha"
                  disabled={busy}
                  className="w-full bg-transparent outline-none text-sm py-2.5 disabled:opacity-50"
                />
              </div>
            )}

            {isLogin && !forgotPassword && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setForgotPassword(true);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-primary transition"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md border border-primary/40 text-primary px-4 py-2.5 text-sm hover:bg-primary hover:text-primary-foreground transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}

              {busy
                ? forgotPassword
                  ? "Enviando..."
                  : isLogin
                    ? "Entrando..."
                    : "Criando conta..."
                : forgotPassword
                  ? "Enviar link de recuperação"
                  : isLogin
                    ? "Entrar"
                    : "Criar minha conta"}
            </button>
          </form>

          {forgotPassword && (
            <button
              type="button"
              onClick={() => {
                setForgotPassword(false);
                setError(null);
                setSuccess(null);
              }}
              className="mt-4 w-full text-xs text-muted-foreground hover:text-primary transition flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Voltar para o login
            </button>
          )}

          {!forgotPassword && (
            <div className="mt-6 text-center text-xs text-muted-foreground">
              {isLogin ? (
                <>
                  Ainda não possui uma conta?{" "}
                  <Link to="/cadastro" className="text-primary hover:underline">
                    Criar conta
                  </Link>
                </>
              ) : (
                <>
                  Já possui uma conta?{" "}
                  <Link to="/entrar" className="text-primary hover:underline">
                    Entrar
                  </Link>
                </>
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
