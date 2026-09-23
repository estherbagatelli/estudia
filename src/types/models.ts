/**
 * App-facing domain types, derived from the generated database types.
 * Import these throughout the app instead of reaching into database.types.
 */
import type { Tables, TablesInsert, TablesUpdate } from "./database.types";

export type Profile = Tables<"profiles">;
export type Category = Tables<"categories">;
export type Task = Tables<"tasks">;
export type Subtask = Tables<"subtasks">;
export type Habit = Tables<"habits">;
export type HabitLog = Tables<"habit_logs">;
export type Goal = Tables<"goals">;
export type GoalProgress = Tables<"goal_progress">;
export type Note = Tables<"notes">;
export type CalendarEvent = Tables<"calendar_events">;
export type ShoppingList = Tables<"shopping_lists">;
export type ShoppingItem = Tables<"shopping_items">;
export type PlannerSetting = Tables<"planner_settings">;
export type Attachment = Tables<"attachments">;
export type MoodLog = Tables<"mood_logs">;

export type TaskInsert = TablesInsert<"tasks">;
export type TaskUpdate = TablesUpdate<"tasks">;
export type ShoppingItemInsert = TablesInsert<"shopping_items">;
export type ShoppingItemUpdate = TablesUpdate<"shopping_items">;
