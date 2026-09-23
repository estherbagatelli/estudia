# Guia de trabalho em equipe

Como seis pessoas mexem no mesmo código sem se atropelar. Leia uma vez inteiro;
depois use a seção 1 como rotina diária.

---

## 1. A rotina do dia — quatro momentos

### Ao começar

```bash
git checkout main
git pull origin main          # pega o que os outros entregaram
npm install                   # só se alguém avisou que instalou algo novo
git checkout -b p3-erika/progresso-materia
```

### Enquanto trabalha

```bash
git add .
git commit -m "Mostra progresso da matéria em porcentagem"
```

> **Commit todo dia, mesmo inacabado.** Trabalho não commitado é a única coisa
> que o Git não consegue recuperar.

### Ao terminar uma tarefa

```bash
git pull origin main          # traz o que mudou enquanto você trabalhava
# resolveu conflito, se houver (ver CONFLITOS.md)
npx tsc --noEmit              # ainda compila?
npm run lint                  # está no padrão?
git push -u origin p3-erika/progresso-materia
```

Depois abra o Pull Request no GitHub.

### Ao fim do dia

Mesmo que não tenha acabado: **commit e push na sua branch.** Se o notebook
morrer, o trabalho está salvo.

---

## 2. Nome da branch

```
p<número>-<nome>/<o-que-faz>
```

| Pessoa | Exemplos                                                   |
| ------ | ---------------------------------------------------------- |
| Caio   | `p1-caio/tela-login`, `p1-caio/tela-cadastro`              |
| Lara   | `p2-lara/cinco-temas`, `p2-lara/nome-no-perfil`            |
| Érika  | `p3-erika/tipos-de-conteudo`, `p3-erika/progresso-materia` |
| Laysa  | `p4-laysa/prazo-e-prioridade`, `p4-laysa/filtro-academica` |
| Gabi   | `p5-gabi/financeiro-entradas`, `p5-gabi/hobbies-progresso` |
| Esther | `p6-esther/landing-page`, `p6-esther/estados-vazios`       |

O número na frente faz as branches aparecerem agrupadas por pessoa na lista do
GitHub. Facilita muito na hora de revisar.

---

## 3. Mensagem de commit

Em português, no imperativo, dizendo **o que passou a acontecer**:

```
Adiciona filtro de tarefas acadêmicas e pessoais
Corrige ordenação quando a tarefa não tem data
Cria tema verde-água
```

Não precisa de mais que uma linha. Evite `ajustes`, `wip`, `mudanças`, `teste`
— daqui a duas semanas ninguém sabe o que foi.

---

## 4. Pull Request

**Pequeno e sobre um assunto só.** Um PR de 80 linhas é revisado em 5 minutos;
um de 800 fica três dias parado e entra sem ninguém ler de verdade.

Ao abrir, o modelo do repositório já pergunta o necessário. Antes de marcar
como pronto, confirme:

- [ ] `npx tsc --noEmit` passa
- [ ] `npm run lint` passa
- [ ] Testei na minha máquina, no navegador
- [ ] Testei no tamanho de celular (F12 → ícone de celular)
- [ ] Não escrevi nenhuma cor na mão
- [ ] Não editei arquivo da lista "proibidos" da minha ficha
- [ ] Se criei migration, avisei no grupo

---

## 5. Quem revisa quem

Revisão **cruzada entre grupos**, nunca dentro da própria dupla. Dois motivos:
quem está na mesma dupla já viu o código nascer e revisa no automático; e assim
todo mundo acaba conhecendo uma área que não é a sua — o que importa nos dias
12–13, quando cada um testa a área do outro.

| Quem abriu o PR        | Quem revisa            |
| ---------------------- | ---------------------- |
| Grupo 1 (Caio, Lara)   | Grupo 2 (Érika, Laysa) |
| Grupo 2 (Érika, Laysa) | Grupo 3 (Gabi, Esther) |
| Grupo 3 (Gabi, Esther) | Grupo 1 (Caio, Lara)   |

**Uma aprovação basta.** Se o revisor não responder em 24 h, qualquer outra
pessoa do grupo pode aprovar — ninguém fica bloqueado esperando.

### Como revisar sem travar o colega

Separe o que é **impedimento** do que é **sugestão**:

- _"Isso quebra quando a lista está vazia"_ → impedimento, peça correção.
- _"Eu teria feito com `map`"_ → sugestão, comente e aprove assim mesmo.

Revisão não é lugar de discutir gosto pessoal. É lugar de achar o que quebra.

---

## 6. Rodízio de testes (dias 12–13)

Cada pessoa testa a área de **outra**, com a lista do PDF:

| Testa  | A área de                 |
| ------ | ------------------------- |
| Caio   | Estudos (Érika)           |
| Lara   | Tarefas (Laysa)           |
| Érika  | Hobbies e Treino (Gabi)   |
| Laysa  | Landing e Início (Esther) |
| Gabi   | Login e Cadastro (Caio)   |
| Esther | Temas (Lara)              |

Testem também com perfis diferentes, como pede o PDF: estudante de graduação,
estudante que trabalha, estudante com muitas disciplinas, e estudante que usa o
planner só para organização pessoal.

Bug encontrado vira **issue** no GitHub, com o modelo de tarefa — não mensagem
solta no grupo, que se perde.

---

## 7. Configuração da `main` no GitHub

Para fazer valer a regra "ninguém commita direto no `main`", peça ao dono do
repositório para ligar, em **Settings → Branches → Add rule**:

- Require a pull request before merging
- Require approvals: **1**
- Require status checks to pass: marque **CI**

> Isso funciona em repositório **público** com conta gratuita. Em repositório
> privado gratuito, essas regras não são aplicadas — aí o combinado vale por
> disciplina do grupo.

---

## 8. Se travar

1. Leia [CONFLITOS.md](CONFLITOS.md) — é bem provável que o seu caso esteja
   listado com a receita pronta.
2. Nada foi perdido: `git merge --abort` desfaz o merge e devolve você ao ponto
   anterior.
3. Não deu certo? **Chame alguém antes de tentar comandos novos.** A maior
   parte dos trabalhos perdidos em projeto de faculdade acontece na tentativa
   de consertar sozinho, com comando copiado da internet.
