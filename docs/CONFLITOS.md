# Análise de divergência — o que pode dar errado e como contornar

> Seis pessoas, seis máquinas, um código. Conflito **vai** acontecer — isso é
> normal e não é sinal de que alguém errou. O que estraga um projeto não é o
> conflito: é resolver conflito no chute, sobrescrevendo o trabalho de alguém
> sem perceber.
>
> Este documento tem três partes: **por que** acontece, **o mapa de risco**
> deste projeto em específico, e a **receita de cada caso**.

---

## 1. Por que conflito acontece

Só existem três causas, e elas pedem tratamentos diferentes:

| Causa                                    | Exemplo aqui                                         | Gravidade                                             |
| ---------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| **Duas pessoas editaram o mesmo trecho** | Lara e Esther mexendo no `styles.css`                | média — o Git avisa, dá para resolver com calma       |
| **Arquivo gerado automaticamente**       | `routeTree.gen.ts`, `database.types.ts`              | baixa — parece assustador, resolve em 10 segundos     |
| **O banco divergiu do código**           | Érika criou uma coluna, Laysa está com o banco velho | **alta** — o Git não avisa, o app simplesmente quebra |

A terceira é a perigosa, porque não aparece como conflito. Aparece como "na
minha máquina funciona".

---

## 2. Mapa de risco deste projeto

Foram levantados os pontos em que duas pessoas realmente encostam na mesma
coisa durante a Fase 2. São dez. Para cada um já existe uma regra decidida.

| #   | Onde                                         | Quem se cruza            | Por quê                                            | Regra                                                                                                                |
| --- | -------------------------------------------- | ------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | `src/styles.css`                             | Lara × Esther            | Lara define os temas, Esther padroniza componentes | **Lara entra primeiro.** O arquivo tem seções marcadas por comentário; cada uma mexe só na sua                       |
| 2   | `src/routes/index.tsx` (Início)              | Esther × Érika × Laysa   | a Início mostra dados de Estudos e Tarefas         | **Érika e Laysa não abrem esse arquivo.** Elas exportam `useResumoEstudos()` e `useProximosPrazos()`; Esther consome |
| 3   | `src/routes/__root.tsx`                      | Caio × Esther            | login protege o app × landing precisa ser pública  | **Esther é a dona.** Caio pede a mudança por issue                                                                   |
| 4   | `supabase/migrations/`                       | todos                    | duas migrations mexendo na mesma tabela            | números **pré-alocados** (ver seção 3). Nunca editar migration já enviada                                            |
| 5   | `src/types/database.types.ts`                | todos                    | arquivo gerado a partir do banco                   | **ninguém edita na mão.** Esther regenera depois de cada migration entrar                                            |
| 6   | `src/routeTree.gen.ts`                       | Caio × Esther            | gerado toda vez que alguém cria uma rota           | conflito? apaga e regenera. Receita 4.2                                                                              |
| 7   | `package-lock.json`                          | quem instalar biblioteca | lockfile gigante                                   | **evite instalar coisa nova.** Se precisar, avise no grupo antes. Receita 4.3                                        |
| 8   | `src/components/AppShell.tsx`                | Esther × Lara            | menu × botão de trocar tema                        | Esther deixa um espaço reservado e comentado; Lara encaixa o componente dela ali                                     |
| 9   | Vocabulário acadêmico (`prova`, `trabalho`…) | Érika × Laysa            | o mesmo conceito nas duas áreas                    | **um contrato escrito antes de programar**, registrado em [DECISOES.md](DECISOES.md)                                 |
| 10  | Quebra de linha (CRLF × LF)                  | Windows × Mac            | o Git enxerga o arquivo inteiro como alterado      | já resolvido no `.gitattributes` da fundação — **ninguém precisa fazer nada**                                        |

> O nº 10 já mordeu este projeto: antes da correção, o lint acusava **5.266
> erros**, dos quais 4.914 eram só quebra de linha. Se alguém desfizer o
> `.gitattributes`, o problema volta inteiro.

---

## 3. Números de migration já reservados

Cada pessoa tem o seu. Assim duas migrations nunca disputam a mesma posição.

| Pessoa | Arquivo                                                      |
| ------ | ------------------------------------------------------------ |
| Caio   | `20260923100000_caio_auth.sql` _(provavelmente nem precisa)_ |
| Lara   | `20260923110000_lara_tema.sql`                               |
| Érika  | `20260923120000_erika_estudos.sql`                           |
| Laysa  | `20260923130000_laysa_tarefas.sql`                           |
| Gabi   | `20260923140000_gabi_categorias.sql`                         |

Três regras, e elas não têm exceção:

1. **Migration é só para frente.** Precisou mudar? Cria um arquivo novo. Nunca
   edita um que já foi para o `main`.
2. **Quem faz migration avisa no grupo** assim que ela entra, com a frase:
   _"subi migration nova, rodem `npx supabase db push`"_.
3. **Laysa depende da Érika** (a coluna `kind` usa o tipo que a Érika cria).
   A migration da Érika entra primeiro. As duas combinam o dia.

---

## 4. Receitas — o que fazer quando acontecer

### 4.0 Antes de tudo: o conflito não é urgente

Ninguém perde trabalho num conflito de merge. O Git guarda as duas versões. Se
travar, dá para desfazer tudo e voltar ao ponto anterior:

```bash
git merge --abort      # cancela o merge em andamento
git rebase --abort     # cancela o rebase em andamento
```

Você volta exatamente para onde estava. **Nada é perdido.**

### 4.1 Conflito em código normal (`.tsx`, `.ts`)

O Git marca assim:

```
<<<<<<< HEAD
  <h2 className="text-gold">Matérias</h2>
=======
  <h2 className="text-magenta">Minhas matérias</h2>
>>>>>>> main
```

- Em cima: o seu.
- Embaixo: o que já está no `main`.

**Não escolha no chute.** Pergunte: _as duas mudanças querem coisas diferentes
ou a mesma coisa?_

- Coisas diferentes → **fique com as duas**, apagando só as linhas `<<<<`,
  `====` e `>>>>`.
- A mesma coisa de dois jeitos → **chame a pessoa que escreveu o outro lado.**
  Trinta segundos de conversa valem mais que meia hora adivinhando.

Depois:

```bash
npx tsc --noEmit    # ainda compila?
npm run dev         # ainda abre?
git add <arquivo>
git commit
```

### 4.2 Conflito em `src/routeTree.gen.ts`

Esse arquivo é **gerado pelo TanStack Router**. Nunca vale a pena resolver na
mão:

```bash
rm src/routeTree.gen.ts
npm run dev          # ele é recriado sozinho ao subir o servidor
# confira que o arquivo voltou, depois:
git add src/routeTree.gen.ts
```

### 4.3 Conflito em `package-lock.json`

Também não se resolve na mão:

```bash
git checkout --theirs package-lock.json
npm install
git add package-lock.json
```

### 4.4 Conflito em `src/types/database.types.ts`

Arquivo gerado a partir do banco. Regenere em vez de resolver:

```bash
npm run gen:types
git add src/types/database.types.ts
```

Se o comando falhar (CLI do Supabase não configurada), **peça para a Esther
regenerar** — ela é a responsável por esse arquivo.

### 4.5 Conflito em `src/styles.css`

O arquivo é dividido em seções marcadas por comentário. Se o conflito estiver
em seções diferentes, **fique com os dois lados**. Se estiver na mesma seção,
vale a regra da seção 2: **quem é dono daquela seção decide** — Lara nos temas,
Esther nos componentes.

### 4.6 "Na minha máquina funciona" — o banco divergiu

Sintoma: erro do tipo `column "priority" does not exist`, ou uma tela que abre
vazia sem motivo.

Causa: alguém subiu migration e você não aplicou.

```bash
git pull
npx supabase db push
npm run gen:types
```

> Se vocês estiverem usando **um banco Supabase compartilhado**, a migration já
> está aplicada — nesse caso o problema é o contrário: alguém aplicou uma
> migration sem subir o arquivo para o repositório. Peça para a pessoa subir.

### 4.7 O `main` quebrou

Acontece. O CI existe justamente para isso não durar muito.

1. **Avise no grupo primeiro.** Todo mundo para de fazer `pull` até resolver.
2. Ache o Pull Request que quebrou (o último que entrou).
3. Desfaça ele — **sem apagar histórico**:

   ```bash
   git revert -m 1 <hash-do-merge>
   ```

4. A pessoa conserta com calma na branch dela e reabre o PR.

**Nunca** conserte o `main` com `git reset --hard` + `git push --force`. Isso
apaga o trabalho de quem já tinha puxado.

### 4.8 Alguém perdeu trabalho

Quase sempre ele ainda está lá:

```bash
git reflog              # lista tudo que aconteceu, inclusive o que "sumiu"
git checkout <hash>     # volta para aquele ponto e confere
```

Se o trabalho nunca foi commitado, aí não tem como recuperar — por isso a regra
do [GUIA-GIT.md](GUIA-GIT.md): **commit todo dia, mesmo inacabado**.

---

## 5. As seis regras que evitam quase tudo

1. **`main` é sagrada.** Ninguém faz commit direto nela. Tudo entra por Pull
   Request.
2. **Uma branch por tarefa, e ela vive poucos dias.** Branch parada duas
   semanas vira conflito garantido.
3. **`git pull origin main` todo dia de manhã**, antes de escrever qualquer
   linha.
4. **Respeite a lista de arquivos proibidos** da sua ficha em
   [DIVISAO-POR-PESSOA.md](DIVISAO-POR-PESSOA.md). É dela que vem 90% da paz.
5. **Nunca escreva cor na mão.** Só tokens (`text-magenta`, `border-gold`…).
   Cor escrita na mão não muda de tema e vira retrabalho.
6. **Avisou no grupo, não é problema; não avisou, é.** Migration nova,
   biblioteca nova e mudança em arquivo compartilhado sempre vêm com aviso.

---

## 6. O que nunca fazer

| Nunca                                                   | Por quê                                              |
| ------------------------------------------------------- | ---------------------------------------------------- |
| `git push --force` no `main`                            | apaga o trabalho de quem já puxou                    |
| `git commit` direto no `main`                           | pula a revisão e o CI                                |
| Editar migration que já entrou no `main`                | o banco de quem já aplicou fica diferente do arquivo |
| Editar `database.types.ts` ou `routeTree.gen.ts` na mão | são gerados; sua edição some na próxima geração      |
| Resolver conflito escolhendo um lado sem ler o outro    | é assim que trabalho some sem ninguém perceber       |
| Subir o arquivo `.env`                                  | ele tem as chaves do banco e o repositório é público |

> O `.env` já está no `.gitignore`. Só não force.
