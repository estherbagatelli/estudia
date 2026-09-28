# Tecnologias — o que usar e o que não usar

Tudo neste projeto já está escolhido e instalado. **Ninguém precisa decidir
tecnologia, e ninguém deve instalar biblioteca nova** sem falar com o grupo.

---

## 1. As linguagens

| Linguagem                  | Onde você escreve                | Para quê                                         |
| -------------------------- | -------------------------------- | ------------------------------------------------ |
| **TypeScript**             | `src/hooks/`, `src/services/`    | a regra de negócio: cálculos, ordenação, filtros |
| **TSX** (TypeScript + JSX) | `src/routes/`, `src/components/` | as telas                                         |
| **SQL** (PostgreSQL)       | `supabase/migrations/`           | as tabelas e colunas do banco                    |
| **CSS**                    | `src/styles.css`                 | só as cores e os temas — o resto é Tailwind      |

TSX é TypeScript com HTML dentro. Se você sabe HTML e JavaScript, você já
consegue ler:

```tsx
<h2 className="text-gold">{materia.name}</h2>
```

É uma tag HTML normal, com `className` no lugar de `class`, e `{}` para colocar
valor de variável no meio.

---

## 2. As bibliotecas — quando usar cada uma

Todas já estão instaladas. Nenhuma precisa de `npm install`.

| Precisa de…                    | Use                       | Como                                      |
| ------------------------------ | ------------------------- | ----------------------------------------- |
| Buscar dados do banco          | **TanStack Query**        | `useQuery` — já pronto em cada hook       |
| Gravar no banco                | **TanStack Query**        | `useMutation` — siga o padrão do hook     |
| Criar uma tela nova            | **TanStack Router**       | crie o arquivo em `src/routes/`           |
| Estilizar                      | **Tailwind CSS**          | `className="flex gap-3 text-gold"`        |
| Ícone                          | **lucide-react**          | `import { Calendar } from "lucide-react"` |
| Mensagem de sucesso/erro       | **sonner**                | `toast.success("Salvo!")`                 |
| Conta de datas                 | **date-fns**              | `differenceInDays(prazo, hoje)`           |
| Botão, campo, caixa de seleção | **componentes prontos**   | `src/components/ui/`                      |
| Formulário com validação       | **react-hook-form + zod** | só se a tela for grande                   |
| Gráfico                        | **recharts**              | provavelmente você não precisa            |

### Componentes prontos — use antes de escrever do zero

A pasta `src/components/ui/` tem mais de 40 componentes prontos: `button`,
`input`, `select`, `checkbox`, `dialog`, `card`, `badge`, `tabs`, `calendar`,
`progress`, `switch`, `textarea`…

```tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

<Button onClick={salvar}>Salvar</Button>
<Badge>Prova</Badge>
```

**Nunca edite os arquivos dentro de `src/components/ui/`.** São biblioteca. Se
precisar de algo diferente, envolva o componente ou passe `className`.

---

## 3. O que NÃO usar

| Não use                                      | Por quê                                           | Use no lugar                                 |
| -------------------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| `npm install <qualquer coisa>`               | conflito no `package-lock.json` e peso no projeto | avise o grupo antes; provavelmente já existe |
| `fetch()` direto para o banco                | ignora as regras de acesso e o cache              | `repo("tabela")`                             |
| `useState` para guardar dado do banco        | o dado desaparece ao trocar de tela               | `useQuery`, dentro do hook                   |
| `localStorage` para dado do usuário          | fica só naquele navegador                         | banco, via hook                              |
| CSS em arquivo separado, `styled-components` | o projeto é Tailwind                              | `className`                                  |
| `any` no TypeScript                          | desliga justamente a checagem que evita bug       | o tipo certo, de `src/types/models.ts`       |
| Cor escrita na mão (`#e91e63`)               | não muda junto com o tema                         | token (`text-magenta`)                       |
| `<div onClick>` como botão                   | não funciona no teclado                           | `<Button>` ou `<button>`                     |

### Duas coisas diferentes que se confundem

|                 | Extensão do VS Code                     | Biblioteca do projeto                |
| --------------- | --------------------------------------- | ------------------------------------ |
| Onde mora       | só na **sua máquina**                   | dentro do projeto, no `package.json` |
| Quem é afetado  | só você                                 | **as seis pessoas**                  |
| Precisa avisar? | não                                     | **sim, sempre**                      |
| Exemplo         | ESLint, Prettier, Tailwind IntelliSense | React, date-fns, sonner              |

Instalar extensão do editor é livre e não causa conflito nenhum — as
recomendadas estão no [README](../README.md). **Instalar biblioteca no projeto
é outra história:** mexe no `package-lock.json`, que é de todo mundo.

### E sobre trocar de framework

O Estudia usa **React**. Angular, Vue e Svelte são **alternativas ao React**,
não complementos — não dá para somar dois. Trocar significaria reescrever as 8
telas e o login do zero, o que consumiria a Fase 2 inteira para chegar no mesmo
resultado. Se alguém sugerir, a resposta é essa.

> Vale a ressalva: **Angular usa TypeScript, mas TypeScript não precisa de
> Angular.** Este projeto já é TypeScript — 87 arquivos, mais de 90% do código.

---

## 4. As cores — a regra mais importante

O projeto tem nomes de cor próprios. Os 5 temas funcionam **trocando o valor
desses nomes**, então quem usa os nomes ganha os temas de graça.

| Token                        | Use para                     |
| ---------------------------- | ---------------------------- |
| `magenta`                    | destaque, borda ativa, ícone |
| `gold`                       | título de seção, divisória   |
| `wine`                       | fundo de item selecionado    |
| `pink`                       | borda de item ativo          |
| `silver`                     | texto em destaque            |
| `darkred`                    | alerta, atraso               |
| `foreground`                 | texto normal                 |
| `muted-foreground`           | texto secundário             |
| `background` `card` `border` | fundo, cartão, borda         |

Cada token funciona com qualquer prefixo do Tailwind:

```tsx
text-magenta    bg-magenta/20    border-gold    ring-pink
```

O `/20` no fim é transparência (20%). Muito usado para fundo suave.

> **O app é escuro.** Não existe tema claro — não tente escrever
> `dark:alguma-coisa`.

---

## 5. Comandos

| Comando            | Quando usar                                         |
| ------------------ | --------------------------------------------------- |
| `npm install`      | uma vez, ao clonar, e quando avisarem que mudou     |
| `npm run dev`      | sempre que for trabalhar — abre em `localhost:3000` |
| `npx tsc --noEmit` | **antes de todo Pull Request**                      |
| `npm run lint`     | **antes de todo Pull Request**                      |
| `npm run format`   | arruma a formatação sozinho                         |

Os comandos de banco (`supabase db push`, `gen:types`) **não são para você
rodar** — ver [BANCO-DE-DADOS.md](BANCO-DE-DADOS.md).

---

## 6. Se você nunca usou isso

Não precisa estudar tudo. O caminho mais rápido é:

1. Abra a tela mais parecida com a sua em `src/routes/` e o hook dela em
   `src/hooks/`.
2. Entenda **um** fluxo completo: um botão que adiciona alguma coisa.
3. Copie esse padrão para o que você precisa fazer.

`src/routes/mercado.tsx` (91 linhas) com `src/hooks/useShopping.ts` (64 linhas)
é o par mais simples do projeto — é o melhor lugar para começar a ler.

E o passo a passo da sua parte está em [passo-a-passo/](passo-a-passo/).
