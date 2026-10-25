import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  BookOpen,
  Heart,
  Dumbbell,
  ShoppingCart,
  Apple,
  Wallet,
  CheckSquare,
  LogOut,
  Palette,
  Menu,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import tigerAsset from "@/assets/tiger.png.asset.json";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { avisar } from "@/lib/feedback";
import { THEMES, type Theme } from "@/lib/temas";

const NAV = [
  { to: "/inicio", label: "Início", icon: Home },
  { to: "/estudos", label: "Estudos", icon: BookOpen },
  { to: "/hobbies", label: "Hobbies", icon: Heart },
  { to: "/treino", label: "Treino", icon: Dumbbell },
  { to: "/mercado", label: "Mercado", icon: ShoppingCart },
  { to: "/dieta", label: "Dieta", icon: Apple },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/tarefas", label: "Tarefas", icon: CheckSquare },
] as const;

type Appearance = "claro" | "escuro";

function getSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem("color-theme");
    if (THEMES.some((theme) => theme.id === saved)) {
      return saved as Theme;
    }
  } catch {
    // Usa o tema padrão se o armazenamento estiver indisponível.
  }
  return "estudia";
}

function getSavedAppearance(): Appearance {
  try {
    return localStorage.getItem("appearance") === "escuro" ? "escuro" : "claro";
  } catch {
    return "claro";
  }
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const { user, signOut } = useAuth();

  const [theme, setTheme] = useState<Theme>(getSavedTheme);
  const [appearance, setAppearance] = useState<Appearance>(getSavedAppearance);
  const [showAppearance, setShowAppearance] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.colorTheme = theme;
    document.documentElement.dataset.appearance = appearance;

    try {
      localStorage.setItem("color-theme", theme);
      localStorage.setItem("appearance", appearance);
    } catch {
      // A aparência continua funcionando nesta sessão.
    }
  }, [theme, appearance]);

  function toggleAppearance() {
    setAppearance((current) => (current === "claro" ? "escuro" : "claro"));
    avisar.temaAtualizado();
  }

  function escolherTema(novo: Theme) {
    if (novo === theme) return;
    setTheme(novo);
    avisar.temaAtualizado();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Fundo decorativo com o tigre */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage: `url(${tigerAsset.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(0.7)",
        }}
      />

      {/* Degradês coloridos */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(
              ellipse at 10% 10%,
              var(--glow-start, transparent),
              transparent 55%
            ),
            radial-gradient(
              ellipse at 90% 80%,
              var(--glow-middle, transparent),
              transparent 55%
            ),
            radial-gradient(
              ellipse at 50% 100%,
              var(--glow-end, transparent),
              transparent 60%
            )
          `,
        }}
      />

      <div className="flex min-h-screen">
        {/* Menu lateral para computador */}
        <aside className="hidden w-64 shrink-0 flex-col gap-2 border-r border-border bg-card/80 p-6 backdrop-blur-md md:flex">
          <div className="mb-6">
            <div className="font-script text-4xl leading-none text-foreground">Estudia</div>
            <div className="mt-1 font-display text-sm uppercase tracking-[0.4em] text-primary">
              Planner · 2026
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm transition-all ${
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  <span className="font-display tracking-wider">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6">
            {user && (
              <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-border bg-card/70 px-3 py-2">
                <span
                  className="truncate text-xs text-muted-foreground"
                  title={user.email ?? undefined}
                >
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  aria-label="Sair"
                  className="shrink-0 text-primary transition hover:opacity-70"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            )}

            <div className="mb-4 h-px bg-border" />
            <p className="text-center font-script text-2xl leading-tight text-foreground/80">
              All in God's Hands
            </p>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="min-w-0 flex-1 pb-24 md:pb-8">
          <header className="px-6 pt-8 md:px-10 md:pt-10">
            {/* Cabeçalho para celular */}
            <div className="mb-2 flex items-start justify-between md:hidden">
              <div className="flex items-start gap-3">
                {/* Menu compacto — as 8 categorias, sem precisar arrastar de lado */}
                <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Abrir menu"
                      className="mt-1 rounded-lg border border-border p-2 text-foreground transition hover:bg-accent"
                    >
                      <Menu className="h-5 w-5" strokeWidth={1.75} />
                    </button>
                  </SheetTrigger>

                  <SheetContent side="left" className="w-72 bg-card p-0">
                    <SheetHeader className="border-b border-border px-5 py-4 text-left">
                      <SheetTitle className="font-script text-3xl font-normal text-foreground">
                        Estudia
                      </SheetTitle>
                      <SheetDescription className="text-[10px] uppercase tracking-[0.4em] text-primary">
                        Planner · 2026
                      </SheetDescription>
                    </SheetHeader>

                    <nav className="flex flex-col gap-1 p-3">
                      {NAV.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.to;

                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setMenuAberto(false)}
                            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                              active
                                ? "bg-primary/10 font-medium text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                          >
                            <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </SheetContent>
                </Sheet>

                <div>
                  <div className="font-script text-3xl text-foreground">Estudia</div>
                  <div className="text-[10px] uppercase tracking-[0.4em] text-primary">
                    Planner · 2026
                  </div>
                </div>
              </div>

              {user && (
                <button
                  type="button"
                  onClick={() => signOut()}
                  aria-label="Sair"
                  className="mt-1 text-primary transition hover:opacity-70"
                >
                  <LogOut className="h-5 w-5" strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Título e botão de aparência */}
            <div className="flex items-center justify-between gap-3">
              <h1 className="min-w-0 font-script text-5xl text-foreground md:text-6xl">{title}</h1>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAppearance((current) => !current)}
                  aria-label="Personalizar aparência"
                  aria-expanded={showAppearance}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-sm transition hover:bg-muted"
                >
                  <Palette className="h-5 w-5" />
                </button>

                {showAppearance && (
                  <div className="absolute right-0 top-14 z-[60] w-64 rounded-2xl border border-border bg-card p-4 text-foreground shadow-xl">
                    <div className="mb-3">
                      <h2 className="font-display text-lg font-semibold">Aparência</h2>
                      <p className="text-sm text-muted-foreground">Personalize seu planner.</p>
                    </div>

                    {/* Escolher cor */}
                    <p className="mb-3 text-sm font-medium">Cor do tema</p>

                    <div className="grid grid-cols-3 gap-2">
                      {THEMES.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          title={item.label}
                          aria-label={`Tema ${item.label}`}
                          aria-pressed={theme === item.id}
                          onClick={() => escolherTema(item.id)}
                          className="flex flex-col items-center gap-1.5"
                        >
                          <span
                            className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition"
                            style={{
                              background: item.color,
                              borderColor: theme === item.id ? "var(--foreground)" : "transparent",
                            }}
                          >
                            {theme === item.id && <Check className="h-4 w-4 text-white" />}
                          </span>
                          <span className="text-[10px]">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="my-4 h-px bg-border" />

                    {/* Alternar modo claro e escuro */}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">Modo de exibição</p>
                        <p className="text-xs text-muted-foreground">
                          {appearance === "claro" ? "Modo claro" : "Modo escuro"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={toggleAppearance}
                        aria-label="Alternar modo claro e escuro"
                        aria-pressed={appearance === "escuro"}
                        className="flex h-10 w-14 shrink-0 items-center rounded-full bg-muted p-1 transition"
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow transition-transform ${
                            appearance === "escuro" ? "translate-x-4" : "translate-x-0"
                          }`}
                        >
                          {appearance === "escuro" ? (
                            <Moon className="h-4 w-4" />
                          ) : (
                            <Sun className="h-4 w-4" />
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {subtitle && (
              <p className="mt-2 font-display text-sm tracking-wide text-muted-foreground">
                {subtitle}
              </p>
            )}

            <div className="mt-6 h-px bg-border" />
          </header>

          <div className="mt-8 px-6 md:px-10">{children}</div>
        </main>
      </div>

      {/* A navegação do celular agora é o menu compacto do cabeçalho (botão ☰). */}
    </div>
  );
}
