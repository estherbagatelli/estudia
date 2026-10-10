import { FormEvent, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { authService } from "@/services/auth.service";

export function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Digite seu e-mail.");
      return;
    }

    if (!password) {
      setError("Digite sua senha.");
      return;
    }

    try {
      setLoading(true);

      await authService.signInWithPassword(email.trim(), password);

      setSuccess("Login realizado com sucesso!");

      navigate({
        to: "/",
      });
    } catch (err) {
      console.error(err);

      setError(getAuthErrorMessage(err, "Não foi possível entrar."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Lado visual */}
      <div className="hidden flex-1 items-center justify-center bg-primary p-12 lg:flex">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-6xl text-primary-foreground">Estudia</h1>

          <p className="mt-6 text-2xl text-primary-foreground">
            Seu semestre,
            <br />
            no seu ritmo.
          </p>

          <p className="mt-4 text-sm text-primary-foreground/70">
            Organize seus estudos e sua rotina em um só lugar.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex w-full items-center justify-center bg-background px-6 py-12 lg:w-[520px]">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-medium text-primary">ESTUDIA</p>

            <h2 className="mt-2 text-3xl font-semibold text-foreground">Bem-vindo de volta</h2>

            <p className="mt-2 text-sm text-muted-foreground">Entre na sua conta para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                E-mail
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                Senha
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Sua senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-md border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-700"
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />

            <span className="text-xs text-muted-foreground">ou</span>

            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Mantém espaço para o login mágico existente */}
          <button
            type="button"
            className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            onClick={() => {
              setError("O login por link mágico continua disponível no AuthScreen existente.");
            }}
          >
            Entrar por link mágico
          </button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Ainda não possui uma conta?{" "}
            <Link to="/cadastro" className="font-medium text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    const message = error.message.toLowerCase();

    if (message.includes("invalid login credentials")) {
      return "E-mail ou senha inválidos.";
    }

    if (message.includes("email not confirmed")) {
      return "Seu e-mail ainda não foi confirmado.";
    }

    if (message.includes("too many requests")) {
      return "Muitas tentativas. Aguarde um pouco e tente novamente.";
    }

    return error.message;
  }

  return fallback;
}
