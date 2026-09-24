# Esther — UX/UI e Landing Page

**Pessoa 6 · Grupo 3 · Etapas 1 e 3**

Leia antes: [TECNOLOGIAS.md](../TECNOLOGIAS.md) e [BANCO-DE-DADOS.md](../BANCO-DE-DADOS.md).

> Seu trabalho é dividido em **dois momentos**, porque a segunda parte encosta
> no arquivo de todo mundo. Além disso, você é a responsável pelo banco: é você
> quem aplica as migrations dos outros.

---

# Parte A — Etapa 1 (dias 6–7)

Arquivos novos ou só seus, então não conflita com ninguém.

## O que entrega

1. **Landing Page** em `/`.
2. Página inicial do planner movida de `/` para `/inicio`.
3. Landing liberada do login.
4. **Menu compacto no celular**, mantendo as 8 categorias.

## Passo a passo

### 1. Branch

```bash
git checkout -b p6-esther/landing-e-menu
```

### 2. A Landing

Crie `src/routes/landing.tsx` com exatamente o conteúdo definido:

- **Estudia — Seu semestre, no seu ritmo.**
- Organize seus estudos e sua rotina em um só lugar.
- Botão **Criar minha conta** → `/cadastro`
- Botão **Entrar** → `/entrar`

**Não coloque** depoimentos, preços, explicação longa nem funcionalidade nova.

O fundo com gradiente do `AuthScreen.tsx` serve de base — mas use as variáveis
de cor, não `oklch` escrito na mão, senão a landing não acompanha o tema.

### 3. Mova a Início

Renomeie `src/routes/index.tsx` para `src/routes/inicio.tsx` e faça a landing
virar a rota `/`. Depois atualize a lista `NAV` em
`src/components/AppShell.tsx`: o item "Início" passa a apontar para `/inicio`.

```bash
npm run dev    # o routeTree.gen.ts se atualiza sozinho
```

### 4. Libere a landing do login

Hoje `src/routes/__root.tsx` põe tudo atrás do `<RequireAuth>`. A landing e as
telas do Caio (`/entrar`, `/cadastro`, `/auth/reset`) precisam ficar de fora.

```tsx
const PUBLICAS = ["/", "/entrar", "/cadastro", "/auth/reset"];
const publica = PUBLICAS.includes(pathname);

{
  publica ? (
    <Outlet />
  ) : (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}
```

> **Este arquivo é seu, e só seu.** Se o Caio disser que a tela dele cai no
> login, é aqui que se resolve.

### 5. Menu do celular

Em `AppShell.tsx`, o menu de baixo hoje é uma barra que rola de lado. Troque
por um menu compacto — **as 8 categorias continuam**, nenhuma sai. O
componente `Sheet` (`src/components/ui/sheet.tsx`) já está pronto para isso:
botão de menu abre uma gaveta com a lista.

### 6. Reserve o espaço da Lara

O seletor de temas dela precisa morar aqui. Deixe marcado:

```tsx
{
  /* SLOT: seletor de tema (Lara) — não remover */
}
```

E avise ela onde ficou.

---

# Parte B — Etapa 3 (dias 10–11)

Só comece depois que Grupo 2 e Gabi entregarem.

## O que entrega

1. **Início**: "Olá, [Nome]!" e os cards na ordem **1º Próximos prazos**,
   **2º Estudos**, **3º Rotina** (Treino e Dieta de hoje).
2. **Estados vazios** em todas as áreas.
3. **Mensagens de sucesso** nas ações.
4. **Acabamento visual** de Estudos e Tarefas.
5. **Padronização** de botões e cards, e **responsividade**.

## Passo a passo

### 1. A Início

Você **não calcula nada**. Érika e Laysa entregam os ganchos prontos:

```tsx
import { useResumoEstudos } from "@/hooks/useEstudos";
import { useProximosPrazos } from "@/hooks/useTasks";
```

O nome vem do perfil (a Lara já terá criado esse acesso). A ordem dos cards é a
do relatório: prazos primeiro, estudos, rotina.

> Se algum gancho não existir ou não devolver o que você precisa, **peça para a
> dona** — não vá editar o arquivo dela.

### 2. Estados vazios

| Área       | Mensagem                                                     |
| ---------- | ------------------------------------------------------------ |
| Hobbies    | Você ainda não adicionou nenhum hobby. Que tal começar?      |
| Mercado    | Sua lista está vazia. Adicione os itens que precisa comprar. |
| Tarefas    | Você não possui tarefas pendentes.                           |
| Estudos    | Você ainda não adicionou nenhuma matéria.                    |
| Financeiro | Você ainda não registrou nenhum gasto.                       |

Vale criar um componente único, `src/components/EstadoVazio.tsx`, e usá-lo nas
cinco telas — é o que garante que fiquem iguais.

> Como o preenchimento automático foi desligado, uma conta nova **realmente**
> começa vazia. Crie uma conta nova de teste para ver esses estados.

### 3. Mensagens de sucesso

O `<Toaster />` já está montado no `__root.tsx`. É uma linha:

```ts
import { toast } from "sonner";
toast.success("Adicionado com sucesso!");
```

Os quatro textos: **Adicionado com sucesso!** · **Tarefa concluída!** ·
**Item removido.** · **Tema atualizado.**

### 4. Acabamento de Estudos e Tarefas

Este é o **único ponto do projeto** em que você edita arquivo de outra pessoa.
Três regras:

1. **Só visual** — classe, espaçamento, ordem dos elementos. Nada de lógica.
2. **Um Pull Request por arquivo**, pequeno.
3. **A dona do arquivo é a revisora** — não o rodízio normal.

O alvo, em Tarefas: `Trabalho de Banco de Dados · Acadêmica · Banco de Dados ·
24/09 · Alta · Pendente`. Em Estudos: card de matéria com nome + progresso, e
os 6 tipos com etiqueta padronizada.

### 5. Padronização e responsividade

Cores, tipografia e identidade **continuam as mesmas** — o relatório diz para
não redesenhar. Padronize apenas botões, etiquetas, cards, mensagens, estados
vazios e espaçamentos.

No celular: uma coluna, nada cortado, nada passando da tela, campo ocupando a
largura. Teste com F12 → ícone de celular, em 360px de largura.

---

# A sua outra função: responsável pelo banco

Quando alguém avisar que escreveu uma migration:

1. **Leia o arquivo antes de aplicar.** Procure por `drop`, `delete` e
   `truncate` — nada disso deve aparecer na Fase 2.
2. Aplique:
   ```bash
   git pull
   npx supabase db push
   ```
3. Regenere os tipos, **em um commit separado**:
   ```bash
   npm run gen:types
   git add src/types/database.types.ts
   git commit -m "Regenera os tipos após a migration da <pessoa>"
   git push
   ```
4. Avise: _"migration da <pessoa> aplicada, rodem `git pull`"_.

**A ordem importa:** a da Érika entra antes da Laysa, porque a coluna `kind`
dela usa o tipo que a Érika cria.

O commit separado no passo 3 é o que mantém o `database.types.ts` fora da lista
de conflitos das outras cinco pessoas.

---

## Pronto quando

O checklist do seu relatório estiver inteiro: landing conectada ao fluxo, nome
do usuário aparecendo, prazos no topo, resumo de estudos, 8 categorias no menu
do celular, estados vazios em todas as áreas, feedback em todas as ações, e
nenhum texto cortado no celular.

---

## Erros comuns

| Sintoma                      | Causa                            | Solução                  |
| ---------------------------- | -------------------------------- | ------------------------ |
| A landing pede login         | faltou a lista de rotas públicas | passo A4                 |
| `/inicio` dá 404             | o `routeTree.gen.ts` não regerou | `npm run dev`            |
| O menu some no celular       | `Sheet` sem o gatilho visível    | confira o botão de abrir |
| O gancho da Érika não existe | ela ainda não entregou           | espere — ou peça         |
