# Banco de dados — pare e chame a Esther

> **Regra única desta página:** ninguém aplica mudança no banco sozinho.
> Você **escreve** o arquivo; a **Esther aplica**.

---

## 1. Por que essa regra existe

O grupo usa **um único banco compartilhado**. Isso é ótimo — cada pessoa entra
com o próprio e-mail, vê só os próprios dados, e ninguém perde tempo
configurando seis vezes. Mas tem uma consequência:

> **O banco é a única coisa do projeto que não é sua cópia.** Se você errar num
> arquivo `.tsx`, quebra só a sua máquina e o Git desfaz. Se você aplicar um
> comando errado no banco, quebra para **as seis pessoas ao mesmo tempo** — e
> Git não desfaz banco.

Por isso o banco tem uma pessoa responsável. Não é desconfiança: é o mesmo
motivo pelo qual só uma pessoa mexe no disjuntor.

---

## 2. Onde você vai esbarrar nisso

No seu passo a passo existe um aviso assim:

> ### 🛑 PARE — checkpoint de banco
>
> Chame a Esther antes de continuar.

Ele aparece exatamente **uma vez** na maioria das tarefas: quando você precisa
de uma coluna ou tabela que ainda não existe.

Quem esbarra: **Lara** (coluna de tema), **Érika** (curso, período, tipo),
**Laysa** (prioridade, status, prazo), **Gabi** (colunas em 4 tabelas).
**Caio** e **Esther** provavelmente não precisam de nada novo no banco.

---

## 3. O que fazer quando chegar lá

### Passo 1 — Você escreve o arquivo (e só isso)

Crie o arquivo com **o nome que já está reservado para você**:

| Pessoa | Arquivo                                                  |
| ------ | -------------------------------------------------------- |
| Caio   | `supabase/migrations/20260923100000_caio_auth.sql`       |
| Lara   | `supabase/migrations/20260923110000_lara_tema.sql`       |
| Érika  | `supabase/migrations/20260923120000_erika_estudos.sql`   |
| Laysa  | `supabase/migrations/20260923130000_laysa_tarefas.sql`   |
| Gabi   | `supabase/migrations/20260923140000_gabi_categorias.sql` |

Dentro dele vai só o que muda. Sempre com `if not exists`, para poder rodar
duas vezes sem dar erro:

```sql
alter table public.tasks
  add column if not exists priority text not null default 'media';
```

O SQL sugerido para cada pessoa já está na sua ficha em
[DIVISAO-POR-PESSOA.md](DIVISAO-POR-PESSOA.md). Pode copiar de lá.

### Passo 2 — Chame a Esther

Mande a mensagem no grupo:

> _"Escrevi minha migration, pode aplicar?"_ — e diga o nome do arquivo.

**Não rode** `supabase db push`, `supabase db reset`, nem nada pelo painel do
Supabase.

### Passo 3 — A Esther aplica e avisa

Ela confere o arquivo, aplica no banco compartilhado, regenera os tipos do
TypeScript e avisa no grupo:

> _"Migration da Laysa aplicada. Rodem `git pull`."_

### Passo 4 — Você continua

```bash
git pull
```

A coluna nova já aparece com o tipo certo no TypeScript, e você segue o seu
passo a passo.

---

## 4. Enquanto você espera, não fique parado

O checkpoint não trava você. Dá para adiantar bastante:

- montar a tela com dados de mentira, escritos na mão;
- escrever a lógica no hook (ordenação, filtro, cálculo);
- deixar o Pull Request quase pronto.

Só o trecho que **lê ou grava a coluna nova** precisa esperar.

---

## 5. As três coisas que nunca se faz

| Nunca                                        | Por quê                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Rodar `supabase db push` por conta própria   | o banco é de todos                                                                               |
| Mexer em tabela pelo painel do Supabase      | a mudança não fica registrada em nenhum arquivo, e some no próximo `push`                        |
| **Editar uma migration que já foi aplicada** | quem já aplicou fica com o banco diferente do arquivo. Precisou mudar? **Crie um arquivo novo.** |

---

## 6. Deu erro de coluna que não existe

Mensagem parecida com:

```
column "priority" does not exist
```

Quase sempre significa que alguém aplicou uma migration e você ainda não
atualizou o código:

```bash
git pull
```

Se continuar, **avise no grupo** — provavelmente o banco e o repositório estão
fora de sincronia, e isso é da Esther resolver.

---

## 7. Para a Esther — o procedimento

Ao receber um pedido:

1. **Leia o arquivo antes de aplicar.** Procure por `drop`, `delete` e
   `truncate` — nada disso deve aparecer numa migration da Fase 2. Se aparecer,
   converse com a pessoa antes.
2. Aplique:
   ```bash
   git pull
   npx supabase db push
   ```
3. Regenere os tipos e suba num commit separado:
   ```bash
   npm run gen:types
   git add src/types/database.types.ts
   git commit -m "Regenera os tipos após a migration da <pessoa>"
   git push
   ```
4. Avise no grupo: _"migration da <pessoa> aplicada, rodem `git pull`"_.

> Fazer o `gen:types` num commit separado é o que mantém o arquivo
> `database.types.ts` fora da lista de conflitos de todo mundo.
