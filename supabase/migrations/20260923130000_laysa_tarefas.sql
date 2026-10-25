
-- Melhorias de tarefas: prioridade, status e categoria.
-- Depende da migration que cria o tipo conteudo_tipo.

DO $$ BEGIN
  CREATE TYPE tarefa_prioridade AS ENUM (
    'baixa',
    'media',
    'alta'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tarefa_status AS ENUM (
    'pendente',
    'em_andamento',
    'concluida'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS priority tarefa_prioridade
    NOT NULL DEFAULT 'media',
  ADD COLUMN IF NOT EXISTS status tarefa_status
    NOT NULL DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS kind conteudo_tipo,
  ADD COLUMN IF NOT EXISTS is_academic boolean
    NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS track_id uuid
    REFERENCES public.study_tracks(id)
    ON DELETE SET NULL;

-- Permite tarefas sem prazo definido.
ALTER TABLE public.tasks
  ALTER COLUMN due_date DROP NOT NULL,
  ALTER COLUMN due_date DROP DEFAULT;

CREATE INDEX IF NOT EXISTS tasks_track_idx
  ON public.tasks (track_id);
