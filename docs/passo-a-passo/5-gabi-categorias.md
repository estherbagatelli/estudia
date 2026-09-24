# Gabi — Hobbies, Treino, Mercado, Dieta e Financeiro

**Pessoa 5 · Grupo 3 · Etapa 2 (dias 8–10)**

Leia antes: [TECNOLOGIAS.md](../TECNOLOGIAS.md), [ARQUITETURA.md](../ARQUITETURA.md)
e [GUIA-GIT.md](../GUIA-GIT.md).

> **Você tem o escopo mais tranquilo do projeto:** nenhum outro integrante
> encosta nos seus arquivos durante a Fase 2 inteira. Pode começar assim que os
> temas da Lara entrarem no `main` — não precisa esperar mais ninguém.

---

## O que você entrega

Na ordem de prioridade **do seu próprio relatório**. Faça os quatro de
prioridade **Alta** primeiro.

| #   | Prioridade | Área       | O que fazer                                          |
| --- | ---------- | ---------- | ---------------------------------------------------- |
| 1   | **Alta**   | Financeiro | incluir **entrada** (bolsa, estágio, mesada)         |
| 2   | **Alta**   | Hobbies    | **progresso**: não iniciado, em andamento, concluído |
| 3   | **Alta**   | Hobbies    | **metas por data**                                   |
| 4   | **Alta**   | Treino     | **dado de treinos concluídos**                       |
| 5   | Média      | Financeiro | total de entradas e de gastos, fora de categoria     |
| 6   | Média      | Mercado    | **categoria** do item, criada pelo usuário           |
| 7   | Média      | Hobbies    | subcategorias: gêneros e tipos                       |
| 8   | Média      | Treino     | tempo de descanso                                    |
| 9   | Baixa      | Hobbies    | classificação por estrelas                           |

Os **Médios** entram se sobrar tempo. O **Baixo** fica para a Fase 3, sem culpa
nenhuma.

### Sobre a Dieta

Seu relatório concluiu que, para o contexto estudantil, não havia melhoria
notória. **Concordamos — você não precisa mexer na Dieta.** Ela só recebe o
padrão visual, que é trabalho da Esther na Etapa 3.

**Não entra nesta fase:** aplicativo de nutrição, contagem de macronutrientes,
gráfico de evolução de carga, orçamento com projeção.

---

## Dois avisos que economizam o seu tempo

**O item 4 já tem o banco pronto.** A tabela `workout_sessions` existe desde a
refatoração, com `performed_on` e `owner_id`. **Não crie tabela nova** — você
só precisa da interface: registrar a sessão e mostrar a contagem.

**Em Hobbies, temporada e episódio já existem** e já aparecem na tela. O que
falta é o **status** e a **meta por data**.

---

## Passo a passo

### 1. Ambiente e branch

```bash
git checkout main
git pull origin main        # precisa já ter os temas da Lara
npm install
git checkout -b p5-gabi/financeiro-entradas
```

> **Uma branch por item**, não uma só para os nove. Pull Request pequeno é
> revisado rápido; um gigante fica dias parado.

---

## 🛑 PARE — checkpoint de banco

Você é a única que mexe em várias tabelas, então **escreva tudo de uma vez** —
assim a Esther aplica uma vez só e você não fica esperando quatro vezes.

Crie `supabase/migrations/20260923140000_gabi_categorias.sql`:

```sql
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
```

**Não aplique.** Chame a Esther no grupo — ver
[BANCO-DE-DADOS.md](../BANCO-DE-DADOS.md).

---

### 2. Item 1 — Entrada no Financeiro

Uma entrada é um lançamento com `is_income = true`. Em
`src/hooks/useFinanceiro.ts`, some separado:

```ts
const entradas = lancamentos.filter((l) => l.is_income).reduce((s, l) => s + Number(l.amount), 0);
const gastos = lancamentos.filter((l) => !l.is_income).reduce((s, l) => s + Number(l.amount), 0);
const saldo = entradas - gastos;
```

Na tela (`src/routes/financeiro.tsx`), no formulário de lançamento, acrescente
a escolha entre **Gasto** e **Entrada**. E mostre a entrada com sinal e cor
diferentes do gasto — **com token**: `text-gold` para entrada, `text-magenta`
para gasto.

> **O item 5 sai quase de graça daqui.** Já que você calculou `entradas`,
> `gastos` e `saldo`, é só mostrar os três no topo da tela. Faça junto.

### 3. Item 2 — Progresso nos Hobbies

Em `src/hooks/useHobbies.ts`, uma mutação para trocar o status; em
`src/routes/hobbies.tsx`, um seletor com os três estados e uma etiqueta na
linha:

```tsx
const STATUS = {
  nao_iniciado: { rotulo: "Não iniciado", cor: "text-muted-foreground" },
  em_andamento: { rotulo: "Em andamento", cor: "text-gold" },
  concluido: { rotulo: "Concluído", cor: "text-magenta" },
} as const;
```

### 4. Item 3 — Metas por data

Campo de data opcional no hobby. Na tela, mostre quantos dias faltam usando
`date-fns`, que já está instalado:

```ts
import { differenceInCalendarDays, startOfToday } from "date-fns";
const dias = differenceInCalendarDays(new Date(meta), startOfToday());
```

Meta vencida e não concluída → destaque com `text-darkred`.

### 5. Item 4 — Treinos concluídos

**A tabela já existe.** Em `src/hooks/useTreino.ts`, adicione:

```ts
const registrarSessao = useMutation({
  mutationFn: (workoutId: string) =>
    sessionsRepo.insert({ workout_id: workoutId, performed_on: hoje() }),
  onSettled: () => qc.invalidateQueries({ queryKey: sessionsKey }),
});
```

Na tela, um botão **"Concluí este treino"** e um contador — "12 treinos neste
mês". Confira se `useRealtimeTable` já inclui `workout_sessions`; se não,
acrescente, seguindo o que já está no arquivo.

### 6. Item 6 — Categoria no Mercado

Campo de texto livre, com sugestão das categorias que a pessoa já usou:

```ts
const categoriasUsadas = [...new Set(itens.map((i) => i.category).filter(Boolean))];
```

Agrupe a lista por categoria na tela. Item sem categoria vai para "Outros".

### 7. Estados vazios

Combinados com a Esther, use exatamente estes textos:

| Área       | Mensagem                                                     |
| ---------- | ------------------------------------------------------------ |
| Hobbies    | Você ainda não adicionou nenhum hobby. Que tal começar?      |
| Mercado    | Sua lista está vazia. Adicione os itens que precisa comprar. |
| Financeiro | Você ainda não registrou nenhum gasto.                       |

### 8. Antes de cada Pull Request

```bash
npx tsc --noEmit
npm run lint
```

---

## Pronto quando

Para **cada** item de prioridade Alta: criar, editar, apagar, sair da conta,
entrar de novo, e o dado continuar lá. Mais:

1. Financeiro mostrando entradas, gastos e saldo corretos.
2. Hobby mudando de status e a etiqueta acompanhando.
3. Meta vencida aparecendo destacada.
4. Contador de treinos subindo ao registrar uma sessão.
5. Tudo funcionando no celular, em uma coluna.

---

## Erros comuns

| Sintoma                             | Causa                             | Solução                                  |
| ----------------------------------- | --------------------------------- | ---------------------------------------- |
| Soma de dinheiro dá texto grudado   | valor veio como texto             | `Number(l.amount)`                       |
| `column "is_income" does not exist` | migration não aplicada            | `git pull`; se persistir, chame a Esther |
| A tela não atualiza ao salvar       | faltou `invalidateQueries`        | siga o `onSettled` dos outros            |
| Centavos errados na soma            | arredondamento de ponto flutuante | arredonde só ao exibir                   |
