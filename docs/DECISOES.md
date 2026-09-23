# Registro de decisões

Cada decisão que muda o rumo do projeto fica registrada aqui: **o que foi
decidido, por quê, e o que se perde com isso.** Serve para dois momentos —
quando alguém pergunta "por que está assim?" daqui a duas semanas, e na
documentação final da Fase 2.

Formato: uma seção por decisão. Decisões novas vão para o fim.

---

## 1. O repositório começa com dois commits, não um

**Decidido em:** fundação, antes da Etapa 1.

**Decisão:** o primeiro commit é o código publicado do Esther's Planner
(`e6a7592`) — exatamente a versão que os seis integrantes analisaram nas
pesquisas dos dias 1–3. O segundo commit é a refatoração para schema
relacional. Todo mundo trabalha a partir do segundo.

**Por quê:** o histórico registra a versão que os relatórios descrevem, o que
permite mostrar o "antes e depois" na entrega da Fase 2 — sem obrigar ninguém a
trabalhar em cima do código antigo.

**Custo:** o primeiro commit é código que ninguém vai executar. Ele existe para
documentação.

---

## 2. A base de trabalho é o schema relacional

**Decisão:** a Fase 2 é construída sobre a refatoração relacional, não sobre o
código publicado.

**Por quê:** no código publicado, as matérias eram uma **lista fixa escrita
dentro do arquivo** (`const FACULDADE = [...]`), salva como um blob JSON numa
tabela chave-valor. Três consequências:

1. A primeira proposta da Érika — _"substituir categorias fixas como Faculdade
   e Estágio por categorias que o próprio usuário possa criar"_ — já é a
   refatoração. Sem ela, o trabalho seria refeito por outra pessoa.
2. As propostas da Laysa (prazo, prioridade, status, tarefa ligada à matéria) e
   da Gabi (progresso, metas, entradas) pedem colunas. Em cima de um blob JSON
   isso vira gambiarra.
3. A Fase 3 é justamente o banco de dados. Construir sobre o modelo antigo
   seria construir sobre algo que o próprio grupo joga fora em um mês.

**Custo:** a refatoração nunca foi usada por gente de verdade — foi verificada
por compilação (`tsc`) e revisão do código, não por uso. Bugs de estreia podem
aparecer nos primeiros dias e precisam ser tratados como bug normal, não como
"a base está errada".

**Verificado:** nenhuma funcionalidade foi perdida. Hobbies com temporada e
episódio, treino com séries/repetições/carga, financeiro com saldo/gasto/
disponível — tudo continua.

---

## 3. Banco de dados na Fase 2 — não dá para adiar

**Decisão:** o grupo precisa de um projeto Supabase funcionando **no Dia 6**,
antes da Etapa 1.

**Por quê:** o PDF diz, corretamente, que a Fase 2 não vai _desenvolver_ o
banco de dados — isso é Fase 3. Mas o sistema atual **já depende** de um banco
para abrir. Não é escolha de arquitetura, é o estado do código:

- O login é autenticação do Supabase. Sem ele, não há login nenhum.
- Todas as oito telas leem e gravam no Supabase.
- O arquivo `src/lib/supabase/client.ts` **interrompe a aplicação na
  inicialização** se as chaves não estiverem configuradas:

  ```ts
  if (!url || !anonKey) {
    throw new Error("[supabase] Missing env vars...");
  }
  ```

Ou seja: sem Supabase configurado, `npm run dev` abre uma tela de erro. Ninguém
consegue nem começar.

**O que continua valendo do PDF:** a Fase 2 não vai _modelar_ banco novo. As
migrations de cada pessoa são pequenas (`add column`), e o modelo de dados
completo continua sendo assunto da Fase 3.

**Recomendação (a ser confirmada pelo grupo):** **um projeto Supabase
compartilhado**, criado uma vez, com a URL e a chave pública distribuídas para
os seis. Motivos:

- As regras de acesso por usuário já existem: cada pessoa entra com o próprio
  e-mail e **vê apenas os próprios dados**, mesmo compartilhando o banco. Isso
  já está implementado e testado no schema.
- Cada migration é aplicada **uma vez**, não seis.
- Ninguém fica bloqueado esperando a própria configuração funcionar.

A alternativa — cada pessoa com o seu projeto — dá isolamento total, mas custa
seis configurações e seis aplicações de cada migration. Para 15 dias, é atrito
demais.

**Custo do compartilhado:** se alguém aplicar uma migration e não subir o
arquivo para o repositório, o banco fica à frente do código. Por isso a regra
de avisar no grupo, em [CONFLITOS.md](CONFLITOS.md) seção 3.

**Status:** aguardando decisão do grupo. Ver [SETUP.md](../SETUP.md), que cobre
os dois cenários.

---

## 4. Conta nova começa vazia

**Decisão:** o preenchimento automático de dados no primeiro login foi
desligado. O código continua existindo (`src/services/seed.service.ts`), mas só
roda se alguém chamar de propósito.

**Por quê:** dois motivos.

1. **Os estados vazios precisam existir.** O item 6 do relatório de UX/UI pede
   mensagens como _"Você ainda não adicionou nenhuma matéria."_ Se toda conta
   nova já nasce cheia de dados, essa tela **nunca aparece** — nem para o
   usuário, nem para quem for testar.
2. **Os dados semeados eram pessoais.** O conteúdo original incluía as matérias,
   os treinos, o cardápio e as categorias financeiras de uma pessoa específica
   ("Dinheiro Pai", "Despesas Mãe"). Num repositório público de trabalho
   acadêmico, isso seria publicado e ainda apareceria na conta dos outros cinco
   integrantes no primeiro login.

O conteúdo de exemplo foi substituído por exemplos neutros de estudante
(matérias como "Banco de Dados", categorias como "Transporte", "Material de
estudo").

**Custo:** para a apresentação, é preciso cadastrar os dados na mão ou ligar um
botão de "carregar dados de exemplo" — que é uma chamada só,
`seedService.run()`. Fica como tarefa opcional da Etapa 5.

---

## 5. Quebra de linha padronizada em LF

**Decisão:** `.gitattributes` com `* text=auto eol=lf`, e o código inteiro
reformatado uma vez.

**Por quê:** o grupo trabalha em Windows e em Mac. Sem isso, cada máquina grava
a quebra de linha do seu jeito e o Git enxerga o **arquivo inteiro** como
alterado — conflito em código que ninguém tocou. Antes da correção, o lint
acusava **5.266 erros**, dos quais 4.914 eram exatamente isso.

**Custo:** o commit da fundação tem um diff grande de formatação. É uma vez só.

---

## 6. O produto se chama Estudia

**Decisão:** toda a marca "Esther's Planner" virou "Estudia", incluindo título
das páginas, manifesto do aplicativo e a chave de sessão do navegador.

**Por quê:** é o nome do projeto na Fase 2, e o produto deixou de ser o planner
pessoal de uma pessoa.

**O que não mudou:** a identidade visual (cores, tipografia, cartões) continua a
mesma, como pede o relatório de UX/UI — _"não redesenhar o sistema inteiro"_.

---

## 7. Cinco temas antes da roda de cores

**Decisão:** a personalização entrega **5 temas fixos** (Rosa, Verde-água, Roxo,
Azul, Vermelho). A roda de cores interativa proposta na pesquisa do Grupo 1
fica como extra, só se sobrar tempo.

**Por quê:** o PDF pede "aproximadamente 5 temas", e a Etapa 2 inteira depende
da entrega da Lara. Uma roda de cores livre é bem mais trabalhosa e traz um
problema novo: garantir que o texto continue legível em qualquer cor escolhida.
Com 5 temas, o contraste é conferido uma vez, na mão, e pronto.

**Custo:** menos liberdade para o usuário. Fica registrado como candidato à
Fase 3.

---

## Decisões em aberto

Anote aqui o que ainda precisa ser decidido, e mova para cima quando resolver.

| #   | Pergunta                                                 | Quem decide   | Até quando        |
| --- | -------------------------------------------------------- | ------------- | ----------------- |
| A   | Supabase compartilhado ou um por pessoa? (ver decisão 3) | grupo         | Dia 6             |
| B   | Tarefa pode ficar sem data de entrega?                   | Érika e Laysa | início da Etapa 2 |
| C   | Os nomes exatos dos tipos de conteúdo e de status        | Érika e Laysa | início da Etapa 2 |
| D   | Botão "carregar dados de exemplo" para a apresentação?   | grupo         | Etapa 5           |
