# Como o Estudia funciona por dentro

Escrito para quem vai mexer no código pela primeira vez. Não é documentação
completa — é o mínimo para você conseguir fazer a sua parte sem quebrar a dos
outros.

---

## 1. As peças

| Peça                | O que é                                                | Onde aprender                                  |
| ------------------- | ------------------------------------------------------ | ---------------------------------------------- |
| **React 19**        | monta a interface                                      | já conhecido                                   |
| **TanStack Router** | decide qual tela aparece em cada endereço              | cada arquivo em `src/routes/` vira uma rota    |
| **TanStack Query**  | busca os dados e guarda em cache                       | `useQuery` para ler, `useMutation` para gravar |
| **Tailwind 4**      | as classes de estilo (`text-magenta`, `flex`, `gap-3`) | as cores vêm de `src/styles.css`               |
| **Supabase**        | banco de dados + login                                 | PostgreSQL com regras de acesso por usuário    |
| **Vite**            | roda o projeto na sua máquina                          | `npm run dev`                                  |

---

## 2. Onde fica cada coisa

```
src/
├── routes/          uma tela por arquivo. index.tsx = "/", estudos.tsx = "/estudos"
│   └── __root.tsx   o "molde" de todas as telas: login, temas, mensagens
├── components/
│   ├── AppShell.tsx   menu lateral + menu do celular + cabeçalho
│   ├── auth/          telas de login
│   └── ui/            botões, campos, cards (biblioteca pronta — não edite)
├── hooks/           um arquivo por área: useEstudos, useTasks, useTreino...
├── repositories/    conversa com o banco (você quase nunca mexe aqui)
├── contexts/        estado global: quem está logado
├── types/           models.ts (nomes amigáveis) e database.types.ts (gerado)
└── styles.css       cores, fontes, o tema

supabase/
└── migrations/      as mudanças do banco, em ordem de data
```

**Regra prática:** se você está mexendo numa tela, vai precisar de dois
arquivos — `src/routes/<sua-area>.tsx` e `src/hooks/use<SuaArea>.ts`.

---

## 3. O caminho de um dado, do banco até a tela

Exemplo real: a lista de matérias na aba Estudos.

```
    Tabela study_tracks no Supabase
              ↓
    repo("study_tracks").list()          ← src/repositories/base.repository.ts
              ↓
    useQuery({ queryKey, queryFn })      ← src/hooks/useEstudos.ts
              ↓
    const estudos = useEstudos()         ← src/routes/estudos.tsx
              ↓
    <h2>{track.name}</h2>
```

São sempre esses quatro degraus. Se você entender este, entendeu todas as oito
telas — elas seguem exatamente o mesmo formato.

### O repositório

`repo("nome_da_tabela")` devolve as operações básicas, já com os tipos certos:

```ts
const tracksRepo = repo("study_tracks");

await tracksRepo.list("position", true); // ler tudo, ordenado
await tracksRepo.listWhere("track_id", id); // ler filtrando
await tracksRepo.insert({ name: "Banco de Dados" });
await tracksRepo.update(id, { name: "BD II" });
await tracksRepo.remove(id);
```

**Você nunca passa quem é o dono.** O banco preenche o `owner_id` sozinho e as
regras de acesso garantem que você só enxerga as suas linhas. É por isso que
duas pessoas logadas no mesmo banco não veem os dados uma da outra.

### O hook

O hook é onde mora a regra. Ele lê, grava e entrega para a tela algo pronto de
usar. O formato para gravar é sempre este:

```ts
const addTopic = useMutation({
  mutationFn: (v: { trackId: string; title: string }) =>
    topicsRepo.insert({ track_id: v.trackId, title: v.title, position: 0 }),
  onSettled: () => qc.invalidateQueries({ queryKey: topicsKey }),
});
```

O `onSettled` é o que faz a tela se atualizar sozinha depois de gravar.

### Atualização em tempo real

Cada hook chama `useRealtimeTable("nome_da_tabela", userId, [chave])`. É o que
faz a tela mudar sozinha se você editar algo no celular com o computador
aberto. **Se você criar uma tabela nova, não esqueça de incluí-la** — senão a
tela só atualiza ao recarregar.

---

## 4. Receita: adicionar uma coluna no banco

Este é o caminho que quase todo mundo vai percorrer na Fase 2.

**1. Crie a migration** com o número reservado para você
(ver [CONFLITOS.md](CONFLITOS.md) seção 3):

```sql
-- supabase/migrations/20260923130000_laysa_tarefas.sql
alter table public.tasks
  add column if not exists priority text not null default 'media';
```

**2. Aplique no banco:**

```bash
npx supabase db push
```

**3. Regenere os tipos** (é o que faz o TypeScript conhecer a coluna nova):

```bash
npm run gen:types
```

**4. Use no código.** A coluna já aparece com o tipo certo:

```ts
await tasksRepo.update(id, { priority: "alta" });
```

**5. Avise no grupo:** _"subi migration nova, rodem `npx supabase db push`"_.

> Sem o passo 3, o TypeScript reclama que a coluna não existe. Sem o passo 5,
> a próxima pessoa que puxar o código vai ter erro de coluna inexistente.

---

## 5. Receita: criar uma tela nova

1. Crie `src/routes/minha-tela.tsx`.
2. Comece copiando uma tela que já existe — `src/routes/mercado.tsx` é a mais
   simples de todas.
3. Envolva o conteúdo em `<AppShell title="..." subtitle="...">`.
4. Rode `npm run dev`: o arquivo `src/routeTree.gen.ts` é atualizado sozinho.
5. Para aparecer no menu, a rota precisa entrar na lista `NAV` do
   `AppShell.tsx` — **e esse arquivo é da Esther.** Peça para ela.

---

## 6. As cores — a regra mais importante do projeto

O app tem nomes de cor próprios, definidos em `src/styles.css`:

| Token                             | Use para                        |
| --------------------------------- | ------------------------------- |
| `magenta`                         | destaque, borda ativa, ícone    |
| `gold`                            | título de seção, divisória      |
| `wine`                            | fundo de item selecionado       |
| `pink`                            | borda de item ativo             |
| `silver`                          | texto em destaque               |
| `darkred`                         | alerta                          |
| `foreground` / `muted-foreground` | texto normal / texto secundário |
| `background` / `card` / `border`  | fundo, cartão, borda            |

Use sempre assim:

```tsx
<h2 className="text-gold">Matérias</h2>
<span className="text-magenta border-pink">Prova</span>
```

**Nunca assim:**

```tsx
<h2 style={{ color: "#e91e63" }}>Matérias</h2>
<span className="text-[oklch(0.55_0.12_190)]">Prova</span>
```

O motivo é simples: os 5 temas funcionam trocando o **valor** desses nomes. Cor
escrita na mão não muda de tema — sua tela fica rosa enquanto o resto do app
fica azul, e alguém vai ter que refazer.

---

## 7. Mensagens de sucesso e erro

Já está tudo montado. Uma linha:

```ts
import { toast } from "sonner";

toast.success("Adicionado com sucesso!");
toast.error("Não foi possível salvar.");
```

---

## 8. Comandos que você vai usar

| Comando                | O que faz                                 |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | sobe o projeto em `http://localhost:3000` |
| `npx tsc --noEmit`     | confere se o TypeScript está sem erro     |
| `npm run lint`         | confere o padrão de código                |
| `npm run format`       | arruma a formatação sozinho               |
| `npx supabase db push` | aplica as migrations no banco             |
| `npm run gen:types`    | regenera os tipos a partir do banco       |

Antes de abrir um Pull Request, rode os dois do meio.
