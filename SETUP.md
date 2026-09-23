# Pôr o Estudia para rodar na sua máquina

Tempo estimado: 15 minutos na primeira vez.

---

## 1. Antes de começar

Você precisa de:

- **Node.js 20 ou mais novo** — confira com `node -v`. Baixe em
  [nodejs.org](https://nodejs.org).
- **Git** — confira com `git --version`.
- Uma conta no **GitHub**, com acesso a este repositório.

---

## 2. Baixar o projeto

```bash
git clone <URL-DO-REPOSITORIO>
cd estudia
npm install
```

O `npm install` demora alguns minutos na primeira vez. É normal.

---

## 3. Configurar o acesso ao banco

> **Leia isto antes:** o Estudia **não abre sem banco de dados.** O login é do
> Supabase e todas as telas leem e gravam lá. Se você rodar `npm run dev` sem
> este passo, vai ver uma tela de erro pedindo as chaves. Não é bug.
>
> O porquê disso está em [docs/DECISOES.md](docs/DECISOES.md), decisão 3.

O grupo precisa escolher **um dos dois caminhos** abaixo. A recomendação é o
caminho A.

### Caminho A — um banco compartilhado pelo grupo (recomendado)

Uma pessoa cria o projeto no Supabase e passa as chaves para as outras cinco.

**Isso é seguro?** É. O banco tem regras de acesso por usuário: cada pessoa
entra com o próprio e-mail e **enxerga apenas os próprios dados**, mesmo todo
mundo usando o mesmo banco. A chave distribuída é a chave _pública_ (`anon`),
feita para ficar no navegador.

**Quem cria (uma vez só):**

1. Entre em [supabase.com](https://supabase.com) → **New project**.
2. Nome: `estudia`. Região: **South America (São Paulo)**. Guarde a senha do
   banco.
3. Em **Project Settings → API**, copie:
   - **Project URL**
   - a chave **anon public**
4. Em **Authentication → Providers**, deixe **Email** ligado.
   Para facilitar os testes, desligue **Confirm email**.
5. Aplique o banco:

   ```bash
   npx supabase login
   npx supabase link --project-ref <ref-do-projeto>
   npx supabase db push
   ```

6. Passe a **URL** e a **chave anon** para o grupo — por mensagem direta, nunca
   dentro do repositório.

**Quem recebe (os outros cinco):**

```bash
cp .env.example .env
```

Abra o `.env` e preencha:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Pronto — você não precisa rodar migration nenhuma.

### Caminho B — cada pessoa com o seu banco

Mais isolado, porém mais trabalhoso: cada uma faz **todos** os passos do
Caminho A, inclusive o `db push`, e refaz a cada migration nova que alguém
subir.

O guia detalhado está em [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

---

## 4. Rodar

```bash
npm run dev
```

Abra `http://localhost:3000`. Crie uma conta com o seu e-mail e entre.

> **Sua conta começa vazia, e isso é de propósito** — os estados vazios da
> Fase 2 dependem disso. Ver [docs/DECISOES.md](docs/DECISOES.md), decisão 4.

---

## 5. Conferir que está tudo certo

```bash
npx tsc --noEmit    # não deve mostrar nenhum erro
npm run lint        # não deve mostrar nenhum erro (alguns avisos são normais)
```

Se esses dois passam e o site abre no navegador, você está pronta para começar.

---

## Deu problema?

| Sintoma                             | Causa provável                            | Solução                                    |
| ----------------------------------- | ----------------------------------------- | ------------------------------------------ |
| `[supabase] Missing env vars`       | `.env` não existe ou está vazio           | passo 3                                    |
| `Invalid API key`                   | chave copiada pela metade                 | copie de novo, inteira                     |
| `column "..." does not exist`       | alguém subiu migration e você não aplicou | `git pull` e depois `npx supabase db push` |
| O e-mail de confirmação não chega   | confirmação de e-mail ligada              | desligue em Authentication → Providers     |
| Erro de tipo numa coluna que existe | tipos desatualizados                      | `npm run gen:types`                        |
| `npm install` falha                 | Node antigo                               | atualize para a versão 20 ou mais nova     |

Continua travada? Pergunte no grupo **antes** de tentar comandos novos —
descrevendo a mensagem de erro inteira.

---

## Próximo passo

Leia [docs/ARQUITETURA.md](docs/ARQUITETURA.md) e depois a sua ficha em
[docs/DIVISAO-POR-PESSOA.md](docs/DIVISAO-POR-PESSOA.md).
