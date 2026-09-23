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
