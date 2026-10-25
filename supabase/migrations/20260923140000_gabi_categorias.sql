-- 1. Financeiro: entradas (bolsa, estágio, mesada)
alter table public.finance_expenses
  add column if not exists is_income boolean not null default false;

-- 2, 3, 7 e 9. Hobbies: progresso, meta, gênero e estrelas
do $$ begin
  create type hobby_status as enum ('nao_iniciado','em_andamento','concluido');
exception when duplicate_object then null; end $$;

alter table public.hobby_items
  add column if not exists status    hobby_status not null default 'nao_iniciado',
  add column if not exists goal_date date,
  add column if not exists genre     text,
  add column if not exists rating    smallint;

-- 6. Mercado: categoria
alter table public.shopping_items
  add column if not exists category text;

-- 8. Treino: tempo de descanso
alter table public.workout_exercises
  add column if not exists rest_seconds smallint;
