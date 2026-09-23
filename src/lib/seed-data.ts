import type { MealKind } from "@/types/models";

/**
 * Conteúdo de exemplo do Estudia.
 *
 * ATENÇÃO: este arquivo NÃO é mais aplicado automaticamente no primeiro login.
 * Uma conta nova começa vazia de propósito, para que os estados vazios da
 * Fase 2 ("Você ainda não adicionou nenhuma matéria.") sejam realmente vistos.
 *
 * Ele continua aqui para servir de dados de demonstração — ver
 * `seedService.run()` em src/services/seed.service.ts. Se o grupo quiser um
 * botão "Carregar dados de exemplo" para a apresentação, é só chamar essa
 * função. Ver docs/DECISOES.md (decisão 4).
 */

export const SEED_QUOTES = [
  "Um pouco por dia é melhor do que muito de uma vez",
  "Estudar é construir, não correr",
  "Você não precisa dar conta de tudo hoje",
  "O semestre é seu, no seu ritmo",
];

export const SEED_STUDY: { name: string; subtitle: string; topics: string[] }[] = [
  {
    name: "Banco de Dados",
    subtitle: "3º período",
    topics: [
      "Modelo relacional",
      "Álgebra relacional",
      "SQL — consultas",
      "SQL — junções",
      "Normalização",
    ],
  },
  {
    name: "Engenharia de Software",
    subtitle: "3º período",
    topics: [
      "Levantamento de requisitos",
      "Casos de uso",
      "Histórias de usuário",
      "Metodologias ágeis",
    ],
  },
];

type SeedExercise = { name: string; sets: number; reps: string };
export const SEED_WORKOUTS: {
  name: string;
  focus: string;
  weekday: number;
  exercises: SeedExercise[];
}[] = [
  {
    name: "Segunda",
    focus: "Corpo inteiro",
    weekday: 1,
    exercises: [
      { name: "Agachamento livre", sets: 3, reps: "12" },
      { name: "Supino reto", sets: 3, reps: "10" },
      { name: "Remada curvada", sets: 3, reps: "10" },
      { name: "Prancha", sets: 3, reps: "30s" },
    ],
  },
];

type SeedMeal = { kind: MealKind; description: string; calories: number | null };
export const SEED_DIET: { name: string; weekday: number; meals: SeedMeal[] }[] = [
  {
    name: "Dia de aula",
    weekday: 1,
    meals: [
      { kind: "cafe", description: "Café com leite e pão integral", calories: 280 },
      { kind: "lanche", description: "Fruta", calories: 90 },
      { kind: "almoco", description: "Arroz, feijão, frango e salada", calories: 600 },
      { kind: "lanche_tarde", description: "Iogurte com granola", calories: 150 },
      { kind: "janta", description: "Sopa ou sanduíche", calories: 350 },
    ],
  },
];

export const SEED_FINANCE = ["Transporte", "Alimentação", "Material de estudo", "Lazer"];
