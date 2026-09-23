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
} from "lucide-react";
import tigerAsset from "@/assets/tiger.png.asset.json";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

const NAV = [
  { to: "/", label: "Início", icon: Home },
  { to: "/estudos", label: "Estudos", icon: BookOpen },
  { to: "/hobbies", label: "Hobbies", icon: Heart },
  { to: "/treino", label: "Treino", icon: Dumbbell },
  { to: "/mercado", label: "Mercado", icon: ShoppingCart },
  { to: "/dieta", label: "Dieta", icon: Apple },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/tarefas", label: "Tarefas", icon: CheckSquare },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();

  return (
    <div className="relative min-h-screen text-foreground overflow-hidden">
      {/* ambient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.08]"
        style={{
          backgroundImage: `url(${tigerAsset.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(0.6)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 40% at 15% 10%, oklch(0.34 0.10 15 / 0.18), transparent 60%), radial-gradient(50% 35% at 90% 85%, oklch(0.85 0.008 250 / 0.10), transparent 60%), linear-gradient(180deg, oklch(0.06 0.005 30), oklch(0.04 0.005 30))",
        }}
      />

      <div className="flex min-h-screen">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col gap-2 border-r border-magenta/25 bg-black/50 backdrop-blur-md p-6">
          <div className="mb-6">
            <div className="font-script text-4xl leading-none text-foreground">Estudia</div>
            <div className="font-display text-sm tracking-[0.4em] text-magenta uppercase mt-1">
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
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    active
                      ? "bg-gradient-to-r from-wine/50 via-magenta/20 to-transparent text-silver border-l-2 border-pink"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.25} />
                  <span className="font-display tracking-wider">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto pt-6">
            {user && (
              <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-magenta/20 bg-black/30 px-3 py-2">
                <span
                  className="truncate text-xs text-muted-foreground"
                  title={user.email ?? undefined}
                >
                  {user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  aria-label="Sair"
                  className="shrink-0 text-magenta/70 hover:text-magenta transition"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            )}
            <div className="gold-divider mb-4" />
            <p className="font-script text-2xl text-center text-foreground/80 leading-tight">
              All in God's Hands
            </p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 pb-24 md:pb-8">
          <header className="px-6 md:px-10 pt-8 md:pt-10">
            <div className="md:hidden mb-2 flex items-start justify-between">
              <div>
                <div className="font-script text-3xl">Estudia</div>
                <div className="text-[10px] tracking-[0.4em] text-magenta uppercase">
                  Planner · 2026
                </div>
              </div>
              {user && (
                <button
                  onClick={() => signOut()}
                  aria-label="Sair"
                  className="mt-1 text-magenta/70 hover:text-magenta transition"
                >
                  <LogOut className="h-5 w-5" strokeWidth={1.5} />
                </button>
              )}
            </div>
            <h1 className="font-script text-5xl md:text-6xl text-foreground">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground font-display tracking-wide">
                {subtitle}
              </p>
            )}
            <div className="gold-divider mt-6" />
          </header>
          <div className="px-6 md:px-10 mt-8">{children}</div>
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-magenta/30 bg-black/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex gap-1 overflow-x-auto px-3 py-2.5 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`shrink-0 flex flex-col items-center justify-center gap-1 min-w-[64px] py-1.5 px-2 rounded-lg text-[10px] tracking-[0.15em] transition ${
                  active
                    ? "text-silver bg-gradient-to-b from-wine/60 to-magenta/30 border border-pink/50"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.25} />
                <span className="uppercase">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
