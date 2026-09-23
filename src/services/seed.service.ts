import { repo } from "@/repositories/base.repository";
import { SEED_QUOTES, SEED_STUDY, SEED_WORKOUTS, SEED_DIET, SEED_FINANCE } from "@/lib/seed-data";

/**
 * Semeia o conteúdo inicial do planner no primeiro login de cada usuário.
 * Idempotente: se já houver treinos, não faz nada. owner_id é preenchido pelo
 * banco (default auth.uid()), então basta enviar os campos de negócio.
 */
export const seedService = {
  async run(): Promise<void> {
    const existing = await repo("workouts").list();
    if (existing.length > 0) return;

    await repo("quotes").insertMany(
      SEED_QUOTES.map((text, i) => ({ text, position: i, is_active: true })),
    );

    await repo("finance_categories").insertMany(
      SEED_FINANCE.map((name, i) => ({ name, balance: 0, position: i })),
    );

    for (let ti = 0; ti < SEED_STUDY.length; ti++) {
      const t = SEED_STUDY[ti];
      const track = await repo("study_tracks").insert({
        name: t.name,
        subtitle: t.subtitle,
        position: ti,
      });
      await repo("study_topics").insertMany(
        t.topics.map((title, i) => ({ track_id: track.id, title, position: i })),
      );
    }

    for (let wi = 0; wi < SEED_WORKOUTS.length; wi++) {
      const w = SEED_WORKOUTS[wi];
      const workout = await repo("workouts").insert({
        name: w.name,
        focus: w.focus,
        weekday: w.weekday,
        position: wi,
      });
      await repo("workout_exercises").insertMany(
        w.exercises.map((e, i) => ({
          workout_id: workout.id,
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          position: i,
        })),
      );
    }

    for (let di = 0; di < SEED_DIET.length; di++) {
      const d = SEED_DIET[di];
      const day = await repo("diet_days").insert({
        name: d.name,
        weekday: d.weekday,
        position: di,
      });
      await repo("diet_meals").insertMany(
        d.meals.map((m, i) => ({
          day_id: day.id,
          kind: m.kind,
          description: m.description,
          calories: m.calories,
          position: i,
        })),
      );
    }
  },
};
