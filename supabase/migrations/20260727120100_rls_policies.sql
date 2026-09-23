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
