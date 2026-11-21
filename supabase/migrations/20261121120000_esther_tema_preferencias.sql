-- ============================================================================
-- Fase 3 — Tema e preferências do usuário no banco
--
-- O documento da Fase 3 pede, em "Usuário": tema escolhido.
-- E em "Personalização": tema e preferências do usuário.
--
-- Até aqui essas escolhas viviam só no localStorage do navegador
-- (src/components/AppShell.tsx e src/routes/__root.tsx), que é por
-- dispositivo. Trocar o tema no notebook não aparecia no celular.
-- Guardando em `profiles`, a escolha passa a seguir a CONTA, não o aparelho.
--
-- Esta migration só ACRESCENTA colunas. Não altera nem remove nada do que
-- já existe, então não conflita com o trabalho de ninguém do grupo.
-- ============================================================================

alter table public.profiles
  add column if not exists theme       text  not null default 'estudia',
  add column if not exists appearance  text  not null default 'claro',
  add column if not exists preferences jsonb not null default '{}'::jsonb;

-- `appearance` só tem dois valores possíveis e isso não muda: vale travar.
-- `theme` fica livre de propósito — a lista de temas vive em src/lib/temas.ts
-- e quem acrescentar um tema novo não deve precisar de migration.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_appearance_check'
  ) then
    alter table public.profiles
      add constraint profiles_appearance_check
      check (appearance in ('claro', 'escuro'));
  end if;
end;
$$;

comment on column public.profiles.theme is
  'Tema de cor escolhido. Os ids válidos estão em src/lib/temas.ts.';
comment on column public.profiles.appearance is
  'Modo de exibição: claro ou escuro.';
comment on column public.profiles.preferences is
  'Preferências livres do usuário, em JSON. Começa vazio.';

-- Observações:
--  * RLS: a policy "profiles_self" já é `for all` sobre a tabela inteira,
--    então as colunas novas já nascem protegidas. Nada a fazer.
--  * Realtime: `profiles` já está na publication supabase_realtime, então a
--    troca de tema num aparelho chega nos outros sozinha.
--  * updated_at: o gatilho profiles_set_updated_at já cobre as colunas novas.
