# Caio — Login e Cadastro

**Pessoa 1 · Grupo 1 · Etapa 1 (dias 6–7)**

Leia antes: [TECNOLOGIAS.md](../TECNOLOGIAS.md) e [GUIA-GIT.md](../GUIA-GIT.md).

---

## O que você entrega

1. Tela de **Login** — e-mail e senha.
2. Tela de **Cadastro** — nome completo, e-mail, senha e confirmar senha.
3. **Sair** continuando a funcionar.
4. O nome digitado no cadastro chegando no perfil do usuário.

**Não entra nesta fase:** login com Google, recuperação de senha elaborada,
autenticação de dois fatores, confirmação por código.

---

## Comece sabendo disto

**Toda a parte de autenticação já existe.** O arquivo
`src/contexts/AuthContext.tsx` já entrega prontas, para qualquer componente:

```ts
const { user, loading, signUp, signInWithPassword, signOut, sendMagicLink } = useAuth();
```

Então **você não vai escrever autenticação** — você vai escrever as telas que
usam o que já está lá. É um trabalho de interface e de fluxo.

E tem um detalhe que economiza bastante: existe um gatilho no banco que, ao
criar a conta, **copia sozinho o nome para o perfil**. Se você chamar
`signUp(email, senha, nome)`, o item 4 da sua entrega já está feito.

---

## Passo a passo

### 1. Prepare o ambiente

```bash
git clone <URL-DO-REPOSITORIO>
cd estudia
npm install
```

Peça as chaves do banco no grupo e crie o `.env` — ver [SETUP.md](../../SETUP.md).

```bash
npm run dev
```

### 2. Crie a sua branch

```bash
git checkout -b p1-caio/telas-login-cadastro
```

### 3. Leia a tela que já existe

Abra `src/components/auth/AuthScreen.tsx`. É a tela de login de hoje: pede só
o e-mail e manda um link por e-mail. **Ela é o seu ponto de partida** — o
visual, as cores e o tratamento de erro dela já estão prontos e você vai
reaproveitar.

Repare na função `friendlyError()` no topo: é ela que transforma o erro técnico
em português. Mantenha e aumente.

### 4. Crie a tela de Login

Crie `src/routes/entrar.tsx`. Copie a estrutura de `src/routes/auth.reset.tsx`
para ver como uma rota se monta neste projeto.

O miolo é este:

```tsx
const { signInWithPassword } = useAuth();
const [email, setEmail] = useState("");
const [senha, setSenha] = useState("");
const [erro, setErro] = useState<string | null>(null);
const [ocupado, setOcupado] = useState(false);

async function entrar(e: React.FormEvent) {
  e.preventDefault();
  setErro(null);
  setOcupado(true);
  try {
    await signInWithPassword(email, senha);
    // deu certo: o app leva para dentro sozinho
  } catch (err) {
    setErro(friendlyError(err));
  } finally {
    setOcupado(false);
  }
}
```

Coloque também um link **"Ainda não tem conta? Crie a sua"** apontando para
`/cadastro`.

### 5. Crie a tela de Cadastro

Crie `src/routes/cadastro.tsx`, no mesmo formato. A diferença são os campos e
uma validação antes de enviar:

```tsx
if (senha !== confirmar) {
  setErro("As senhas não são iguais.");
  return;
}
if (senha.length < 6) {
  setErro("A senha precisa de pelo menos 6 caracteres.");
  return;
}
await signUp(email, senha, nome); // o nome vai para o perfil sozinho
```

E um link **"Já tem conta? Entrar"** para `/entrar`.

### 6. Use os componentes prontos

Não escreva campo e botão do zero:

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
```

Lembre do estado de carregando — um botão que não responde parece travado:

```tsx
<Button type="submit" disabled={ocupado}>
  {ocupado ? "Entrando…" : "Entrar"}
</Button>
```

### 7. Mantenha o link mágico

A entrada por link no e-mail já funciona e é útil para quem esquece a senha.
Deixe como uma opção discreta embaixo do formulário — não jogue fora.

### 8. Confira antes de abrir o Pull Request

```bash
npx tsc --noEmit
npm run lint
```

---

## 🛑 Checkpoint de banco

**Você provavelmente não tem.** A tabela de perfil e a autenticação já existem.

Se descobrir que falta alguma coluna, **não aplique nada** — leia
[BANCO-DE-DADOS.md](../BANCO-DE-DADOS.md) e chame a Esther.

---

## Combine com a Esther

Os endereços das telas (`/entrar`, `/cadastro`) fazem parte do **contrato de
rotas**, porque a Landing Page dela aponta para eles. Já estão definidos — só
não mude por conta própria.

E **não edite `src/routes/__root.tsx`**: é o arquivo que decide o que fica atrás
do login, e é dela. Se as suas telas novas aparecerem bloqueadas pelo login,
é exatamente isso que ela precisa ajustar — chame.

---

## Pronto quando

1. Criar uma conta com nome, e-mail e senha.
2. Sair.
3. Entrar de novo com e-mail e senha.
4. Recarregar a página logado e continuar logado.
5. Errar a senha de propósito e ver uma mensagem em português.
6. O nome aparecer no perfil (peça para a Esther conferir no banco).
7. Funcionar no tamanho de celular (F12 → ícone de celular).

---

## Erros comuns

| Sintoma                           | Causa                             | Solução                      |
| --------------------------------- | --------------------------------- | ---------------------------- |
| `[supabase] Missing env vars`     | falta o `.env`                    | peça as chaves no grupo      |
| A tela nova cai no login          | `__root.tsx` bloqueia tudo        | é da Esther — chame          |
| O e-mail de confirmação não chega | confirmação ligada no painel      | peça para desligarem         |
| `Invalid login credentials`       | senha errada, ou conta não existe | teste criando uma conta nova |
