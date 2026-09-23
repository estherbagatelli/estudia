# Divisão por pessoa — Fase 2

Seis pessoas, seis escopos fechados. Cada ficha abaixo tem sempre as mesmas
seções:

- **Entrega** — o que precisa estar funcionando no fim.
- **Não entra nesta fase** — o que deixar para a Fase 3 (protege o prazo).
- **Arquivos seus** — você edita à vontade, sem pedir nada a ninguém.
- **Arquivos proibidos** — se precisar mexer, abra uma issue para o dono.
- **Sua migration** — o número já está reservado para você.
- **Como fazer** — o caminho técnico no código que já existe.
- **Pronto quando** — o critério objetivo de conclusão.

A ordem em que essas fichas são executadas está em
[PLANO-FASE-2.md](PLANO-FASE-2.md).

| Pessoa | Nome   | Área                                        | Etapa |
| ------ | ------ | ------------------------------------------- | ----- |
| 1      | Caio   | Login e Cadastro                            | 1     |
| 2      | Lara   | Temas e personalização                      | 1     |
| 3      | Érika  | Aba Estudos                                 | 2     |
| 4      | Laysa  | Aba Tarefas e rotina acadêmica              | 2     |
| 5      | Gabi   | Hobbies, Treino, Mercado, Dieta, Financeiro | 2     |
| 6      | Esther | UX/UI e Landing Page                        | 1 e 3 |

---

## Pessoa 1 — Caio · Login e Cadastro

### Entrega

- Tela de **Login**: e-mail + senha.
- Tela de **Cadastro**: nome completo, e-mail, senha, confirmar senha.
- Botão **Sair** funcionando (já existe no menu — só precisa continuar
  funcionando com as telas novas).
- O nome digitado no cadastro precisa chegar no perfil do usuário.

### Não entra nesta fase

Login com Google, recuperação de senha elaborada, autenticação de dois fatores,
confirmação de e-mail com código. O PDF pede login **básico e funcional**.

### Arquivos seus

```
src/components/auth/          (a pasta inteira)
src/routes/entrar.tsx         (criar)
src/routes/cadastro.tsx       (criar)
src/routes/auth.reset.tsx
src/contexts/AuthContext.tsx
src/services/auth.service.ts
```

### Arquivos proibidos

| Arquivo                 | Dono   | Por quê                                                                    |
| ----------------------- | ------ | -------------------------------------------------------------------------- |
| `src/routes/__root.tsx` | Esther | é onde o login protege o app; ela ajusta na Etapa 1 para liberar a landing |
| `src/styles.css`        | Lara   | os temas moram lá                                                          |

### Sua migration

`supabase/migrations/20260923100000_caio_auth.sql` — **provavelmente você não
vai precisar dela.** A tabela `profiles` e a autenticação já existem. Só crie o
arquivo se descobrir que falta alguma coluna.

### Como fazer

**A parte difícil já está pronta.** O arquivo `src/services/auth.service.ts` já
tem tudo:

```ts
authService.signUp(email, password, fullName); // criar conta
authService.signInWithPassword(email, password); // entrar
authService.signOut(); // sair
```

E tem um detalhe que economiza muito trabalho: existe um gatilho no banco
(`handle_new_user`, na migration do schema) que, quando alguém se cadastra,
copia automaticamente o `full_name` para `profiles.display_name`. Ou seja:

> Se você passar o nome em `signUp(email, senha, nome)`, **o nome já aparece no
> perfil sozinho.** Não precisa escrever nada a mais para isso.

Seu trabalho de verdade é a **interface**: hoje existe uma tela só
(`src/components/auth/AuthScreen.tsx`) que pede apenas o e-mail e manda um link
mágico. Você vai:

1. Criar `src/routes/entrar.tsx` e `src/routes/cadastro.tsx` como rotas
   públicas (nomes já acordados no contrato de rotas).
2. Quebrar a `AuthScreen` em dois formulários dentro de `src/components/auth/`.
3. Conferir em `src/contexts/AuthContext.tsx` se tudo que você precisa está
   exposto para os componentes; se faltar, você pode adicionar — o arquivo é
   seu.
4. Manter o link mágico como alternativa (já funciona, não jogue fora).

O visual pode seguir as telas do relatório do seu grupo: metade colorida com a
frase "Seu semestre, no seu ritmo", metade com o formulário.

### Pronto quando

1. Criar conta com nome, e-mail e senha.
2. Sair.
3. Entrar de novo com e-mail e senha.
4. Conferir no painel do Supabase que `profiles.display_name` tem o nome certo.
5. Recarregar a página logado e continuar logado.

---

## Pessoa 2 — Lara · Temas e personalização

> Sua entrega é a que mais gente depende. Por isso ela está na Etapa 1.

### Entrega

- Seletor com **5 temas**: Rosa (atual), Verde-água, Roxo, Azul, Vermelho.
- O tema escolhido **continua aplicado** ao navegar e ao recarregar.
- O tema fica salvo no perfil do usuário (não só no navegador).
- Nome do usuário disponível para as outras telas usarem.

### Não entra nesta fase

Temas infinitos, seletor de cor livre (roda de cores), escolha de fonte,
mudança de layout, avatar.

> O relatório do seu grupo propôs uma **roda de cores** interativa. Ela é mais
> trabalhosa e o PDF pede "aproximadamente 5 temas". **Faça os 5 temas
> primeiro.** Se sobrar tempo no fim, a roda entra como extra — mas ela não
> pode atrasar as Etapas 2 e 3, que dependem de você.

### Arquivos seus

```
src/styles.css                     (o bloco de temas)
src/contexts/ThemeContext.tsx      (criar)
src/components/ThemeSelector.tsx   (criar)
src/hooks/useProfile.ts            (criar)
```

### Arquivos proibidos

| Arquivo                       | Dono   | Por quê                                                                                                |
| ----------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| `src/components/AppShell.tsx` | Esther | ela deixa um espaço reservado para o seu seletor entrar — veja [CONFLITOS.md](CONFLITOS.md) risco nº 8 |
| `src/components/auth/`        | Caio   | telas de login                                                                                         |

### Sua migration

`supabase/migrations/20260923110000_lara_tema.sql`

```sql
alter table public.profiles
  add column if not exists theme text not null default 'rosa';
```

### Como fazer

**O segredo é não trocar os nomes das cores.** O app inteiro já usa nomes
semânticos, 217 vezes:

| Token     | Onde aparece                     |
| --------- | -------------------------------- |
| `magenta` | destaques, bordas ativas, ícones |
| `gold`    | títulos de seção, divisórias     |
| `wine`    | fundo do item selecionado        |
| `pink`    | borda do item ativo              |
| `silver`  | texto de destaque                |
| `darkred` | alertas                          |

Esses nomes viram variáveis CSS em `src/styles.css`, dentro do bloco `:root`.
Um tema é só **um bloco que redefine os valores dessas variáveis**:

```css
:root[data-tema="verde-agua"] {
  --magenta: oklch(0.55 0.12 190);
  --gold: oklch(0.75 0.1 170);
  --wine: oklch(0.3 0.08 195);
  --pink: oklch(0.65 0.11 185);
  --darkred: oklch(0.45 0.13 200);
}
```

Como todas as telas usam `text-magenta` e `border-gold`, **elas mudam de cor
sozinhas**. Você não precisa tocar em nenhuma tela das outras pessoas.

Depois é só um contexto React que:

1. lê `profiles.theme` quando o usuário entra;
2. escreve `document.documentElement.dataset.tema = tema`;
3. salva no perfil quando o usuário troca.

**Tem uma limpeza no caminho:** existem hoje **29 cores escritas na mão**
(`oklch(...)` direto no JSX) em 11 arquivos — são os fundos com gradiente do
`AppShell.tsx`, da `AuthScreen.tsx` e das telas. Enquanto elas existirem, esses
fundos não mudam de tema. Trocar essas 29 por variáveis faz parte da sua
entrega. Para achar todas:

```bash
grep -rn -E "oklch\(|#[0-9a-fA-F]{6}" src/routes src/components --include=*.tsx
```

> Exceção: `AppShell.tsx` é da Esther. Mande a lista das linhas para ela ou
> combine de você fazer só esse arquivo num Pull Request separado e pequeno.

Para a legibilidade: ao escolher as cores de cada tema, mantenha o mesmo
**terceiro número** do `oklch` variando e o **primeiro** (luminosidade) parecido
com o do tema rosa. É isso que garante que o texto continue legível sem você
testar contraste um por um.

### Pronto quando

1. Trocar o tema e as 8 telas mudarem de cor — inclusive os fundos.
2. Recarregar a página e o tema continuar.
3. Sair, entrar com outra conta, e essa conta ter o tema dela.
4. Nenhum texto ficar ilegível em nenhum dos 5 temas.

---

## Pessoa 3 — Érika · Aba Estudos

### Entrega

- Usuário informa **curso** e **período/semestre**.
- Usuário **cria, edita e remove matérias** (o nome basta; o resto é opcional).
- Cada conteúdo de uma matéria tem um **tipo**: conteúdo, estudo, revisão,
  atividade, trabalho ou prova — cada um já aparecendo com etiqueta própria.
- **Progresso por matéria**: "Banco de Dados — 7/10 conteúdos — 70%".

> **Onde a sua parte termina e a da Esther começa.** O relatório de UX/UI diz:
> _"A estrutura funcional será definida pela Pessoa 3. Na parte de UX/UI,
> apresentar as informações de forma clara."_ Na prática:
>
> - **Você (Etapa 2):** cria o dado, o cálculo do progresso e uma tela que
>   funciona — com a etiqueta de cada tipo já visível, ainda que simples.
> - **Esther (Etapa 3):** padroniza o visual do card de matéria e das etiquetas
>   para ficarem iguais aos das outras telas.
>
> Ou seja: **não capriche no acabamento**, porque ele vai ser refeito de
> propósito. Capriche em o dado estar certo.

### Não entra nesta fase

Plataforma de aulas, upload de PDF, vídeo, chat, professores. Metas de estudo
por semana ficam para o fim, se sobrar tempo. E a **padronização visual final**
dos cards e etiquetas, que é da Esther na Etapa 3.

### Arquivos seus

```
src/routes/estudos.tsx
src/hooks/useEstudos.ts
```

### Arquivos proibidos

| Arquivo                         | Dono   | Por quê                                                                                  |
| ------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| `src/routes/index.tsx` (Início) | Esther | você **não** edita a Início. Você exporta `useResumoEstudos()` do seu hook e ela consome |
| `src/routes/tarefas.tsx`        | Laysa  | mesmo assunto, arquivo dela                                                              |
| `src/styles.css`                | Lara   | temas                                                                                    |

### Sua migration

`supabase/migrations/20260923120000_erika_estudos.sql`

```sql
-- curso e período
alter table public.study_tracks
  add column if not exists course text,
  add column if not exists period text,
  add column if not exists color  text;

-- tipo e status do conteúdo
create type conteudo_tipo as enum
  ('conteudo','estudo','revisao','atividade','trabalho','prova');

alter table public.study_topics
  add column if not exists kind conteudo_tipo not null default 'conteudo';
```

> Os nomes `conteudo`, `estudo`, `revisao`, `atividade`, `trabalho`, `prova`
> **fazem parte do contrato com a Laysa**. Não mude sozinha.

### Como fazer

**Boa notícia: metade do caminho já foi andado.** No código antigo as matérias
eram uma lista fixa escrita dentro do arquivo:

```ts
const FACULDADE = ["Informática Básica — Sistemas Operacionais", ...];
```

Isso já saiu. Hoje existem duas tabelas de verdade:

| Tabela         | É o quê                | Colunas úteis                              |
| -------------- | ---------------------- | ------------------------------------------ |
| `study_tracks` | a matéria              | `name`, `subtitle`, `position`             |
| `study_topics` | o conteúdo dentro dela | `title`, `is_done`, `track_id`, `position` |

E o hook `src/hooks/useEstudos.ts` já entrega `addTopic`, `toggleTopic`,
`editTopic`, `removeTopic`. **Você parte daí.**

O que falta no hook: criar, editar e apagar **matéria** (hoje só dá para mexer
nos conteúdos). Siga o padrão que já está lá — `useMutation` do React Query +
`repo("study_tracks")`. Está explicado em [ARQUITETURA.md](ARQUITETURA.md).

Para o progresso, calcule no hook e exponha pronto:

```ts
progressoDe: (trackId: string) => {
  const t = topics.filter((x) => x.track_id === trackId);
  const feitos = t.filter((x) => x.is_done).length;
  return { feitos, total: t.length, pct: t.length ? Math.round((feitos / t.length) * 100) : 0 };
};
```

E exporte também o resumo que a Esther vai usar na Início — **assim ela nunca
precisa abrir o seu arquivo**:

```ts
export function useResumoEstudos() {
  // devolve algo como:
  // [{ materia: "Banco de Dados", feitos: 7, total: 10, pct: 70 }, ...]
}
```

Para os 6 tipos, use etiquetas com os tokens de cor da Lara (`text-magenta`,
`border-gold`, ...) e um ícone do `lucide-react`, que já está instalado. **Não
crie uma tela por tipo** — é a mesma lista, com etiquetas diferentes.

### Pronto quando

1. Criar uma matéria nova com curso e período.
2. Adicionar conteúdos de tipos diferentes e ver a diferença visual.
3. Marcar alguns como concluídos e ver "7/10 — 70%".
4. Editar e apagar uma matéria.
5. Sair e entrar de novo: tudo continua lá.

---

## Pessoa 4 — Laysa · Tarefas e rotina acadêmica

### Entrega

- Tarefa com **título, categoria, matéria (quando fizer sentido), data,
  prioridade e status**.
- Lista **ordenada por prazo**, com as **atrasadas em destaque**.
- Filtro **acadêmicas × pessoais**.
- Marcar como concluída, editar, e ver as concluídas.
- Os dados que a página Início precisa para "Prova amanhã", "Trabalho em 3
  dias", "2 tarefas pendentes".

> **Onde a sua parte termina e a da Esther começa.** Vale o mesmo combinado da
> Érika: você entrega a tela **funcionando**, com todos os campos visíveis;
> a Esther padroniza o visual da linha de tarefa na Etapa 3, para chegar no
> formato do relatório dela —
> _"Trabalho de Banco de Dados · Acadêmica · Banco de Dados · 24/09 · Alta ·
> Pendente"_.
>
> Garanta que **os seis dados existam e estejam certos**. O arranjo visual
> final não é seu.

### Não entra nesta fase

Calendário completo, notificações, lembretes por e-mail, tarefas recorrentes. E
a padronização visual final da linha de tarefa, que é da Esther na Etapa 3.

### Arquivos seus

```
src/routes/tarefas.tsx
src/hooks/useTasks.ts
```

### Arquivos proibidos

| Arquivo                         | Dono   | Por quê                                          |
| ------------------------------- | ------ | ------------------------------------------------ |
| `src/routes/index.tsx` (Início) | Esther | você entrega `useProximosPrazos()` e ela consome |
| `src/routes/estudos.tsx`        | Érika  | arquivo dela                                     |
| `src/styles.css`                | Lara   | temas                                            |

### Sua migration

`supabase/migrations/20260923130000_laysa_tarefas.sql`

```sql
create type tarefa_prioridade as enum ('baixa','media','alta');
create type tarefa_status     as enum ('pendente','em_andamento','concluida');

alter table public.tasks
  add column if not exists priority    tarefa_prioridade not null default 'media',
  add column if not exists status      tarefa_status     not null default 'pendente',
  add column if not exists kind        conteudo_tipo,
  add column if not exists is_academic boolean not null default false,
  add column if not exists track_id    uuid references public.study_tracks(id) on delete set null;

create index if not exists tasks_track_idx on public.tasks (track_id);
```

> Repare que `kind` usa o **mesmo tipo** criado pela Érika. É isso que faz o
> vocabulário do sistema ser um só. Por isso a migration dela roda antes da
> sua — combine a ordem de merge com ela.

### Como fazer

A tabela `tasks` já existe com `title`, `is_done`, `due_date`, `completed_at` e
`position`. O hook `src/hooks/useTasks.ts` já faz adicionar, marcar e remover.
Você acrescenta os campos novos.

**Um ponto do contrato para resolver com a Érika:** hoje `due_date` é
obrigatório (`not null default current_date`). Uma tarefa pessoal sem prazo é
comum. Se vocês decidirem permitir tarefa sem data, a migration precisa de:

```sql
alter table public.tasks alter column due_date drop not null;
```

Decidam isso **antes** de programar e anotem em [DECISOES.md](DECISOES.md).

Para a ordenação, faça no hook e entregue a lista já pronta para a tela:

```ts
// prazo mais próximo primeiro; empate resolve pela prioridade
const ordenadas = [...tarefas].sort((a, b) => {
  const d = (a.due_date ?? "9999-12-31").localeCompare(b.due_date ?? "9999-12-31");
  return d !== 0 ? d : PESO[b.priority] - PESO[a.priority];
});
```

Para a urgência, use a regra do seu relatório: vermelho para hoje/amanhã,
amarelo até 7 dias, neutro depois — mas **com os tokens da Lara**, nunca com cor
escrita na mão. A biblioteca `date-fns` já está instalada para calcular os dias.

E exporte o gancho da Início:

```ts
export function useProximosPrazos() {
  // devolve os 3 itens mais urgentes, já com o texto pronto:
  // [{ texto: "Prova amanhã", tarefa }, { texto: "Trabalho em 3 dias", tarefa }]
  // e o total de pendentes, para "2 tarefas pendentes"
}
```

### Pronto quando

1. Criar tarefa com prazo, prioridade e categoria.
2. Criar uma com data de ontem e ver que ela aparece destacada como atrasada.
3. Filtrar acadêmicas e pessoais.
4. Concluir uma tarefa e encontrá-la nas concluídas.
5. Ligar uma tarefa a uma matéria criada pela Érika e ver o nome da matéria.

---

## Pessoa 5 — Gabi · Hobbies, Treino, Mercado, Dieta e Financeiro

> Você tem o escopo mais independente do projeto: **nenhum outro integrante
> encosta nos seus arquivos durante a Fase 2 inteira.** Pode começar assim que
> os temas da Lara entrarem.

### Entrega — na ordem de prioridade do seu próprio relatório

| #   | Área       | Item                                                           | Prioridade (sua) |
| --- | ---------- | -------------------------------------------------------------- | ---------------- |
| 1   | Financeiro | incluir **entrada** (bolsa, estágio, mesada)                   | Alta             |
| 2   | Hobbies    | **progresso**: não iniciado, em andamento, concluído           | Alta             |
| 3   | Hobbies    | **metas por data**                                             | Alta             |
| 4   | Treino     | **dado de treinos concluídos**                                 | Alta             |
| 5   | Financeiro | total de entradas e de gastos, independente de categoria       | Média            |
| 6   | Mercado    | **categoria** do item (padaria, limpeza…), criada pelo usuário | Média            |
| 7   | Hobbies    | subcategorias: gêneros e tipos                                 | Média            |
| 8   | Treino     | tempo de descanso                                              | Média            |
| 9   | Hobbies    | classificação por estrelas                                     | Baixa            |

**Faça os 4 de prioridade Alta primeiro.** Os Médios entram se sobrar tempo; os
Baixos ficam para a Fase 3 sem culpa nenhuma.

Sobre **Dieta**: seu relatório concluiu que não havia melhoria notória para o
contexto estudantil. Concordo — na Fase 2 a Dieta só recebe o padrão visual
(que é trabalho da Esther). **Você não precisa mexer nela.**

### Não entra nesta fase

Aplicativo de nutrição, contagem de macronutrientes, integração com balança,
gráfico de evolução de carga, metas financeiras com projeção.

### Arquivos seus

```
src/routes/hobbies.tsx      src/hooks/useHobbies.ts
src/routes/treino.tsx       src/hooks/useTreino.ts
src/routes/mercado.tsx      src/hooks/useShopping.ts
src/routes/dieta.tsx        src/hooks/useDieta.ts
src/routes/financeiro.tsx   src/hooks/useFinanceiro.ts
```

### Arquivos proibidos

`src/routes/index.tsx`, `src/styles.css`, `src/components/AppShell.tsx` — e os
arquivos de Estudos e Tarefas.

### Sua migration

`supabase/migrations/20260923140000_gabi_categorias.sql`

```sql
-- 1. Financeiro: entradas
alter table public.finance_expenses
  add column if not exists is_income boolean not null default false;

-- 2 e 3. Hobbies: progresso e meta
create type hobby_status as enum ('nao_iniciado','em_andamento','concluido');
alter table public.hobby_items
  add column if not exists status   hobby_status not null default 'nao_iniciado',
  add column if not exists goal_date date,
  add column if not exists rating   smallint,
  add column if not exists genre    text;

-- 6. Mercado: categoria
alter table public.shopping_items
  add column if not exists category text;

-- 8. Treino: descanso
alter table public.workout_exercises
  add column if not exists rest_seconds smallint;
```

### Como fazer

**Um aviso que economiza o seu tempo:** o item 4 (**dado de treinos
concluídos**) já tem o banco pronto. A tabela `workout_sessions` existe desde a
refatoração, com `performed_on` e `owner_id`. Você só precisa da interface —
registrar a sessão e mostrar a contagem. Não crie tabela nova.

Da mesma forma, em Hobbies os campos de **temporada** e **episódio** já existem
e já aparecem na tela. O que falta é o **status** e a **meta por data**.

Para o item 1 (entradas no Financeiro), a coluna `is_income` é o caminho mais
curto: uma entrada é um lançamento com `is_income = true`. Aí o total é uma
conta só:

```ts
const entradas = lancamentos.filter((l) => l.is_income).reduce((s, l) => s + l.amount, 0);
const gastos = lancamentos.filter((l) => !l.is_income).reduce((s, l) => s + l.amount, 0);
```

Cada uma das 5 telas já tem um hook próprio (`useHobbies`, `useTreino`, …) no
padrão explicado em [ARQUITETURA.md](ARQUITETURA.md). Você adiciona campo por
campo, sempre no mesmo formato.

### Pronto quando

Para cada um dos 4 itens de prioridade Alta: criar, editar, apagar, sair da
conta, entrar de novo e o dado continuar lá.

---

## Pessoa 6 — Esther · UX/UI e Landing Page

> Seu trabalho é dividido em **duas partes, em momentos diferentes**, porque a
> segunda encosta no arquivo de todo mundo.

### Parte A — Etapa 1 (junto com o Grupo 1)

Arquivos novos ou só seus, então não conflita com ninguém:

- **Landing Page** em `/`: "Estudia — Seu semestre, no seu ritmo.", "Organize
  seus estudos e sua rotina em um só lugar.", botão **Criar minha conta** e
  botão **Entrar**. Sem depoimentos, sem preços, sem explicação longa.
- Mover a página inicial do planner de `/` para `/inicio` e ajustar o menu.
- Liberar a landing do login em `src/routes/__root.tsx`.
- **Menu compacto no celular**, mantendo as 8 categorias.

### Parte B — Etapa 3 (depois que Grupo 2 e Gabi entregarem)

- **Início**: "Olá, [Nome]!" com o nome do perfil; cards na ordem
  **1º Próximos prazos**, **2º Estudos**, **3º Rotina** (Treino e Dieta de
  hoje).
- **Estados vazios** — os textos já estão definidos:

  | Área       | Mensagem                                                     |
  | ---------- | ------------------------------------------------------------ |
  | Hobbies    | Você ainda não adicionou nenhum hobby. Que tal começar?      |
  | Mercado    | Sua lista está vazia. Adicione os itens que precisa comprar. |
  | Tarefas    | Você não possui tarefas pendentes.                           |
  | Estudos    | Você ainda não adicionou nenhuma matéria.                    |
  | Financeiro | Você ainda não registrou nenhum gasto.                       |

- **Mensagens de sucesso**: "Adicionado com sucesso!", "Tarefa concluída!",
  "Item removido.", "Tema atualizado."
- **Ajuste visual da aba Estudos** (item 4 do seu relatório): padronizar o card
  de matéria — nome + progresso, no formato "Banco de Dados — 7/10 conteúdos —
  70%" — e dar identidade visual distinta aos seis tipos (Conteúdo, Estudo,
  Revisão, Atividade, Trabalho, Prova) por etiqueta ou ícone. **Sem criar tela
  separada por tipo.**
- **Ajuste visual da aba Tarefas** (item 5): deixar cada tarefa no formato
  "Trabalho de Banco de Dados · Acadêmica · Banco de Dados · 24/09 · Alta ·
  Pendente", com as atrasadas em destaque.
- **Padronização** de botões, etiquetas, cards e espaçamentos.
- **Responsividade**: uma coluna no celular, nada cortado, nada fora da tela.

> Os dois ajustes visuais acima acontecem **depois** que Érika e Laysa
> entregarem. Elas montam a tela funcionando com todos os campos; você dá o
> acabamento e faz Estudos e Tarefas ficarem visualmente iguais ao resto do
> app. Combine com cada uma **antes de abrir o Pull Request** — é o risco nº 11
> em [CONFLITOS.md](CONFLITOS.md).

### Não entra nesta fase

Redesenhar o sistema, trocar a tipografia, mudar a identidade visual, criar
telas novas além da Landing.

### Arquivos seus

```
src/routes/landing.tsx       (criar)
src/routes/inicio.tsx        (renomear de index.tsx)
src/routes/__root.tsx
src/components/AppShell.tsx
```

Na Parte B você encosta nos arquivos das outras pessoas para estados vazios e
padronização — **por isso ela é a última etapa**, e por isso esses ajustes vão
em **Pull Requests pequenos, um por área**, para a revisão ser fácil.

### Como fazer

Duas coisas já estão prontas e poupam bastante trabalho:

1. **As mensagens de sucesso são uma linha.** O `sonner` já está instalado e o
   `<Toaster />` já está montado no `__root.tsx`:

   ```ts
   import { toast } from "sonner";
   toast.success("Adicionado com sucesso!");
   ```

2. **Os estados vazios já são alcançáveis.** O preenchimento automático de
   dados de exemplo foi desligado na fundação justamente para isso — uma conta
   nova começa vazia de verdade. Ver [DECISOES.md](DECISOES.md), decisão 4.

Para a Início, lembre que você **não vai calcular nada**: Érika entrega
`useResumoEstudos()` e Laysa entrega `useProximosPrazos()`. Você só monta os
cards com o que elas devolvem.

### Pronto quando

O checklist do seu relatório estiver inteiro: landing conectada ao fluxo, nome
do usuário aparecendo, prazos no topo, resumo de estudos, 8 categorias no menu
do celular, estados vazios em todas as áreas, feedback em todas as ações, e
nenhum texto cortado no celular.
