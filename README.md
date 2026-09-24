# Estudia

**Seu semestre, no seu ritmo.**

Planner de rotina e estudos para universitários. Projeto Integrador II — Fase 2.

O Estudia organiza, num lugar só, o que um estudante precisa acompanhar durante
o semestre: matérias e conteúdos, prazos de provas e trabalhos, tarefas,
treino, dieta, mercado, finanças e hobbies.

---

## Quem faz o quê

| Pessoa | Nome   | Responsabilidade                             |
| ------ | ------ | -------------------------------------------- |
| 1      | Caio   | Login e Cadastro                             |
| 2      | Lara   | Temas e personalização                       |
| 3      | Érika  | Aba Estudos                                  |
| 4      | Laysa  | Tarefas e rotina acadêmica                   |
| 5      | Gabi   | Hobbies, Treino, Mercado, Dieta e Financeiro |
| 6      | Esther | UX/UI e Landing Page                         |

Grupos: **1** Caio e Lara · **2** Érika e Laysa · **3** Gabi e Esther.

---

## Comece por aqui

**É a sua primeira vez no projeto?** Leia nesta ordem:

1. **[SETUP.md](SETUP.md)** — pôr o projeto para rodar na sua máquina.
2. **[docs/TECNOLOGIAS.md](docs/TECNOLOGIAS.md)** — quais linguagens e
   bibliotecas usar, e o que **não** instalar.
3. **[docs/ARQUITETURA.md](docs/ARQUITETURA.md)** — como o código funciona, em
   10 minutos.
4. **[docs/passo-a-passo/](docs/passo-a-passo/)** — ⭐ **o seu roteiro**: o que
   entregar, em que ordem mexer no código, e onde parar para chamar a Esther.
5. **[docs/GUIA-GIT.md](docs/GUIA-GIT.md)** — a rotina do dia a dia.

**Já conhece o projeto?**

- **[docs/PLANO-FASE-2.md](docs/PLANO-FASE-2.md)** — a ordem das etapas e por
  que ela é essa.
- **[docs/DIVISAO-POR-PESSOA.md](docs/DIVISAO-POR-PESSOA.md)** — a ficha
  resumida de cada pessoa, com arquivos seus e proibidos.
- **[docs/BANCO-DE-DADOS.md](docs/BANCO-DE-DADOS.md)** — ninguém aplica
  migration sozinho; aqui está o procedimento.
- **[docs/CONFLITOS.md](docs/CONFLITOS.md)** — deu conflito? a receita está
  aqui.
- **[docs/DECISOES.md](docs/DECISOES.md)** — por que as coisas estão do jeito
  que estão.

> **Nada da Fase 2 está implementado.** O que está no repositório é o planner
> que já existia antes de a fase começar — ele é a base, o padrão e o exemplo.
> A implementação é toda de vocês; cada pessoa escreve nas três camadas
> (banco, regra de negócio e tela).

---

## Rodar o projeto

```bash
npm install
cp .env.example .env     # preencha com as chaves do Supabase — ver SETUP.md
npm run dev
```

Abre em `http://localhost:3000`.

> Sem o `.env` preenchido, o projeto **não abre** — ele para com uma mensagem
> pedindo as chaves. Ver [SETUP.md](SETUP.md).

| Comando                | O que faz                           |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | sobe o projeto                      |
| `npm run lint`         | confere o padrão de código          |
| `npx tsc --noEmit`     | confere os tipos                    |
| `npm run format`       | arruma a formatação                 |
| `npx supabase db push` | aplica as migrations no banco       |
| `npm run gen:types`    | regenera os tipos a partir do banco |

---

## Como está organizado

```
src/
├── routes/        uma tela por arquivo
├── components/    AppShell (menu), auth (login), ui (biblioteca)
├── hooks/         a regra de cada área: useEstudos, useTasks, useTreino...
├── repositories/  acesso ao banco
├── contexts/      quem está logado
├── types/         tipos do domínio e do banco
└── styles.css     cores, fontes e temas

supabase/migrations/   mudanças do banco, em ordem de data
docs/                  planejamento e regras de trabalho
```

Detalhes em [docs/ARQUITETURA.md](docs/ARQUITETURA.md).

---

## Tecnologias

React 19 · TypeScript · TanStack Router e Query · Tailwind CSS 4 · Supabase
(PostgreSQL e autenticação) · Vite.

---

## Duas regras que valem para todo mundo

1. **Ninguém faz commit direto no `main`.** Tudo entra por Pull Request, com
   uma aprovação de outro grupo.
2. **Nunca escreva cor na mão.** Só os tokens (`text-magenta`, `border-gold`…).
   Cor escrita na mão não muda junto com o tema.

---

## Origem

O Estudia parte do **Esther's Planner**, planner pessoal desenvolvido por
Esther Bagatelli. O primeiro commit deste repositório é aquele código, na
versão que os seis integrantes analisaram nas pesquisas dos dias 1–3 da Fase 2.
A partir dele, o projeto é adaptado para o contexto universitário.
