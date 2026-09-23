/**
 * Supabase database types.
 *
 * This file mirrors the SQL schema in `supabase/migrations`. It is written by
 * hand here so the app type-checks before you ever connect to a database.
 * Once your project is linked you should REGENERATE it from the live schema to
 * keep it authoritative:
 *
 *   npm run gen:types
 *   # -> supabase gen types typescript --linked > src/types/database.types.ts
 *
 * Keep the shapes in sync with the migrations.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamps = {
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          timezone: string;
        } & Timestamps;
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };

      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          kind: string;
          color: string | null;
          icon: string | null;
          position: number;
          metadata: Json;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          kind?: string;
          color?: string | null;
          icon?: string | null;
          position?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };

      tasks: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          title: string;
          notes: string | null;
          done: boolean;
          priority: number;
          due_date: string | null;
          position: number;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          title: string;
          notes?: string | null;
          done?: boolean;
          priority?: number;
          due_date?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
        Relationships: [];
      };

      subtasks: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          title: string;
          done: boolean;
          position: number;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          title: string;
          done?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["subtasks"]["Insert"]>;
        Relationships: [];
      };

      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          frequency: string;
          target_count: number;
          color: string | null;
          archived: boolean;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          frequency?: string;
          target_count?: number;
          color?: string | null;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["habits"]["Insert"]>;
        Relationships: [];
      };

      habit_logs: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          log_date: string;
          count: number;
          note: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          habit_id: string;
          log_date?: string;
          count?: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["habit_logs"]["Insert"]>;
        Relationships: [];
      };

      goals: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          target_value: number | null;
          current_value: number;
          unit: string | null;
          status: string;
          due_date: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          target_value?: number | null;
          current_value?: number;
          unit?: string | null;
          status?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["goals"]["Insert"]>;
        Relationships: [];
      };

      goal_progress: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          value: number;
          note: string | null;
          logged_at: string;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          goal_id: string;
          value: number;
          note?: string | null;
          logged_at?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["goal_progress"]["Insert"]>;
        Relationships: [];
      };

      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          content: string | null;
          pinned: boolean;
          color: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          content?: string | null;
          pinned?: boolean;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["notes"]["Insert"]>;
        Relationships: [];
      };

      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          starts_at: string;
          ends_at: string | null;
          all_day: boolean;
          location: string | null;
          color: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          starts_at: string;
          ends_at?: string | null;
          all_day?: boolean;
          location?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["calendar_events"]["Insert"]>;
        Relationships: [];
      };

      shopping_lists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_default: boolean;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["shopping_lists"]["Insert"]>;
        Relationships: [];
      };

      shopping_items: {
        Row: {
          id: string;
          user_id: string;
          list_id: string;
          name: string;
          quantity: string;
          checked: boolean;
          position: number;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          list_id: string;
          name: string;
          quantity?: string;
          checked?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["shopping_items"]["Insert"]>;
        Relationships: [];
      };

      planner_settings: {
        Row: {
          id: string;
          user_id: string;
          key: string;
          value: Json;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          key: string;
          value?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["planner_settings"]["Insert"]>;
        Relationships: [];
      };

      attachments: {
        Row: {
          id: string;
          user_id: string;
          bucket: string;
          path: string;
          file_name: string | null;
          mime_type: string | null;
          size_bytes: number | null;
          entity_type: string | null;
          entity_id: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          bucket?: string;
          path: string;
          file_name?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          entity_type?: string | null;
          entity_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["attachments"]["Insert"]>;
        Relationships: [];
      };

      mood_logs: {
        Row: {
          id: string;
          user_id: string;
          log_date: string;
          mood: number;
          note: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          log_date?: string;
          mood: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["mood_logs"]["Insert"]>;
        Relationships: [];
      };
    };

    Views: {
      v_active_tasks: {
        Row: Database["public"]["Tables"]["tasks"]["Row"] & {
          subtask_total: number;
          subtask_done: number;
        };
        Relationships: [];
      };
      v_shopping_summary: {
        Row: {
          list_id: string;
          user_id: string;
          name: string;
          total_items: number;
          checked_items: number;
        };
        Relationships: [];
      };
    };

    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ---- Convenience helpers ---------------------------------------------------
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
