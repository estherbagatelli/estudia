# Laysa — Tarefas e rotina acadêmica

**Pessoa 4 · Grupo 2 · Etapa 2 (dias 8–10)**

Leia antes: [TECNOLOGIAS.md](../TECNOLOGIAS.md), [ARQUITETURA.md](../ARQUITETURA.md)
e [GUIA-GIT.md](../GUIA-GIT.md).

> **Comece depois** que os temas da Lara estiverem no `main`.
> E **a migration da Érika entra antes da sua** — você reaproveita o tipo que
> ela cria.

---

## O que você entrega

1. Tarefa com **título, categoria, matéria (quando fizer sentido), data,
   prioridade e status**.
2. Lista **ordenada por prazo**, com as **atrasadas em destaque**.
3. Filtro **acadêmicas × pessoais**.
4. Marcar como concluída, editar, e ver as concluídas.
5. Os dados para a Início mostrar "Prova amanhã" e "2 tarefas pendentes".

**Não entra nesta fase:** calendário completo, notificações, lembrete por
e-mail, tarefa que se repete.

---

## O tamanho real do seu trabalho

A tabela hoje tem **só isto**:

```sql
tasks ( id, owner_id, title, is_done, completed_at, due_date, position )
```

E o hook `src/hooks/useTasks.ts` tem **62 linhas** que fazem três coisas:
adicionar, marcar e apagar.

A maior parte do seu trabalho é **lógica, não visual**: ordenação, cálculo de
atraso, urgência, filtros, e a função que transforma datas em frases. A tela
vem depois.

**Termina onde:** você entrega tudo funcionando, com os seis dados aparecendo.
A Esther, na Etapa 3, só uniformiza o **arranjo visual** da linha com o resto
do app.

---

## Antes de programar: meia hora com a Érika

Combinem e anotem em [DECISOES.md](../DECISOES.md):

1. **Os nomes dos 6 tipos** — você usa o mesmo tipo que ela cria no banco.
2. **Tarefa pode ficar sem data?** Hoje `due_date` é obrigatório. Tarefa
   pessoal sem prazo é comum, então provavelmente sim — e aí a sua migration
   precisa de uma linha a mais.
3. **Quem entra primeiro no banco.** Resposta: ela.

---

## Passo a passo

### 1. Ambiente e branch

```bash
git checkout main
git pull origin main
npm install
git checkout -b p4-laysa/prazo-prioridade-status
```

---

## 🛑 PARE — checkpoint de banco

Crie `supabase/migrations/20260923130000_laysa_tarefas.sql`:

```sql
do $$ begin
  create type tarefa_prioridade as enum ('baixa','media','alta');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tarefa_status as enum ('pendente','em_andamento','concluida');
exception when duplicate_object then null; end $$;

alter table public.tasks
  add column if not exists priority    tarefa_prioridade not null default 'media',
  add column if not exists status      tarefa_status     not null default 'pendente',
  add column if not exists kind        conteudo_tipo,
  add column if not exists is_academic boolean not null default false,
  add column if not exists track_id    uuid references public.study_tracks(id) on delete set null;

-- só se vocês decidirem que tarefa pode ficar sem data:
-- alter table public.tasks alter column due_date drop not null;

create index if not exists tasks_track_idx on public.tasks (track_id);
```

> `conteudo_tipo` é o tipo que a **Érika** cria. Se a migration dela ainda não
> entrou, a sua vai falhar — é por isso que a ordem importa.

**Não aplique.** Chame a Esther — ver [BANCO-DE-DADOS.md](../BANCO-DE-DADOS.md).

**Enquanto espera:** escreva toda a lógica do passo 2 com uma lista de tarefas
de mentira, escrita na mão. É a maior parte do seu trabalho e não depende do
banco.

---

### 2. Escreva a lógica no hook

Em `src/hooks/useTasks.ts`.

**Ordenação** — prazo mais próximo primeiro; empate, maior prioridade:

```ts
const PESO = { alta: 3, media: 2, baixa: 1 } as const;
const SEM_DATA = "9999-12-31";

const ordenadas = [...tarefas].sort((a, b) => {
  const d = (a.due_date ?? SEM_DATA).localeCompare(b.due_date ?? SEM_DATA);
  return d !== 0 ? d : PESO[b.priority] - PESO[a.priority];
});
```

> Data no banco é texto `AAAA-MM-DD`, então `localeCompare` já ordena certo —
> não precisa converter para `Date`.

**Atraso e urgência** — use `date-fns`, que já está instalado:

```ts
import { differenceInCalendarDays, startOfToday } from "date-fns";

function urgencia(due: string | null) {
  if (!due) return "neutro";
  const dias = differenceInCalendarDays(new Date(due), startOfToday());
  if (dias < 0) return "atrasada";
  if (dias <= 1) return "urgente"; // hoje ou amanhã
  if (dias <= 7) return "proxima";
  return "neutro";
}
```

**Filtros** — deixe a tela só escolher, sem calcular:

```ts
filtrar: (f: { academica?: boolean; status?: TarefaStatus }) => {
  /* … */
};
```

### 3. Exporte o gancho da página Início

**Isto é entrega sua.** É o que evita você e a Esther editarem o mesmo arquivo:

```ts
/** Consumido pela página Início (Esther). Não remova sem avisar. */
export function useProximosPrazos() {
  // devolve os 3 mais urgentes, com o texto pronto:
  //   [{ texto: "Prova amanhã", tarefa }, { texto: "Trabalho em 3 dias", tarefa }]
  // e o total de pendentes, para "2 tarefas pendentes"
}
```

A frase se monta a partir do tipo e dos dias:

```ts
function frase(tipo: string, dias: number) {
  const nome = { prova: "Prova", trabalho: "Trabalho", atividade: "Atividade" }[tipo] ?? "Tarefa";
  if (dias < 0) return `${nome} atrasada`;
  if (dias === 0) return `${nome} hoje`;
  if (dias === 1) return `${nome} amanhã`;
  return `${nome} em ${dias} dias`;
}
```

### 4. Reescreva a tela

`src/routes/tarefas.tsx` (84 linhas hoje) precisa de:

- formulário rápido — **só o título é obrigatório**, o resto é opcional;
- lista ordenada, com atrasadas em destaque;
- em cada linha: título · categoria · matéria · data · prioridade · status;
- botões de filtro: Todas / Acadêmicas / Pessoais;
- uma seção ou aba para as concluídas.

Cores por urgência, **sempre com token**:

| Urgência    | Token                             |
| ----------- | --------------------------------- |
| atrasada    | `text-darkred` + `border-darkred` |
| hoje/amanhã | `text-magenta`                    |
| até 7 dias  | `text-gold`                       |
| depois      | `text-muted-foreground`           |

Componentes prontos que servem: `Badge`, `Select`, `Checkbox`, `Input`,
`Button`, `Tabs`.

### 5. Estado vazio

**"Você não possui tarefas pendentes."**

### 6. Antes do Pull Request

```bash
npx tsc --noEmit
npm run lint
```

---

## Pronto quando

1. Criar tarefa só com o título.
2. Criar tarefa com prazo, prioridade, categoria e matéria.
3. Criar uma com data de ontem e ela aparecer destacada como atrasada.
4. A lista sair ordenada por prazo, com empate resolvido pela prioridade.
5. Filtrar acadêmicas e pessoais.
6. Concluir uma tarefa e encontrá-la nas concluídas.
7. Ligar uma tarefa a uma matéria da Érika e ver o nome da matéria.
8. Funcionar no celular.

---

## Erros comuns

| Sintoma                               | Causa                                    | Solução                                  |
| ------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| `type "conteudo_tipo" does not exist` | a migration da Érika ainda não entrou    | espere a dela                            |
| A ordenação erra por um dia           | converteu texto para `Date` com fuso     | compare o texto direto                   |
| `Invalid time value`                  | `due_date` nulo chegando no `new Date()` | trate o nulo antes                       |
| A tarefa some ao concluir             | o filtro esconde concluída               | é esperado — mostre na aba de concluídas |
