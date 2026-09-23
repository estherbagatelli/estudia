/** Central React Query key factory — keyed per user. */
export const queryKeys = {
  tasks: (u: string) => ["tasks", u] as const,
  shopping: (u: string) => ["shopping_items", u] as const,
  quotes: (u: string) => ["quotes", u] as const,
  studyTracks: (u: string) => ["study_tracks", u] as const,
  studyTopics: (u: string) => ["study_topics", u] as const,
  hobbies: (u: string) => ["hobby_items", u] as const,
  workouts: (u: string) => ["workouts", u] as const,
  workoutExercises: (u: string) => ["workout_exercises", u] as const,
  dietDays: (u: string) => ["diet_days", u] as const,
  dietMeals: (u: string) => ["diet_meals", u] as const,
  financeCategories: (u: string) => ["finance_categories", u] as const,
  financeExpenses: (u: string) => ["finance_expenses", u] as const,
  seed: (u: string) => ["seed", u] as const,
};
