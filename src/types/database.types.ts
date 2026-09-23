/**
 * Supabase database types — RELATIONAL schema.
 * Mirrors supabase/migrations/20260728120000_relational_schema.sql.
 * Regenerate from the live DB with: npm run gen:types
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type HobbyKind = "filme" | "serie" | "anime" | "livro";
export type MealKind =
  "cafe" | "lanche" | "pre_treino" | "almoco" | "lanche_tarde" | "janta" | "ceia";

type Stamps = { created_at: string; updated_at: string };

// Row shapes -----------------------------------------------------------------
type ProfileRow = { id: string; display_name: string; avatar_url: string | null } & Stamps;
type QuoteRow = {
  id: string;
  owner_id: string;
  text: string;
  author: string | null;
  is_active: boolean;
  position: number;
} & Stamps;
type StudyTrackRow = {
  id: string;
  owner_id: string;
  name: string;
  subtitle: string | null;
  position: number;
} & Stamps;
type StudyTopicRow = {
  id: string;
  owner_id: string;
  track_id: string;
  title: string;
  is_done: boolean;
  completed_at: string | null;
  notes: string | null;
  position: number;
} & Stamps;
type HobbyItemRow = {
  id: string;
  owner_id: string;
  kind: HobbyKind;
  title: string;
  author: string | null;
  is_done: boolean;
  completed_at: string | null;
  season: number | null;
  episode: number | null;
  rating: number | null;
  position: number;
} & Stamps;
type WorkoutRow = {
  id: string;
  owner_id: string;
  name: string;
  focus: string | null;
  weekday: number | null;
  position: number;
} & Stamps;
type WorkoutExerciseRow = {
  id: string;
  owner_id: string;
  workout_id: string;
  name: string;
  sets: number | null;
  reps: string | null;
  load_kg: number | null;
  is_done: boolean;
  notes: string | null;
  position: number;
} & Stamps;
type WorkoutSessionRow = {
  id: string;
  owner_id: string;
  workout_id: string;
  performed_on: string;
  done_count: number;
  total_count: number;
  created_at: string;
};
type ShoppingItemRow = {
  id: string;
  owner_id: string;
  name: string;
  quantity: number;
  unit: string | null;
  price: number | null;
  is_checked: boolean;
  position: number;
} & Stamps;
type DietDayRow = {
  id: string;
  owner_id: string;
  name: string;
  weekday: number | null;
  position: number;
} & Stamps;
type DietMealRow = {
  id: string;
  owner_id: string;
  day_id: string;
  kind: MealKind;
  description: string;
  calories: number | null;
  position: number;
} & Stamps;
type FinanceCategoryRow = {
  id: string;
  owner_id: string;
  name: string;
  balance: number;
  color: string | null;
  position: number;
} & Stamps;
type FinanceExpenseRow = {
  id: string;
  owner_id: string;
  category_id: string;
  description: string;
  amount: number;
  spent_on: string;
} & Stamps;
type TaskRow = {
  id: string;
  owner_id: string;
  title: string;
  is_done: boolean;
  completed_at: string | null;
  due_date: string;
  position: number;
} & Stamps;

// A table definition: Insert/Update are permissive partials (owner_id, id and
// timestamps are filled by DB defaults). The repository layer keeps calls typed.
type Table<R> = { Row: R; Insert: Partial<R>; Update: Partial<R>; Relationships: [] };

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      quotes: Table<QuoteRow>;
      study_tracks: Table<StudyTrackRow>;
      study_topics: Table<StudyTopicRow>;
      hobby_items: Table<HobbyItemRow>;
      workouts: Table<WorkoutRow>;
      workout_exercises: Table<WorkoutExerciseRow>;
      workout_sessions: Table<WorkoutSessionRow>;
      shopping_items: Table<ShoppingItemRow>;
      diet_days: Table<DietDayRow>;
      diet_meals: Table<DietMealRow>;
      finance_categories: Table<FinanceCategoryRow>;
      finance_expenses: Table<FinanceExpenseRow>;
      tasks: Table<TaskRow>;
    };
    Views: {
      v_study_progress: {
        Row: {
          track_id: string;
          owner_id: string;
          name: string;
          subtitle: string | null;
          position: number;
          total: number;
          done: number;
          percent: number | null;
        };
        Relationships: [];
      };
      v_finance_summary: {
        Row: {
          category_id: string;
          owner_id: string;
          name: string;
          saldo: number;
          gasto: number;
          disponivel: number;
          position: number;
        };
        Relationships: [];
      };
      v_diet_day_totals: {
        Row: {
          day_id: string;
          owner_id: string;
          name: string;
          position: number;
          total_calories: number;
          meal_count: number;
        };
        Relationships: [];
      };
      v_workout_progress: {
        Row: {
          workout_id: string;
          owner_id: string;
          name: string;
          focus: string | null;
          position: number;
          total: number;
          done: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: { hobby_kind: HobbyKind; meal_kind: MealKind };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
