# Plano de implementação — Fase 2

> Este documento responde a uma única pergunta: **em que ordem as seis pessoas
> mexem no código sem derrubar o trabalho uma da outra.**
>
> Quem faz o quê está em [DIVISAO-POR-PESSOA.md](DIVISAO-POR-PESSOA.md).
> O que fazer quando der conflito está em [CONFLITOS.md](CONFLITOS.md).

---

## 1. Por que existe uma ordem

Somos seis pessoas, em seis máquinas, no mesmo código. Existem dois tipos de
trabalho aqui, e eles se comportam de forma completamente diferente:

| Tipo                  | Exemplo                          | Quando pode ser feito           | Risco                    |
| --------------------- | -------------------------------- | ------------------------------- | ------------------------ |
| **Trabalho de canto** | Gabi mexendo em `hobbies.tsx`    | a qualquer momento, em paralelo | quase zero               |
| **Trabalho de base**  | Lara mexendo no sistema de cores | precisa ir primeiro, sozinho    | alto — atinge todo mundo |

O erro clássico de projeto em grupo é tratar os dois igual: todo mundo começa
junto e, no dia 10, descobre-se que metade das telas foi escrita de um jeito
que não funciona com o que a outra metade construiu.

A ordem abaixo **não é preferência, foi tirada do código**. São três "chaves"
que destravam o resto.

---

## 2. As três chaves

### Chave 1 — Os tokens de cor (Lara, Pessoa 2)

O código usa **217 vezes** nomes de cor semânticos: `text-magenta`,
`border-gold`, `bg-wine`, `text-silver`, `text-pink`, `bg-darkred`.

Os 5 temas (Rosa, Verde-água, Roxo, Azul, Vermelho) vão funcionar
**redefinindo o valor desses nomes**, e não trocando os nomes. Ou seja: se todo
mundo continuar escrevendo `text-magenta`, as telas mudam de cor sozinhas
quando o tema muda.

O problema: se Érika, Laysa e Gabi construírem telas novas **antes** dos temas
existirem, elas vão escrever cor na mão (`#e91e63`, `oklch(...)`) sem saber que
isso é proibido. Aí as telas delas ficam travadas na cor rosa enquanto o resto
do app muda. Conserto = retrabalho em três pessoas ao mesmo tempo.

> Hoje já existem **29 cores escritas na mão** em 11 arquivos (são os fundos
> com gradiente). Transformá-las em token faz parte do trabalho da Lara.

**→ Lara vai na Etapa 1, antes do Grupo 2 e da Gabi.**

### Chave 2 — O contrato de dados acadêmicos (Érika + Laysa, Pessoas 3 e 4)

As palavras **prova**, **trabalho** e **atividade** aparecem nos dois
relatórios:

- No da Érika, como **tipo de conteúdo** de uma matéria.
- No da Laysa, como **categoria de tarefa**.

Se cada uma criar a sua própria lista, o sistema fica com dois vocabulários
para a mesma coisa — e a página Início, que precisa juntar "progresso da
matéria" com "prova amanhã", não consegue.

**→ Antes de programar, as duas escrevem UM contrato** (meia hora, no começo da
Etapa 2): os nomes exatos dos tipos, dos status, das prioridades, e como uma
tarefa aponta para uma matéria. Depois disso, cada uma programa no seu arquivo,
sozinha. O contrato fica registrado em [DECISOES.md](DECISOES.md).

### Chave 3 — O mapa de rotas (Caio + Esther, Pessoas 1 e 6)

Hoje o arquivo `src/routes/__root.tsx` põe **o app inteiro** atrás do login
(`<RequireAuth>`). A Landing Page precisa ser pública — é a primeira coisa que
alguém de fora vê.

Se Caio criar as telas de login e Esther criar a landing sem combinar antes, um
dos dois vai mexer no roteamento e derrubar o do outro.

**→ Os nomes das rotas estão decididos na seção 5 deste documento. Ninguém
muda sozinho.**

---

## 3. Mapa de dependências

```
                    ETAPA 0 — FUNDAÇÃO (já entregue neste repositório)
                    repositório, schema relacional, remarcação Estudia,
                    padrão de quebra de linha, CI, contratos escritos
                                      │
             ┌────────────────────────┴────────────────────────┐
             │                                                 │
      ETAPA 1 · Grupo 1                              ETAPA 1 (paralelo)
 ┌───────────┴───────────┐                                  Esther
CAIO                   LARA                          Landing Page +
login e cadastro      5 temas +                      menu do celular
nome no cadastro      nome do usuário                (arquivos novos,
                                                      não conflita)
             │                                                 │
             └────────────────────────┬────────────────────────┘
                                      │
   ┌──────────────────────────────────┼──────────────────────────────┐
   │                                  │                              │
ETAPA 2 · Grupo 2                                          ETAPA 2 · Gabi
(contrato primeiro)                                        Hobbies, Treino,
┌────┴─────┐                                               Mercado, Dieta,
ÉRIKA    LAYSA                                             Financeiro
Estudos  Tarefas                                           (100% isolada)
   │                                  │                              │
   └──────────────────────────────────┼──────────────────────────────┘
                                      │
                             ETAPA 3 · Esther
                      Início novo (Olá [nome], próximos
                      prazos, progresso), estados vazios,
                      feedback, padronização, responsivo
                                      │
                             ETAPA 4 · Todos
                               Testes cruzados
                                      │
                             ETAPA 5 · Todos
                      Correções + documentação da fase
```

Leia as setas como **"precisa que isto esteja no `main` antes de começar"**.

---

## 4. As etapas, uma por uma

### Etapa 0 — Fundação — **já está pronta neste repositório**

Feita por uma pessoa só, de propósito: mexe em todos os arquivos ao mesmo
tempo, e seis pessoas fazendo isso junto é conflito garantido.

| O que foi feito                                        | Por quê                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| Repositório criado com o código publicado no 1º commit | rastreabilidade: é a versão que os relatórios analisaram           |
| Schema relacional aplicado no 2º commit                | as propostas dos Grupos 2 e 3 dependem de dados relacionais        |
| Remarcação para **Estudia**                            | o produto não se chama mais "Esther's Planner"                     |
| `.gitattributes` padronizando quebra de linha          | sem isso, Windows × Mac gera conflito em arquivo que ninguém tocou |
| Formatação normalizada com `prettier`                  | zerou 5.266 erros de lint; o CI começa verde                       |
| Preenchimento automático de dados desligado            | conta nova precisa começar vazia para os estados vazios existirem  |
| CI de lint + typecheck no Pull Request                 | pega merge quebrado antes de virar problema de todo mundo          |

### Etapa 1 — Identidade e aparência · 29/09 a 04/10

**Grupo 1 (Caio e Lara) + Esther em paralelo.**

| Quem       | Entrega                                                | Desbloqueia                                                         |
| ---------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| **Caio**   | Telas de Login e Cadastro (nome, e-mail, senha) e Sair | a Landing ter para onde apontar; o nome do usuário passar a existir |
| **Lara**   | 5 temas funcionando + nome do usuário salvo no perfil  | **todo mundo** — depois disso ninguém escreve cor na mão            |
| **Esther** | Landing Page + menu compacto no celular                | nada (arquivos novos, sem conflito)                                 |

**Por que primeiro:** são os itens de prioridade 1 e 2 do cronograma do PDF, e
são os que mexem em coisa que todo mundo usa depois.

**Pronto quando:** dá para criar uma conta com nome e senha, sair, entrar de
novo, trocar o tema, recarregar a página e o tema continuar aplicado.

### Etapa 2 — Núcleo acadêmico e demais categorias · 05/10 a 18/10

**Grupo 2 (Érika e Laysa) + Gabi, os três em paralelo.**

| Quem      | Entrega                                                                                           | Depende de                         |
| --------- | ------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **Érika** | Estudos: curso/período, matérias criadas pelo usuário, 6 tipos de conteúdo, progresso por matéria | tokens (Lara)                      |
| **Laysa** | Tarefas: prazo, prioridade, status, acadêmica × pessoal, ligação com a matéria                    | tokens (Lara) + contrato com Érika |
| **Gabi**  | Hobbies, Treino, Mercado, Dieta, Financeiro                                                       | tokens (Lara)                      |

Começa com **meia hora de contrato** entre Érika e Laysa (ver Chave 2). Só
depois cada uma abre o editor.

**Gabi é o caso mais fácil do projeto:** os arquivos dela não são tocados por
mais ninguém na Fase 2 inteira. Ela pode até começar junto com a Etapa 1, desde
que não escreva cor na mão.

**Pronto quando:** dá para criar uma matéria, colocar uma prova com data nela,
ver essa prova na aba Tarefas ordenada por prazo, e ver o progresso da matéria.

### Etapa 3 — Experiência e acabamento · 19/10 a 25/10

**Esther, sozinha.**

Início novo (Olá + nome, próximos prazos no topo, resumo de Estudos, e Treino e
Dieta mantidos), estados vazios, mensagens de sucesso, **acabamento visual das
abas Estudos e Tarefas** (cards de matéria, etiquetas dos 6 tipos, linha de
tarefa), padronização de botões e cards, responsividade.

**Por que por último:** é a única etapa que **toca no arquivo de todo mundo**.
Se acontecesse antes, viraria conflito com cinco pessoas ao mesmo tempo.

**Regra que torna isso possível:** Érika e Laysa **não editam a página Início**.
Elas entregam ganchos (`useResumoEstudos()`, `useProximosPrazos()`) e Esther
apenas consome. Detalhado em [CONFLITOS.md](CONFLITOS.md), risco nº 2.

### Etapa 4 — Testes · 26/10 a 31/10

Todo mundo, com a lista do PDF: cadastro, login, logout, navegação, temas,
responsividade, adição/edição, tarefas, estudos, categorias, experiência geral.

Cada pessoa testa **a área de outra pessoa**, nunca a sua — quem escreveu já
sabe onde não clicar. O rodízio de testes está em [GUIA-GIT.md](GUIA-GIT.md).

### Etapa 5 — Fechamento · primeira semana de novembro

Correção de bugs, padronização final e a documentação: o que foi feito, o que
ficou para a Fase 3 e o registro das decisões em [DECISOES.md](DECISOES.md).

---

## 4.1 O calendário, de uma olhada só

| Período                 | Etapa                             | Quem entrega                   |
| ----------------------- | --------------------------------- | ------------------------------ |
| **29/09 – 04/10**       | 1 · Identidade e aparência        | Caio · Lara · Esther (landing) |
| **05/10 – 18/10**       | 2 · Núcleo acadêmico e categorias | Érika · Laysa · Gabi           |
| **19/10 – 25/10**       | 3 · Experiência e acabamento      | Esther                         |
| **26/10 – 31/10**       | 4 · Testes                        | todos                          |
| **novembro, 1ª semana** | 5 · Fechamento                    | todos                          |

### As janelas de revisão

| Data                                          | Janela               |
| --------------------------------------------- | -------------------- |
| qua 30/09 · sáb 03/10                         | Etapa 1              |
| qua 07/10 · sáb 10/10 · qua 14/10 · sáb 17/10 | Etapa 2              |
| qua 21/10 · sáb 24/10                         | Etapa 3              |
| qua 28/10 · sáb 31/10                         | correções dos testes |

**Quarta à noite** e **sábado de manhã**. Tudo que estiver aberto até a janela é
revisado nela; o que chegar depois fica para a próxima. Detalhes em
[GUIA-GIT.md](GUIA-GIT.md), seção 5.

> **A data que não pode escorregar é 04/10.** A Etapa 2 inteira depende dos
> temas da Lara. Se a Etapa 1 atrasar uma semana, atrasam três pessoas de uma
> vez — e os testes não cabem mais em outubro.

---

## 5. Contrato de rotas — decidido, não mude sozinho

| Rota                                                   | Pública? | Dono do arquivo | O que é                   |
| ------------------------------------------------------ | -------- | --------------- | ------------------------- |
| `/`                                                    | **sim**  | Esther          | Landing Page              |
| `/entrar`                                              | **sim**  | Caio            | Login                     |
| `/cadastro`                                            | **sim**  | Caio            | Criar conta               |
| `/auth/reset`                                          | **sim**  | Caio            | Nova senha (já existe)    |
| `/inicio`                                              | não      | Esther          | Página inicial do planner |
| `/estudos`                                             | não      | Érika           | —                         |
| `/tarefas`                                             | não      | Laysa           | —                         |
| `/hobbies` `/treino` `/mercado` `/dieta` `/financeiro` | não      | Gabi            | —                         |

> **Atenção:** hoje a página inicial do planner é `/`. Quando a Landing for
> criada, ela passa a ser `/inicio`. Essa mudança mexe no menu
> (`AppShell.tsx`) e no roteamento (`__root.tsx`) — **é da Esther, e ela faz na
> Etapa 1**, para que todo mundo já trabalhe com o mapa final.

---

## 6. Regra de escopo

> Se uma funcionalidade não contribui diretamente para transformar o planner em
> uma ferramenta personalizável para estudantes, **ela fica para a Fase 3.**

É a regra do próprio PDF. Cada pessoa tem uma lista "não entra nesta fase" em
[DIVISAO-POR-PESSOA.md](DIVISAO-POR-PESSOA.md) — ela existe para proteger o
prazo, não para diminuir o trabalho de ninguém.
