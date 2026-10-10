import { FormEvent, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { authService } from "@/services/auth.service";

export function RegisterForm() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!fullName.trim()) {
      setError("Digite seu nome completo.");
      return;
    }

    if (!email.trim()) {
      setError("Digite seu e-mail.");
      return;
    }

    if (!password) {
      setError("Digite uma senha.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

      await authService.signUp(email.trim(), password, fullName.trim());

      /*
       * O banco já possui o trigger handle_new_user.
       *
       * Portanto:
       *
       * fullName
       *    ↓
       * authService.signUp(...)
       *    ↓
       * Supabase Auth
       *    ↓
       * handle_new_user
       *    ↓
       * profiles.display_name
       */

      navigate({
        to: "/entrar",
      });
    } catch (err) {
      console.error(err);

      setError(getRegisterErrorMessage(err, "Não foi possível criar sua conta."));
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
            Comece a organizar seus estudos hoje.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex w-full items-center justify-center bg-background px-6 py-12 lg:w-[520px]">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-medium text-primary">ESTUDIA</p>

            <h2 className="mt-2 text-3xl font-semibold text-foreground">Criar conta</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Crie sua conta para começar a organizar seu semestre.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-foreground">
                Nome completo
              </label>

              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Caio Silva"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                disabled={loading}
                className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

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
                autoComplete="new-password"
                placeholder="Mínimo de 6 caracteres"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Confirmar senha
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Já possui uma conta?{" "}
            <Link to="/entrar" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function getRegisterErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    const message = error.message.toLowerCase();

    if (message.includes("user already registered")) {
      return "Este e-mail já está cadastrado.";
    }

    if (message.includes("password")) {
      return "A senha informada não atende aos requisitos.";
    }

    if (message.includes("email")) {
      return "Digite um e-mail válido.";
    }

    return error.message;
  }

  return fallback;
}
