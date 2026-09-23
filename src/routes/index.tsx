import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Dumbbell, Apple, CheckSquare, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useCloudState } from "@/hooks/useCloudState";
import { useTasks } from "@/hooks/useTasks";
import { INITIAL as TREINO_INITIAL, type Day as TreinoDay } from "@/routes/treino";
import { WEEK as DIETA_WEEK } from "@/routes/dieta";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Esther's Planner — 2026" },
      { name: "description", content: "Painel pessoal com frases motivacionais." },
    ],
  }),
  component: Index,
});

const QUOTES = [
  "All in God's Hands",
  "Tudo posso naquele que me fortalece",
  "Você é capaz de tudo que quiser",
  "Deus é a esperança em meio a tempestade",
];

const WEEKDAY_TO_TREINO: Record<number, number> = {
  1: 0, // seg
  2: 1, // ter
  3: 2, // qua
  4: 3, // qui
  5: 4, // sex
};
const DIETA_DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function Index() {
  const [i, setI] = useState(0);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setI((v) => (v + 1) % QUOTES.length), 6000);
    return () => clearInterval(id);
  }, []);
  const today = now ? now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }) : "";
  const isBirthday = !!now && now.getMonth() === 6 && now.getDate() === 3;

  const [treino] = useCloudState<TreinoDay[]>("treino.v1", TREINO_INITIAL);
  const { tasks } = useTasks();

  const treinoIdx = now ? WEEKDAY_TO_TREINO[now.getDay()] : undefined;
  const treinoHoje = treinoIdx !== undefined ? treino[treinoIdx] : null;
  const dietaHoje = now ? (DIETA_WEEK.find((d) => d.day === DIETA_DAYS[now.getDay()]) ?? null) : null;
  const pendentes = tasks.filter((t) => !t.done);
  const doneCount = tasks.length - pendentes.length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <AppShell title="Bem-vinda, Esther" subtitle={today.charAt(0).toUpperCase() + today.slice(1)}>
      <div className="space-y-6">
        {/* HERO CARD */}
        <div className="glass-card relative overflow-hidden p-6 md:p-10">
          <div
            aria-hidden
            className="absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--magenta), transparent 70%)" }}
          />
          <div
            aria-hidden
            className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--wine), transparent 70%)" }}
          />
          <div className="relative">
            {isBirthday ? (
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-magenta/60 bg-magenta/15 px-3 py-1 text-[10px] tracking-[0.3em] uppercase text-silver">
                  <Sparkles className="h-3 w-3" strokeWidth={1.5} /> Hoje
                </span>
                <h2 className="font-script text-5xl md:text-7xl text-foreground leading-none">
                  Feliz aniversário!
                </h2>
                <p className="font-display text-lg md:text-xl text-silver/90">
                  Seu dia vai ser perfeito.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-magenta/60 bg-magenta/15 px-3 py-1 text-[10px] tracking-[0.3em] uppercase text-silver">
                  <Sparkles className="h-3 w-3" strokeWidth={1.5} /> Frase do dia
                </span>
                <p
                  key={i}
                  className="font-script text-4xl md:text-6xl leading-tight text-foreground animate-in fade-in duration-700 max-w-2xl"
                >
                  {QUOTES[i]}
                </p>
                <div className="flex gap-2 pt-1">
                  {QUOTES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setI(idx)}
                      className={`h-1 rounded-full transition-all ${idx === i ? "w-8 bg-magenta" : "w-2 bg-silver/20"}`}
                      aria-label={`Frase ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* progress strip */}
            <div className="mt-8 pt-6 border-t border-magenta/20">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[11px] tracking-[0.3em] uppercase text-silver/70">Tarefas do dia</span>
                <span className="font-display text-lg text-pink">{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-black/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, var(--wine), var(--magenta), var(--pink))",
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] tracking-widest uppercase text-silver/50 mt-2">
                <span>{doneCount} concluídas</span>
                <span className="text-silver/80">{pendentes.length} pendentes</span>
                <span>{tasks.length} total</span>
              </div>
            </div>
          </div>
        </div>

        {/* STAT GRID — 2x2 mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            to="/treino"
            icon={<Dumbbell className="h-4 w-4" strokeWidth={1.5} />}
            label="Treino"
            value={treinoHoje ? treinoHoje.focus : "Descanso"}
            hint={treinoHoje ? `${treinoHoje.exercises.length} exercícios` : "Respire"}
          />
          <StatTile
            to="/dieta"
            icon={<Apple className="h-4 w-4" strokeWidth={1.5} />}
            label="Dieta"
            value={dietaHoje ? `${dietaHoje.meals.length}` : "—"}
            hint={dietaHoje ? "refeições" : "sem cardápio"}
          />
          <StatTile
            to="/tarefas"
            icon={<CheckSquare className="h-4 w-4" strokeWidth={1.5} />}
            label="Pendentes"
            value={String(pendentes.length)}
            hint={pendentes.length === 0 ? "tudo em ordem" : "a fazer"}
          />
          {now && (
            <div className="glass-card p-4 relative overflow-hidden">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-magenta mb-2">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} /> Hoje
              </div>
              <div className="font-display text-3xl text-foreground leading-none">
                {now.getDate()}
              </div>
              <div className="text-xs text-silver/70 mt-1 capitalize">
                {now.toLocaleDateString("pt-BR", { month: "long" })}
              </div>
            </div>
          )}
        </div>

        {/* DETAILS — list cards + calendar */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Link to="/treino" className="glass-card p-6 hover:border-magenta/60 transition group">
            <div className="flex items-center gap-2 text-[11px] tracking-[0.3em] text-magenta uppercase mb-3">
              <Dumbbell className="h-3.5 w-3.5" strokeWidth={1.5} /> Treino de hoje
            </div>
            {treinoHoje ? (
              <>
                <div className="font-display text-2xl text-foreground">{treinoHoje.focus}</div>
                <p className="text-[10px] text-silver/70 mt-1 mb-3 tracking-widest uppercase">
                  {treinoHoje.title} · {treinoHoje.exercises.length} exercícios
                </p>
                <ul className="space-y-1 text-sm text-foreground/85">
                  {treinoHoje.exercises.slice(0, 4).map((e) => (
                    <li key={e.id} className="flex gap-2">
                      <span className="text-pink text-xs font-mono w-12 shrink-0">
                        {e.sets}×{e.reps.split(" ")[0]}
                      </span>
                      <span className="truncate">{e.name}</span>
                    </li>
                  ))}
                  {treinoHoje.exercises.length > 4 && (
                    <li className="text-xs text-magenta/80 italic pt-1">
                      + {treinoHoje.exercises.length - 4} a fazer
                    </li>
                  )}
                </ul>
              </>
            ) : (
              <p className="font-script text-3xl text-silver/80">Descanso · respire</p>
            )}
          </Link>

          <Link to="/dieta" className="glass-card p-6 hover:border-magenta/60 transition">
            <div className="flex items-center gap-2 text-[11px] tracking-[0.3em] text-magenta uppercase mb-3">
              <Apple className="h-3.5 w-3.5" strokeWidth={1.5} /> Dieta de hoje
            </div>
            {dietaHoje ? (
              <ul className="space-y-2 text-sm">
                {dietaHoje.meals.slice(0, 5).map((m, idx) => (
                  <li key={idx}>
                    <div className="text-[10px] tracking-[0.2em] uppercase text-pink">{m.label}</div>
                    <div className="text-foreground/90 truncate">{m.text}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-silver/60">Sem cardápio.</p>
            )}
          </Link>

          {now && <MiniCalendar now={now} />}
        </div>
      </div>
    </AppShell>
  );
}

function StatTile({
  to,
  icon,
  label,
  value,
  hint,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="glass-card p-4 hover:border-magenta/60 transition relative overflow-hidden block"
    >
      <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-magenta mb-2">
        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-wine/40 border border-magenta/40 text-silver">
          {icon}
        </span>
        {label}
      </div>
      <div className="font-display text-2xl text-foreground truncate">{value}</div>
      <div className="text-[11px] text-silver/60 mt-0.5">{hint}</div>
    </Link>
  );
}

function MiniCalendar({ now }: { now: Date }) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();
  const monthName = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const grid = useMemo(() => {
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const isBirthdayMonth = month === 6;

  return (
    <div className="glass-card p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div className="font-display text-lg text-silver capitalize">{monthName}</div>
        <div className="font-script text-xl text-magenta">2026</div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] tracking-widest uppercase text-silver/50 mb-1">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {grid.map((d, i) => {
          if (d === null) return <div key={i} />;
          const isToday = d === todayDate;
          const isBday = isBirthdayMonth && d === 3;
          return (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center rounded-md transition ${
                isToday
                  ? "text-silver font-display border border-magenta bg-wine/30"
                  : isBday
                  ? "bg-magenta/30 text-silver border border-pink/70 font-display"
                  : "text-foreground/70 hover:bg-white/5"
              }`}
              title={isBday ? "Feliz aniversário!" : undefined}
            >
              {d}
            </div>
          );
        })}
      </div>
      <div className="gold-divider my-4" />
      <p className="font-script text-xl text-center text-silver/80">All in God's Hands</p>
    </div>
  );
}
