-- ============================================================
-- Esther's Planner — SQL completo (cole no SQL Editor do Supabase)
-- Gerado a partir das 3 migrations, na ordem correta.
-- ============================================================


-- >>>>>>>>>> 20260727120000_schema.sql <<<<<<<<<<

-- ============================================================================
-- Esther's Planner — Initial schema
-- ----------------------------------------------------------------------------
-- Conventions applied to EVERY table:
--   * id          uuid  primary key (gen_random_uuid)
--   * user_id     uuid  not null -> auth.users(id) on delete cascade
--                 (except `profiles`, whose PK *is* the auth user id)
--   * created_at  timestamptz not null default now()
--   * updated_at  timestamptz not null default now()  (kept fresh by trigger)
--   * deleted_at  timestamptz  -> SOFT DELETE (null = active row)
-- RLS is enabled in a separate migration (20260727120100_rls_policies.sql).
-- ============================================================================

-- Extensions ----------------------------------------------------------------
create extension if not exists "pgcrypto" with schema extensions;   -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Helper: keep updated_at fresh on every UPDATE.
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Helper: create a profile row automatically when a new auth user signs up.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- 1. profiles
-- ===========================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  timezone    text not null default 'America/Sao_Paulo',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ===========================================================================
-- 2. categories  (generic: tasks, finance, goals ...)
-- ===========================================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  kind        text not null default 'general',   -- 'general' | 'finance' | 'task' | ...
  color       text,
  icon        text,
  position    integer not null default 0,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ===========================================================================
-- 3. tasks  (powers the /tarefas route)
-- ===========================================================================
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title       text not null,
  notes       text,
  done        boolean not null default false,
  priority    integer not null default 0,
  due_date    date,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ===========================================================================
-- 4. subtasks
-- ===========================================================================
create table if not exists public.subtasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  task_id     uuid not null references public.tasks(id) on delete cascade,
  title       text not null,
  done        boolean not null default false,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ===========================================================================
-- 5. habits
-- ===========================================================================
create table if not exists public.habits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  description   text,
  frequency     text not null default 'daily',   -- 'daily' | 'weekly' | ...
  target_count  integer not null default 1,
  color         text,
  archived      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- ===========================================================================
-- 6. habit_logs
-- ===========================================================================
create table if not exists public.habit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  habit_id    uuid not null references public.habits(id) on delete cascade,
  log_date    date not null default current_date,
  count       integer not null default 1,
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ===========================================================================
-- 7. goals
-- ===========================================================================
create table if not exists public.goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  category_id   uuid references public.categories(id) on delete set null,
  title         text not null,
  description   text,
  target_value  numeric,
  current_value numeric not null default 0,
  unit          text,
  status        text not null default 'active',   -- 'active' | 'done' | 'archived'
  due_date      date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- ===========================================================================
-- 8. goal_progress
-- ===========================================================================
create table if not exists public.goal_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  goal_id     uuid not null references public.goals(id) on delete cascade,
  value       numeric not null,
  note        text,
  logged_at   timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ===========================================================================
-- 9. notes
-- ===========================================================================
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  content     text,
  pinned      boolean not null default false,
  color       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ===========================================================================
-- 10. calendar_events
-- ===========================================================================
create table if not exists public.calendar_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  all_day     boolean not null default false,
  location    text,
  color       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ===========================================================================
-- 11. shopping_lists  (powers the /mercado route)
-- ===========================================================================
create table if not exists public.shopping_lists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'Mercado',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ===========================================================================
-- 12. shopping_items
-- ===========================================================================
create table if not exists public.shopping_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  list_id     uuid not null references public.shopping_lists(id) on delete cascade,
  name        text not null,
  quantity    text not null default '1',
  checked     boolean not null default false,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ===========================================================================
-- 13. planner_settings  (per-user key/value JSON store)
--     Backs the "cloud state" for nested UIs: treino, dieta, estudos,
--     hobbies and financeiro. One row per (user_id, key).
-- ===========================================================================
create table if not exists public.planner_settings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  key         text not null,
  value       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  constraint planner_settings_user_key_unique unique (user_id, key)
);

-- ===========================================================================
-- 14. attachments
-- ===========================================================================
create table if not exists public.attachments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  bucket       text not null default 'attachments',
  path         text not null,
  file_name    text,
  mime_type    text,
  size_bytes   bigint,
  entity_type  text,          -- e.g. 'task', 'note'
  entity_id    uuid,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

-- ===========================================================================
-- 15. mood_logs
-- ===========================================================================
create table if not exists public.mood_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  log_date    date not null default current_date,
  mood        integer not null check (mood between 1 and 5),
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ===========================================================================
-- updated_at triggers (one per table)
-- ===========================================================================
do $$
declare
  t text;
  tbls text[] := array[
    'profiles','categories','tasks','subtasks','habits','habit_logs',
    'goals','goal_progress','notes','calendar_events','shopping_lists',
    'shopping_items','planner_settings','attachments','mood_logs'
  ];
begin
  foreach t in array tbls loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.handle_updated_at();', t);
  end loop;
end;
$$;

-- ===========================================================================
-- Indexes
-- ===========================================================================
-- Ownership lookups (every query filters by user_id).
create index if not exists idx_categories_user       on public.categories(user_id);
create index if not exists idx_tasks_user             on public.tasks(user_id);
create index if not exists idx_subtasks_user          on public.subtasks(user_id);
create index if not exists idx_habits_user            on public.habits(user_id);
create index if not exists idx_habit_logs_user        on public.habit_logs(user_id);
create index if not exists idx_goals_user             on public.goals(user_id);
create index if not exists idx_goal_progress_user     on public.goal_progress(user_id);
create index if not exists idx_notes_user             on public.notes(user_id);
create index if not exists idx_calendar_events_user   on public.calendar_events(user_id);
create index if not exists idx_shopping_lists_user    on public.shopping_lists(user_id);
create index if not exists idx_shopping_items_user    on public.shopping_items(user_id);
create index if not exists idx_planner_settings_user  on public.planner_settings(user_id);
create index if not exists idx_attachments_user       on public.attachments(user_id);
create index if not exists idx_mood_logs_user         on public.mood_logs(user_id);

-- Foreign-key / relationship lookups.
create index if not exists idx_subtasks_task          on public.subtasks(task_id);
create index if not exists idx_tasks_category         on public.tasks(category_id);
create index if not exists idx_habit_logs_habit       on public.habit_logs(habit_id);
create index if not exists idx_goals_category         on public.goals(category_id);
create index if not exists idx_goal_progress_goal     on public.goal_progress(goal_id);
create index if not exists idx_shopping_items_list    on public.shopping_items(list_id);
create index if not exists idx_attachments_entity     on public.attachments(entity_type, entity_id);

-- Soft-delete: partial indexes so "active rows" scans stay fast.
create index if not exists idx_tasks_active           on public.tasks(user_id) where deleted_at is null;
create index if not exists idx_shopping_items_active  on public.shopping_items(user_id) where deleted_at is null;

-- Common filters.
create index if not exists idx_habit_logs_date        on public.habit_logs(user_id, log_date);
create index if not exists idx_mood_logs_date         on public.mood_logs(user_id, log_date);
create index if not exists idx_calendar_events_range  on public.calendar_events(user_id, starts_at);

-- >>>>>>>>>> 20260727120100_rls_policies.sql <<<<<<<<<<

-- ============================================================================
-- Row Level Security — every table is private to its owner.
-- ----------------------------------------------------------------------------
-- `profiles` is keyed by `id` (= auth.uid()); all other tables by `user_id`.
-- Soft-deleted rows are still owned by the user and remain visible to them
-- (the application filters `deleted_at is null`); they are never visible to
-- anyone else.
-- ============================================================================

-- Enable RLS on every table -------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.tasks            enable row level security;
alter table public.subtasks         enable row level security;
alter table public.habits           enable row level security;
alter table public.habit_logs       enable row level security;
alter table public.goals            enable row level security;
alter table public.goal_progress    enable row level security;
alter table public.notes            enable row level security;
alter table public.calendar_events  enable row level security;
alter table public.shopping_lists   enable row level security;
alter table public.shopping_items   enable row level security;
alter table public.planner_settings enable row level security;
alter table public.attachments      enable row level security;
alter table public.mood_logs        enable row level security;

-- ---------------------------------------------------------------------------
-- profiles: owner is the row id itself.
-- ---------------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_insert on public.profiles;
drop policy if exists profiles_update on public.profiles;
drop policy if exists profiles_delete on public.profiles;

create policy profiles_select on public.profiles
  for select using (auth.uid() = id);
create policy profiles_insert on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy profiles_delete on public.profiles
  for delete using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- All other tables share the identical owner-by-user_id policy set.
-- Generated in a loop to stay DRY and consistent.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  tbls text[] := array[
    'categories','tasks','subtasks','habits','habit_logs','goals',
    'goal_progress','notes','calendar_events','shopping_lists',
    'shopping_items','planner_settings','attachments','mood_logs'
  ];
begin
  foreach t in array tbls loop
    execute format('drop policy if exists %I on public.%I;', t || '_select', t);
    execute format('drop policy if exists %I on public.%I;', t || '_insert', t);
    execute format('drop policy if exists %I on public.%I;', t || '_update', t);
    execute format('drop policy if exists %I on public.%I;', t || '_delete', t);

    execute format(
      'create policy %I on public.%I for select using (auth.uid() = user_id);',
      t || '_select', t);
    execute format(
      'create policy %I on public.%I for insert with check (auth.uid() = user_id);',
      t || '_insert', t);
    execute format(
      'create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t || '_update', t);
    execute format(
      'create policy %I on public.%I for delete using (auth.uid() = user_id);',
      t || '_delete', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Storage: the `attachments` bucket is private per user.
-- Files must be stored under a top-level folder named after the user id,
-- e.g.  <user_id>/<filename>.  Policy enforces that prefix.
-- ---------------------------------------------------------------------------
drop policy if exists attachments_storage_select on storage.objects;
drop policy if exists attachments_storage_insert on storage.objects;
drop policy if exists attachments_storage_update on storage.objects;
drop policy if exists attachments_storage_delete on storage.objects;

create policy attachments_storage_select on storage.objects
  for select using (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy attachments_storage_insert on storage.objects
  for insert with check (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy attachments_storage_update on storage.objects
  for update using (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy attachments_storage_delete on storage.objects
  for delete using (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- >>>>>>>>>> 20260727120200_realtime_views.sql <<<<<<<<<<

-- ============================================================================
-- Realtime publication + convenience views
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Realtime: broadcast row changes so every connected device stays in sync.
-- RLS still applies to realtime, so users only receive their own changes.
-- `supabase_realtime` is created by Supabase; add each table idempotently.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  tbls text[] := array[
    'tasks','subtasks','categories','shopping_lists','shopping_items',
    'planner_settings','habits','habit_logs','goals','goal_progress',
    'notes','calendar_events','mood_logs','attachments','profiles'
  ];
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  foreach t in array tbls loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I;', t);
    end if;
    -- REPLICA IDENTITY FULL so UPDATE/DELETE payloads include the old row,
    -- which the client needs to reconcile optimistic cache updates.
    execute format('alter table public.%I replica identity full;', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- View: active (non-soft-deleted) tasks with their subtask counts.
-- security_invoker = true so the caller's RLS is enforced through the view.
-- ---------------------------------------------------------------------------
create or replace view public.v_active_tasks
with (security_invoker = true) as
select
  t.*,
  count(s.id) filter (where s.deleted_at is null)                 as subtask_total,
  count(s.id) filter (where s.deleted_at is null and s.done)      as subtask_done
from public.tasks t
left join public.subtasks s on s.task_id = t.id
where t.deleted_at is null
group by t.id;

-- ---------------------------------------------------------------------------
-- View: shopping list summary (open vs checked item counts).
-- ---------------------------------------------------------------------------
create or replace view public.v_shopping_summary
with (security_invoker = true) as
select
  l.id            as list_id,
  l.user_id,
  l.name,
  count(i.id) filter (where i.deleted_at is null)                 as total_items,
  count(i.id) filter (where i.deleted_at is null and i.checked)   as checked_items
from public.shopping_lists l
left join public.shopping_items i on i.list_id = l.id
where l.deleted_at is null
group by l.id;
