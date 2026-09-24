# Lara — Temas e personalização

**Pessoa 2 · Grupo 1 · Etapa 1 (dias 6–7)**

Leia antes: [TECNOLOGIAS.md](../TECNOLOGIAS.md) e [GUIA-GIT.md](../GUIA-GIT.md).

> **A sua entrega é a que mais gente depende.** Érika, Laysa e Gabi só começam
> com segurança depois que os temas existirem. Por isso você está na Etapa 1 —
> e por isso vale entregar a versão simples antes de caprichar.

---

## O que você entrega

1. Seletor com **5 temas**: Rosa (o atual), Verde-água, Roxo, Azul e Vermelho.
2. O tema **continua aplicado** ao navegar entre as abas e ao recarregar.
3. O tema fica salvo **no perfil do usuário**, não só no navegador.
4. As 29 cores escritas na mão viram token.

**Não entra nesta fase:** a roda de cores livre da pesquisa, escolha de fonte,
mudança de layout, avatar. A roda é um extra — só se sobrar tempo no fim.

---

## Comece sabendo disto

O app inteiro já usa **nomes de cor**, 217 vezes: `text-magenta`,
`border-gold`, `bg-wine`… Esses nomes viram variáveis CSS no bloco `:root` do
arquivo `src/styles.css`:

```css
:root {
  --magenta: oklch(0.65 0.27 5);
  --gold: oklch(0.9 0.012 250);
  --wine: oklch(0.42 0.18 8);
  --pink: oklch(0.58 0.24 5);
  --darkred: oklch(0.36 0.14 12);
  --silver: oklch(0.9 0.012 250);
}
```

> **O truque é não trocar os nomes — trocar só os valores.** Como todas as telas
> já usam `text-magenta`, elas mudam de cor sozinhas. **Você não precisa abrir a
> tela de ninguém.**

### Entendendo o `oklch`

```
oklch(0.65   0.27        5)
      claro  intensidade matiz(cor)
      0 a 1  0 a ~0.4    0 a 360
```

Para criar um tema, mude **só o terceiro número** e mantenha os outros dois
parecidos. É isso que garante que o texto continue legível sem você testar
contraste um por um.

| Tema         | Matiz aproximada |
| ------------ | ---------------- |
| Rosa (atual) | 5                |
| Vermelho     | 25               |
| Roxo         | 300              |
| Azul         | 260              |
| Verde-água   | 190              |

---

## Passo a passo

### 1. Ambiente e branch

```bash
npm install
npm run dev
git checkout -b p2-lara/cinco-temas
```

### 2. Escreva os 5 temas no CSS

No fim de `src/styles.css`, depois do `:root`, adicione um bloco por tema:

```css
/* === TEMAS (Lara) — não mexer sem falar comigo === */

:root[data-tema="vermelho"] {
  --magenta: oklch(0.62 0.24 25);
  --pink: oklch(0.56 0.21 25);
  --wine: oklch(0.4 0.16 28);
  --darkred: oklch(0.34 0.13 30);
}

:root[data-tema="roxo"] {
  --magenta: oklch(0.6 0.22 300);
  /* … */
}
```

O tema Rosa é o `:root` que já existe — não precisa de bloco.

> `gold` e `silver` hoje têm o **mesmo valor** e são quase brancos. Eles servem
> de texto claro em quase toda tela. Se você mudar muito, o texto some. Mexa
> pouco neles.

### 3. Teste antes de escrever qualquer código

Abra o site, aperte **F12** → aba **Console** e cole:

```js
document.documentElement.dataset.tema = "roxo";
```

Se o app inteiro mudar de cor, **o mais difícil já acabou**. Teste os cinco
assim antes de continuar.

### 4. Troque as 29 cores escritas na mão

Enquanto existirem, os fundos com gradiente não mudam de tema. Para achar:

```bash
grep -rn -E "oklch\(|#[0-9a-fA-F]{6}" src/routes src/components --include=*.tsx
```

Troque cada uma pela variável:

```tsx
// antes
"radial-gradient(60% 40% at 15% 10%, oklch(0.34 0.10 15 / 0.18), transparent 60%)";

// depois
"radial-gradient(60% 40% at 15% 10%, var(--wine), transparent 60%)";
```

> **Exceção:** `src/components/AppShell.tsx` é da Esther. Faça esse arquivo num
> Pull Request separado e pequeno, e avise ela.

---

## 🛑 PARE — checkpoint de banco

Você precisa de uma coluna nova no perfil. **Escreva o arquivo, não aplique.**

Crie `supabase/migrations/20260923110000_lara_tema.sql`:

```sql
alter table public.profiles
  add column if not exists theme text not null default 'rosa';
```

Agora **chame a Esther** no grupo: _"escrevi minha migration, pode aplicar?"_

Leia [BANCO-DE-DADOS.md](../BANCO-DE-DADOS.md) — explica por que é assim e o
que fazer enquanto espera. **Você não fica parada:** dá para fazer os passos 5
e 6 usando só o navegador para guardar, e trocar para o perfil depois.

---

### 5. Crie o contexto de tema

Crie `src/contexts/ThemeContext.tsx`. Ele faz três coisas:

1. lê o tema do perfil quando o usuário entra;
2. escreve `document.documentElement.dataset.tema = tema`;
3. grava no perfil quando o usuário troca.

```tsx
const TEMAS = ["rosa", "verde-agua", "roxo", "azul", "vermelho"] as const;
export type Tema = (typeof TEMAS)[number];
```

Para ler e gravar o perfil, siga o padrão dos outros hooks — use
`repo("profiles")`, como em [ARQUITETURA.md](../ARQUITETURA.md).

Guarde também no `localStorage`: assim o tema certo já aparece no primeiro
instante, antes de o perfil carregar, e a tela não "pisca" de cor.

### 6. Crie o seletor

Crie `src/components/ThemeSelector.tsx` — cinco bolinhas coloridas, a atual com
borda destacada. Ao clicar, troca e mostra o aviso:

```tsx
import { toast } from "sonner";
toast.success("Tema atualizado.");
```

### 7. Encaixe o seletor no menu

O seletor precisa aparecer em `src/components/AppShell.tsx`, **que é da
Esther**. Combine com ela: o combinado é que ela deixa um espaço reservado e
você só encaixa o seu componente ali.

### 8. Antes do Pull Request

```bash
npx tsc --noEmit
npm run lint
```

---

## Pronto quando

1. Trocar o tema e as **8 telas** mudarem de cor — inclusive os fundos.
2. Recarregar a página e o tema continuar.
3. Navegar entre as abas sem o tema voltar ao rosa.
4. Sair, entrar com outra conta, e essa conta ter o tema dela.
5. **Nenhum texto ficar ilegível em nenhum dos 5 temas** — confira tela por
   tela.
6. Funcionar no celular.

---

## Erros comuns

| Sintoma                            | Causa                                          | Solução                           |
| ---------------------------------- | ---------------------------------------------- | --------------------------------- |
| Só uma parte da tela muda          | ainda tem cor escrita na mão                   | rode o `grep` do passo 4          |
| O tema volta ao rosa ao recarregar | não está lendo do perfil nem do `localStorage` | passo 5                           |
| Texto some no tema escuro          | mexeu demais em `gold`/`silver`                | volte perto do valor original     |
| A cor não muda com `data-tema`     | erro de escrita no seletor CSS                 | confira `:root[data-tema="roxo"]` |
