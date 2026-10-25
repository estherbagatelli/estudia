
-- Adiciona informações às matérias
ALTER TABLE public.study_tracks
  ADD COLUMN IF NOT EXISTS course TEXT,
  ADD COLUMN IF NOT EXISTS period TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT;


-- Cria os 6 tipos de conteúdo
DO $$ BEGIN
  CREATE TYPE conteudo_tipo AS ENUM (
    'conteudo',
    'estudo',
    'revisao',
    'atividade',
    'trabalho',
    'prova'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Adiciona o tipo aos conteúdos
ALTER TABLE public.study_topics
  ADD COLUMN IF NOT EXISTS kind conteudo_tipo
  NOT NULL DEFAULT 'conteudo';
