# Instruções para assistentes de IA

Este arquivo é lido por ferramentas de IA (Claude Code, Cursor, Copilot,
Lovable) usadas neste repositório. Serve também como resumo rápido das regras
do projeto para quem for programar.

## O projeto

**Estudia** — planner de rotina e estudos para universitários. Projeto
Integrador II, Fase 2. Seis pessoas, cada uma responsável por uma área. A
divisão está em `docs/DIVISAO-POR-PESSOA.md` e a ordem de execução em
`docs/PLANO-FASE-2.md`.

## Regras que não se quebram

1. **Nunca escreva cor na mão.** Use os tokens: `magenta`, `gold`, `wine`,
   `pink`, `silver`, `darkred`, `foreground`, `muted-foreground`, `background`,
   `card`, `border`. Cor literal (`#hex`, `oklch(...)`) quebra o sistema de
   temas.
2. **Não edite `src/types/database.types.ts` nem `src/routeTree.gen.ts`.** São
   arquivos gerados. Use `npm run gen:types` e `npm run dev`.
3. **Migration é só para frente.** Nunca altere uma migration existente em
   `supabase/migrations/` — crie um arquivo novo.
4. **Respeite a propriedade dos arquivos.** Cada pessoa tem uma lista de
   arquivos seus e de arquivos proibidos em `docs/DIVISAO-POR-PESSOA.md`.
   Trabalhe apenas nos arquivos da tarefa em questão.
5. **Não faça commit direto no `main`.** Tudo entra por Pull Request.
6. **Nunca reescreva histórico já publicado** — nada de `push --force`,
   `rebase`, `amend` ou `squash` em commits que já estão no GitHub. Seis pessoas
   puxam deste repositório; reescrever histórico faz outra pessoa perder
   trabalho.
7. **Não aumente o escopo.** Cada ficha tem uma seção "não entra nesta fase".
   Funcionalidade extra atrasa a entrega de 15 dias.

## Padrões do código

- Uma tela por arquivo em `src/routes/`; a regra de cada área fica no hook
  correspondente em `src/hooks/`.
- Acesso ao banco sempre via `repo("nome_da_tabela")`
  (`src/repositories/base.repository.ts`). Nunca passe `owner_id` — o banco
  preenche sozinho e as regras de acesso por usuário cuidam do resto.
- Leitura com `useQuery`, escrita com `useMutation` + `invalidateQueries`.
- Mensagens ao usuário com `toast` do `sonner`, em português.
- Textos de interface em português do Brasil.

## Antes de terminar qualquer tarefa

```bash
npx tsc --noEmit
npm run lint
```

Os dois precisam passar.
