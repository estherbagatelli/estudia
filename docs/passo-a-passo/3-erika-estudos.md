# Érika — Aba Estudos

**Pessoa 3 · Grupo 2 · Etapa 2 (dias 8–10)**

Leia antes: [TECNOLOGIAS.md](../TECNOLOGIAS.md), [ARQUITETURA.md](../ARQUITETURA.md)
e [GUIA-GIT.md](../GUIA-GIT.md).

> **Comece depois** que os temas da Lara estiverem no `main` — senão você
> escreve cor na mão sem querer e vai ter que refazer.

---

## O que você entrega

1. Usuário informa **curso** e **período/semestre**.
2. Usuário **cria, edita e remove matérias** — só o nome é obrigatório.
3. Cada conteúdo tem um **tipo**: conteúdo, estudo, revisão, atividade,
   trabalho ou prova, cada um com etiqueta própria.
4. **Progresso por matéria**: "Banco de Dados — 7/10 conteúdos — 70%".

**Não entra nesta fase:** plataforma de aulas, upload de PDF, vídeo, chat,
professores. Meta de estudo por semana fica para o fim, se sobrar tempo.

---

## Onde a sua parte começa e termina

**Já existe** (use como modelo, não precisa refazer):

| Tabela         | O que guarda                                            |
| -------------- | ------------------------------------------------------- |
| `study_tracks` | a matéria — `name`, `subtitle`, `position`              |
| `study_topics` | o conteúdo dentro dela — `title`, `is_done`, `track_id` |

E o hook `src/hooks/useEstudos.ts` já tem `addTopic`, `toggleTopic`,
`editTopic` e `removeTopic` funcionando.

**É seu:**

- as colunas de curso, período e tipo, no banco;
- criar, editar e remover **matéria** (hoje só dá para mexer nos conteúdos);
- o cálculo de progresso;
- reescrever a tela.

**Termina onde:** você entrega tudo funcionando, com as etiquetas dos 6 tipos
já aparecendo. A Esther, na Etapa 3, mexe só nos **últimos 5%** — espaçamento,
cor e tamanho da etiqueta — para Estudos ficar igual às outras telas.

---

## Antes de programar: meia hora com a Laysa

As palavras **prova**, **trabalho** e **atividade** aparecem no seu relatório e
no dela. Se cada uma criar a sua lista, o sistema fica com dois vocabulários e
a página Início não consegue juntar as duas coisas.

Decidam juntas e anotem em [DECISOES.md](../DECISOES.md):

1. **Os nomes exatos dos 6 tipos.** Sugestão já usada nos documentos:
   `conteudo`, `estudo`, `revisao`, `atividade`, `trabalho`, `prova` — sem
   acento e sem maiúscula, que é o padrão do banco.
2. **Quem cria o tipo no banco.** Sugestão: você, porque a sua migration entra
   primeiro; a dela só reaproveita.
3. **Tarefa pode ficar sem data?** Afeta a migration dela.

---

## Passo a passo

### 1. Ambiente e branch

```bash
git checkout main
git pull origin main        # precisa já ter os temas da Lara
npm install
git checkout -b p3-erika/estudos
```

---

## 🛑 PARE — checkpoint de banco

Crie `supabase/migrations/20260923120000_erika_estudos.sql`:

```sql
-- curso, período e cor da matéria
alter table public.study_tracks
  add column if not exists course text,
  add column if not exists period text,
  add column if not exists color  text;

-- os 6 tipos de conteúdo (nome combinado com a Laysa)
do $$ begin
  create type conteudo_tipo as enum
    ('conteudo','estudo','revisao','atividade','trabalho','prova');
exception when duplicate_object then null;
end $$;

alter table public.study_topics
  add column if not exists kind conteudo_tipo not null default 'conteudo';
```

**Não aplique.** Chame a Esther no grupo — ver
[BANCO-DE-DADOS.md](../BANCO-DE-DADOS.md).

**Enquanto espera:** faça os passos 2 e 3 com dados de mentira escritos na mão.
Dá para adiantar quase tudo.

---

### 2. Complete o hook

Abra `src/hooks/useEstudos.ts`. Falta o CRUD de **matéria**. Copie o formato
que já está lá para os conteúdos:

```ts
const addTrack = useMutation({
  mutationFn: (v: { name: string; course?: string; period?: string }) => {
    const position = tracks.reduce((m, t) => Math.max(m, t.position), -1) + 1;
    return tracksRepo.insert({ name: v.name, course: v.course, period: v.period, position });
  },
  onSettled: () => qc.invalidateQueries({ queryKey: tracksKey }),
});
```

Faça o mesmo para `editTrack` e `removeTrack`, e devolva as três no `return`
do hook, no mesmo padrão dos outros.

### 3. Calcule o progresso no hook

O cálculo é seu, não da tela. Exponha pronto:

```ts
progressoDe: (trackId: string) => {
  const t = topics.filter((x) => x.track_id === trackId);
  const feitos = t.filter((x) => x.is_done).length;
  return {
    feitos,
    total: t.length,
    pct: t.length ? Math.round((feitos / t.length) * 100) : 0,
  };
},
```

### 4. Exporte o resumo para a página Início

**Isto é uma entrega sua**, e é o que evita que você e a Esther briguem pelo
mesmo arquivo. No fim de `useEstudos.ts`:

```ts
/** Consumido pela página Início (Esther). Não remova sem avisar. */
export function useResumoEstudos() {
  const { tracks, topicsOf } = useEstudos();
  return tracks.map((t) => {
    const lista = topicsOf(t.id);
    const feitos = lista.filter((x) => x.is_done).length;
    return {
      materia: t.name,
      feitos,
      total: lista.length,
      pct: lista.length ? Math.round((feitos / lista.length) * 100) : 0,
    };
  });
}
```

### 5. Reescreva a tela

Em `src/routes/estudos.tsx` (210 linhas hoje):

- formulário para criar matéria — nome obrigatório, curso e período opcionais;
- card por matéria com o progresso: `Banco de Dados — 7/10 conteúdos — 70%`;
- dentro do card, a lista de conteúdos, cada um com a etiqueta do tipo;
- ao adicionar conteúdo, um seletor com os 6 tipos.

Para o progresso use o componente pronto:

```tsx
import { Progress } from "@/components/ui/progress";
<Progress value={pct} />;
```

Para as etiquetas, `Badge` + um ícone do `lucide-react`. Uma tabela só,
resolvendo tudo:

```tsx
const TIPOS = {
  conteudo: { rotulo: "Conteúdo", cor: "text-silver" },
  estudo: { rotulo: "Estudo", cor: "text-gold" },
  revisao: { rotulo: "Revisão", cor: "text-gold" },
  atividade: { rotulo: "Atividade", cor: "text-pink" },
  trabalho: { rotulo: "Trabalho", cor: "text-magenta" },
  prova: { rotulo: "Prova", cor: "text-darkred" },
} as const;
```

> **Não crie uma tela por tipo.** É a mesma lista, com etiquetas diferentes.

**Só tokens de cor** — nunca `#hex` nem `oklch()`.

### 6. Estado vazio

Se não houver matéria, mostre: **"Você ainda não adicionou nenhuma matéria."**
O texto é esse, combinado com a Esther.

### 7. Antes do Pull Request

```bash
npx tsc --noEmit
npm run lint
```

---

## Pronto quando

1. Criar uma matéria com curso e período.
2. Editar o nome dela e apagar outra.
3. Adicionar conteúdos de tipos diferentes e ver a diferença visual.
4. Marcar alguns como concluídos e o progresso mudar para "7/10 — 70%".
5. Sair da conta, entrar de novo, e tudo continuar lá.
6. Com a conta vazia, aparecer a mensagem de estado vazio.
7. Funcionar no celular.

---

## Erros comuns

| Sintoma                          | Causa                                    | Solução                                  |
| -------------------------------- | ---------------------------------------- | ---------------------------------------- |
| `column "kind" does not exist`   | a migration ainda não foi aplicada       | `git pull`; se persistir, chame a Esther |
| Progresso dá `NaN`               | divisão por zero em matéria sem conteúdo | o `t.length ? … : 0` do passo 3          |
| A tela não atualiza ao adicionar | faltou `invalidateQueries`               | veja o `onSettled` dos outros            |
| A etiqueta não muda com o tema   | cor escrita na mão                       | use token                                |
