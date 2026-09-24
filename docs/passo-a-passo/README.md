# Passo a passo — ache o seu

Cada arquivo aqui é o roteiro de uma pessoa: o que entregar, em que ordem
mexer no código, o que **não** fazer nesta fase, e onde parar para chamar a
Esther.

| Pessoa     | Roteiro                                                             | Etapa         |
| ---------- | ------------------------------------------------------------------- | ------------- |
| **Caio**   | [Login e Cadastro](1-caio-login-cadastro.md)                        | 1 — dias 6–7  |
| **Lara**   | [Temas e personalização](2-lara-temas.md)                           | 1 — dias 6–7  |
| **Érika**  | [Aba Estudos](3-erika-estudos.md)                                   | 2 — dias 8–10 |
| **Laysa**  | [Tarefas e rotina acadêmica](4-laysa-tarefas.md)                    | 2 — dias 8–10 |
| **Gabi**   | [Hobbies, Treino, Mercado, Dieta, Financeiro](5-gabi-categorias.md) | 2 — dias 8–10 |
| **Esther** | [UX/UI e Landing Page](6-esther-ux-landing.md)                      | 1 e 3         |

---

## Antes de abrir o seu

Três leituras rápidas, nesta ordem:

1. **[SETUP.md](../../SETUP.md)** — pôr o projeto para rodar na sua máquina.
2. **[TECNOLOGIAS.md](../TECNOLOGIAS.md)** — quais linguagens e bibliotecas
   usar, e o que **não** instalar.
3. **[ARQUITETURA.md](../ARQUITETURA.md)** — como o código funciona, em 10
   minutos.

E o [GUIA-GIT.md](../GUIA-GIT.md) quando for abrir o primeiro Pull Request.

---

## Três coisas que valem para todos

**1. Espere a sua vez de começar.** Quem está na Etapa 2 só começa depois que
os temas da Lara estiverem no `main`. Começar antes significa escrever cor na
mão e ter que refazer. A ordem e o motivo estão em
[PLANO-FASE-2.md](../PLANO-FASE-2.md).

**2. Banco de dados ninguém aplica sozinho.** Quando o seu roteiro mostrar

> ### 🛑 PARE — checkpoint de banco

você **escreve** o arquivo `.sql` e **chama a Esther** para aplicar. O porquê
está em [BANCO-DE-DADOS.md](../BANCO-DE-DADOS.md). Você não fica parado
esperando — o roteiro diz o que adiantar enquanto isso.

**3. Nunca escreva cor na mão.** Só os nomes prontos (`text-magenta`,
`border-gold`…). Cor literal não muda junto com o tema.

---

## Antes de todo Pull Request

```bash
npx tsc --noEmit
npm run lint
```

Os dois precisam passar. Se falhar no GitHub, é isso que faltou rodar aqui.
