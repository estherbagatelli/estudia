import type { Tables } from "./database.types";

export type Profile = Tables<"profiles">;
export type Quote = Tables<"quotes">;
export type StudyTrack = Tables<"study_tracks">;
export type StudyTopic = Tables<"study_topics">;
export type HobbyItem = Tables<"hobby_items">;
export type Workout = Tables<"workouts">;
export type WorkoutExercise = Tables<"workout_exercises">;
export type WorkoutSession = Tables<"workout_sessions">;
export type ShoppingItem = Tables<"shopping_items">;
export type DietDay = Tables<"diet_days">;
export type DietMeal = Tables<"diet_meals">;
export type FinanceCategory = Tables<"finance_categories">;
export type FinanceExpense = Tables<"finance_expenses">;
export type Task = Tables<"tasks">;

export type { HobbyKind, MealKind } from "./database.types";
