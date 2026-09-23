# Integração com Supabase — Guia de execução

Este projeto (TanStack Start + React + Vite) foi integrado ao **Supabase** para
autenticação e persistência de dados, **sem reescrever a interface**. Toda a UI,
layout, rotas e componentes originais foram preservados; apenas a camada de
dados (antes `localStorage`) passou a ser o Supabase.

> **Nada está configurado ainda.** Siga os passos abaixo na ordem. Onde for
> preciso agir no painel do Supabase, está marcado com **[PAINEL]**.

---

## 0. Pré-requisitos (instale uma vez)

```bash
# Node 18+ e npm já são usados pelo projeto.

# Supabase CLI (escolha um):
npm install -g supabase           # via npm
# ou  scoop install supabase       # Windows (scoop)
# ou  https://supabase.com/docs/guides/cli  (instaladores oficiais)

supabase --version                # confirme que instalou
```

As dependências do app (incluindo `@supabase/supabase-js`) já foram instaladas.
Se clonar em outra máquina: `npm install`.

---

## 1. [PAINEL] Crie o projeto no Supabase

1. Acesse https://supabase.com/dashboard e crie um **novo projeto**.
2. Guarde a **senha do banco** (você vai usá-la no `db push`).
3. Em **Project Settings → API**, copie:
   - **Project URL** → vira `VITE_SUPABASE_URL`
   - **anon public key** → vira `VITE_SUPABASE_ANON_KEY`
   - Anote também a **Reference ID** (em Project Settings → General), algo como
     `abcxyzrandom`.

---

## 2. Configure o `.env`

```bash
cp .env.example .env
```

Edite `.env` e preencha:

```dotenv
VITE_SUPABASE_URL=https://SEU-REF.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-public-key
```

> `.env` está no `.gitignore` — **nunca** é commitado. Só a chave **anon**
> (pública) vai aqui; a `service_role` jamais deve ir para o front-end.

---

## 3. Linke a CLI ao seu projeto e aplique as migrations

```bash
supabase login                    # abre o navegador para autenticar a CLI
supabase link --project-ref SEU-REF   # usa a Reference ID do passo 1

# Aplica TODAS as migrations no banco remoto (vai pedir a senha do banco):
npm run db:push                   # === supabase db push
```

Isso cria as 15 tabelas, RLS, policies, triggers, índices, views, realtime e o
trigger que cria o `profiles` automaticamente a cada novo usuário.

### (Opcional) Rodar 100% local antes de ir para a nuvem

```bash
supabase start                    # sobe Postgres+Auth+Studio locais (Docker)
supabase db reset                 # aplica migrations + seed no banco LOCAL
# Studio local: http://localhost:54323
```

---

## 4. [PAINEL] Configure a autenticação

1. **Authentication → URL Configuration**
   - **Site URL**: a URL onde o app roda (dev: `http://localhost:3000`).
   - **Redirect URLs**: adicione `http://localhost:3000/**` e a URL de produção.
2. **Login por e-mail** já vem habilitado. Para testes rápidos, em
   **Authentication → Providers → Email**, você pode **desligar "Confirm email"**
   (assim o cadastro entra direto sem verificar o e-mail).
3. **Login com Google** — **[PAINEL]**:
   - Crie um OAuth Client no Google Cloud Console
     (https://console.cloud.google.com/apis/credentials), tipo _Web_.
   - Em **Authorized redirect URI**, use:
     `https://SEU-REF.supabase.co/auth/v1/callback`
   - Copie **Client ID** e **Client Secret** para
     **Supabase → Authentication → Providers → Google** e habilite.
4. **Storage** (para a tabela `attachments`, uso futuro) — **[PAINEL]**:
   crie um bucket **privado** chamado `attachments` (as policies já foram
   criadas pela migration).

---

## 5. Gere os tipos TypeScript a partir do banco real (recomendado)

O arquivo `src/types/database.types.ts` já existe (escrito à mão e fiel ao
schema). Depois de linkar, regenere-o direto do banco para garantir 100% de
fidelidade:

```bash
npm run gen:types                 # supabase gen types typescript --linked > src/types/database.types.ts
```

---

## 6. Rode e valide

```bash
npm run dev                       # http://localhost:3000
```

Checklist de validação da persistência:

1. Abra o app → aparece a **tela de login** (login obrigatório).
2. **Crie uma conta** (ou entre com Google).
3. Se você já usava o app antes, seus dados do `localStorage` são **migrados
   automaticamente** no primeiro login (rodada única por usuário).
4. Vá em **Tarefas**, adicione/conclua/remova uma tarefa.
5. Dê **F5** — os dados continuam lá (vêm do Supabase, não do navegador).
6. Abra em **outra aba/dispositivo** logado na mesma conta → a mudança aparece
   sozinha (**Realtime**).
7. No painel do Supabase (**Table Editor → tasks**) confirme as linhas.
8. Faça **logout** (ícone no rodapé da sidebar / topo no mobile) e entre com
   **outra conta** → você não vê os dados da primeira (**RLS**).

Comandos de verificação de qualidade:

```bash
npm run typecheck                 # tsc --noEmit  (já passa: 0 erros)
npm run build                     # build de produção (já passa)
```

---

## Comandos — resumo

| Objetivo                      | Comando                               |
| ----------------------------- | ------------------------------------- |
| Instalar deps                 | `npm install`                         |
| Login CLI                     | `supabase login`                      |
| Linkar projeto                | `supabase link --project-ref SEU-REF` |
| Aplicar migrations (remoto)   | `npm run db:push`                     |
| Subir stack local             | `npm run supabase:start`              |
| Reset local (migrations+seed) | `npm run db:reset`                    |
| Gerar tipos TS                | `npm run gen:types`                   |
| Rodar app                     | `npm run dev`                         |
| Typecheck                     | `npm run typecheck`                   |
| Build                         | `npm run build`                       |

---

## Ações manuais no painel (checklist [PAINEL])

- [ ] Criar projeto e copiar URL + anon key + Reference ID.
- [ ] Definir Site URL e Redirect URLs.
- [ ] (Opcional) Desligar confirmação de e-mail para testes.
- [ ] Configurar provider Google (Client ID/Secret).
- [ ] Criar bucket privado `attachments` (opcional, uso futuro).
