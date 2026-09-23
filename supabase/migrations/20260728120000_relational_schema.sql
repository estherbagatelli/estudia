-- ============================================================================
-- Esther's Planner — Esquema RELACIONAL (Opção A)
-- Reset do schema anterior (KV/híbrido) + modelo relacional completo.
-- Idempotente: pode ser colado no SQL Editor quantas vezes precisar.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. RESET — remove o schema anterior e qualquer versão parcial deste.
-- ----------------------------------------------------------------------------
drop view if exists
  public.v_study_progress, public.v_finance_summary,
  public.v_diet_day_totals, public.v_workout_progress,
  public.v_active_tasks, public.v_shopping_summary cascade;

drop table if exists
  -- tabelas do modelo antigo (híbrido/KV)
  public.categories, public.subtasks, public.habits, public.habit_logs,
  public.goals, public.goal_progress, public.notes, public.calendar_events,
  public.shopping_lists, public.planner_settings, public.attachments,
  public.mood_logs,
  -- tabelas do modelo relacional (para re-execução limpa)
  public.quotes, public.study_topics, public.study_tracks, public.hobby_items,
  public.workout_exercises, public.workout_sessions, public.workouts,
  public.diet_meals, public.diet_days, public.finance_expenses,
  public.finance_categories, public.shopping_items, public.tasks,
  public.profiles cascade;

drop type if exists public.hobby_kind cascade;
drop type if exists public.meal_kind cascade;

drop function if exists public.set_updated_at() cascade;
drop function if exists public.sync_completed_at() cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.handle_updated_at() cascade;

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Utilitário: mantém updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- ENUMs
-- ----------------------------------------------------------------------------
create type public.hobby_kind as enum ('filme', 'serie', 'anime', 'livro');
create type public.meal_kind as enum (
  'cafe', 'lanche', 'pre_treino', 'almoco', 'lanche_tarde', 'janta', 'ceia'
);

-- ============================================================================
-- 0. PERFIL
-- ============================================================================
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Esther',
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Cria o perfil automaticamente quando um usuário se cadastra.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      'Esther'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 1. INÍCIO — frases do dia
-- ============================================================================
create table public.quotes (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  text       text not null,
  author     text,
  is_active  boolean not null default true,
  position   smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index quotes_owner_idx on public.quotes (owner_id, position);

-- ============================================================================
-- 2. ESTUDOS
-- ============================================================================
create table public.study_tracks (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null,
  subtitle   text,
  position   smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_tracks_name_unique unique (owner_id, name)
);

create table public.study_topics (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  track_id    uuid not null references public.study_tracks(id) on delete cascade,
  title       text not null,
  is_done     boolean not null default false,
  completed_at timestamptz,
  notes       text,
  position    smallint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index study_topics_track_idx on public.study_topics (track_id, position);
create index study_topics_owner_idx on public.study_topics (owner_id);

-- ============================================================================
-- 3. HOBBIES
-- ============================================================================
create table public.hobby_items (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind          public.hobby_kind not null,
  title         text not null,
  author        text,
  is_done       boolean not null default false,
  completed_at  timestamptz,
  season        smallint check (season >= 0),
  episode       smallint check (episode >= 0),
  rating        smallint check (rating between 1 and 5),
  position      smallint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint hobby_progress_coherence check (
    kind in ('serie', 'anime')
    or (season is null and episode is null)
  )
);
create index hobby_items_owner_kind_idx on public.hobby_items (owner_id, kind, position);

-- ============================================================================
-- 4. TREINO
-- ============================================================================
create table public.workouts (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null,
  focus      text,
  weekday    smallint check (weekday between 0 and 6),
  position   smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workouts_name_unique unique (owner_id, name)
);

create table public.workout_exercises (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  workout_id  uuid not null references public.workouts(id) on delete cascade,
  name        text not null,
  sets        smallint check (sets > 0),
  reps        text,
  load_kg     numeric(6,2),
  is_done     boolean not null default false,
  notes       text,
  position    smallint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index workout_exercises_workout_idx on public.workout_exercises (workout_id, position);
create index workout_exercises_owner_idx on public.workout_exercises (owner_id);

create table public.workout_sessions (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  workout_id   uuid not null references public.workouts(id) on delete cascade,
  performed_on date not null default current_date,
  done_count   smallint not null default 0,
  total_count  smallint not null default 0,
  created_at   timestamptz not null default now(),
  constraint workout_sessions_unique unique (workout_id, performed_on)
);
create index workout_sessions_owner_idx on public.workout_sessions (owner_id, performed_on desc);

-- ============================================================================
-- 5. MERCADO
-- ============================================================================
create table public.shopping_items (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null,
  quantity   smallint not null default 1 check (quantity > 0),
  unit       text,
  price      numeric(10,2),
  is_checked boolean not null default false,
  position   smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index shopping_items_owner_idx on public.shopping_items (owner_id, is_checked, position);

-- ============================================================================
-- 6. DIETA
-- ============================================================================
create table public.diet_days (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null,
  weekday    smallint check (weekday between 0 and 6),
  position   smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint diet_days_name_unique unique (owner_id, name)
);

create table public.diet_meals (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day_id      uuid not null references public.diet_days(id) on delete cascade,
  kind        public.meal_kind not null,
  description text not null,
  calories    integer check (calories >= 0),
  position    smallint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index diet_meals_day_idx on public.diet_meals (day_id, position);
create index diet_meals_owner_idx on public.diet_meals (owner_id);

-- ============================================================================
-- 7. FINANCEIRO
-- ============================================================================
create table public.finance_categories (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null,
  balance    numeric(12,2) not null default 0,
  color      text,
  position   smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_categories_name_unique unique (owner_id, name)
);

create table public.finance_expenses (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id uuid not null references public.finance_categories(id) on delete cascade,
  description text not null,
  amount      numeric(12,2) not null check (amount >= 0),
  spent_on    date not null default current_date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index finance_expenses_category_idx on public.finance_expenses (category_id, spent_on desc);
create index finance_expenses_owner_idx on public.finance_expenses (owner_id, spent_on desc);

-- ============================================================================
-- 8. TAREFAS
-- ============================================================================
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title        text not null,
  is_done      boolean not null default false,
  completed_at timestamptz,
  due_date     date not null default current_date,
  position     smallint not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index tasks_owner_due_idx on public.tasks (owner_id, due_date, position);

-- ============================================================================
-- TRIGGERS updated_at
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','quotes','study_tracks','study_topics','hobby_items',
    'workouts','workout_exercises','shopping_items','diet_days',
    'diet_meals','finance_categories','finance_expenses','tasks'
  ] loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t, t);
  end loop;
end;
$$;

-- ============================================================================
-- TRIGGER: completed_at automático
-- ============================================================================
create or replace function public.sync_completed_at()
returns trigger language plpgsql as $$
begin
  if new.is_done and (old.is_done is distinct from new.is_done) then
    new.completed_at = now();
  elsif not new.is_done then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

create trigger tasks_sync_completed_at
  before update on public.tasks
  for each row execute function public.sync_completed_at();
create trigger study_topics_sync_completed_at
  before update on public.study_topics
  for each row execute function public.sync_completed_at();
create trigger hobby_items_sync_completed_at
  before update on public.hobby_items
  for each row execute function public.sync_completed_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles           enable row level security;
alter table public.quotes             enable row level security;
alter table public.study_tracks       enable row level security;
alter table public.study_topics       enable row level security;
alter table public.hobby_items        enable row level security;
alter table public.workouts           enable row level security;
alter table public.workout_exercises  enable row level security;
alter table public.workout_sessions   enable row level security;
alter table public.shopping_items     enable row level security;
alter table public.diet_days          enable row level security;
alter table public.diet_meals         enable row level security;
alter table public.finance_categories enable row level security;
alter table public.finance_expenses   enable row level security;
alter table public.tasks              enable row level security;

create policy "profiles_self" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array[
    'quotes','study_tracks','study_topics','hobby_items','workouts',
    'workout_exercises','workout_sessions','shopping_items','diet_days',
    'diet_meals','finance_categories','finance_expenses','tasks'
  ] loop
    execute format(
      'create policy %I_owner on public.%I for all
         using (owner_id = auth.uid()) with check (owner_id = auth.uid())', t, t);
  end loop;
end;
$$;

-- ============================================================================
-- REALTIME — sincroniza mudanças entre dispositivos (RLS continua valendo)
-- ============================================================================
do $$
declare
  t text;
  tbls text[] := array[
    'tasks','quotes','study_tracks','study_topics','hobby_items','workouts',
    'workout_exercises','workout_sessions','shopping_items','diet_days',
    'diet_meals','finance_categories','finance_expenses','profiles'
  ];
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  foreach t in array tbls loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname='supabase_realtime' and schemaname='public' and tablename=t
    ) then
      execute format('alter publication supabase_realtime add table public.%I;', t);
    end if;
    execute format('alter table public.%I replica identity full;', t);
  end loop;
end;
$$;

-- ============================================================================
-- VIEWS
-- ============================================================================
create or replace view public.v_study_progress
with (security_invoker = true) as
select t.id as track_id, t.owner_id, t.name, t.subtitle, t.position,
  count(tp.id) as total,
  count(tp.id) filter (where tp.is_done) as done,
  round(100.0 * count(tp.id) filter (where tp.is_done) / nullif(count(tp.id),0), 0) as percent
from public.study_tracks t
left join public.study_topics tp on tp.track_id = t.id
group by t.id;

create or replace view public.v_finance_summary
with (security_invoker = true) as
select c.id as category_id, c.owner_id, c.name,
  c.balance as saldo,
  coalesce(sum(e.amount),0) as gasto,
  c.balance - coalesce(sum(e.amount),0) as disponivel,
  c.position
from public.finance_categories c
left join public.finance_expenses e on e.category_id = c.id
group by c.id;

create or replace view public.v_diet_day_totals
with (security_invoker = true) as
select d.id as day_id, d.owner_id, d.name, d.position,
  coalesce(sum(m.calories),0) as total_calories,
  count(m.id) as meal_count
from public.diet_days d
left join public.diet_meals m on m.day_id = d.id
group by d.id;

create or replace view public.v_workout_progress
with (security_invoker = true) as
select w.id as workout_id, w.owner_id, w.name, w.focus, w.position,
  count(e.id) as total,
  count(e.id) filter (where e.is_done) as done
from public.workouts w
left join public.workout_exercises e on e.workout_id = w.id
group by w.id;
