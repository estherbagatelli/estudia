import type { HobbyKind, MealKind } from "@/types/models";

/** Conteúdo inicial do planner — semeado no primeiro login de cada usuário. */

export const SEED_QUOTES = [
  "All in God's Hands",
  "Tudo posso naquele que me fortalece",
  "Você é capaz de tudo que quiser",
  "Deus é a esperança em meio a tempestade",
];

export const SEED_STUDY: { name: string; subtitle: string; topics: string[] }[] = [
  {
    name: "Faculdade",
    subtitle: "Ciência da Computação",
    topics: [
      "Informática Básica — Sistemas Operacionais",
      "Informática Básica — Organização de arquivos",
      "Informática Básica — Internet e Segurança",
      "Informática Básica — Ferramentas de produtividade",
      "Pacote Office — Word",
      "Pacote Office — Excel",
      "Pacote Office — PowerPoint",
      "Java — Lógica aplicada",
      "Java — Sintaxe",
      "Java — POO",
      "Java — Estruturas de Dados",
      "Java — Banco de Dados",
    ],
  },
  {
    name: "Estágio",
    subtitle: "UI/UX + Front-end",
    topics: [
      "Lógica de Programação — Algoritmos",
      "Lógica de Programação — Estruturas de decisão",
      "Lógica de Programação — Repetição",
      "Lógica de Programação — Funções",
      "Vibe Coding — Conceitos",
      "Vibe Coding — Engenharia de Prompt",
      "Vibe Coding — IA aplicada",
      "No-Code — Conceitos",
      "No-Code — Ferramentas",
      "No-Code — Fluxo",
      "Lovable — Interface",
      "Lovable — Estrutura",
      "Lovable — Criação",
      "Lovable — Componentes",
      "Lovable — Prompts",
      "Lovable — Publicação",
      "Engenharia de Software — Levantamento",
      "Engenharia de Software — Requisitos",
      "Engenharia de Software — Casos de Uso",
      "Engenharia de Software — Histórias de Usuário",
      "Metodologias Ágeis — Scrum",
      "Metodologias Ágeis — Kanban",
      "Metodologias Ágeis — Sprint",
      "Metodologias Ágeis — Backlog",
      "Metodologias Ágeis — Product Owner",
      "UI Design — Hierarquia",
      "UI Design — Tipografia",
      "UI Design — Cores",
      "UI Design — Grid",
      "UI Design — Gestalt",
      "UI Design — Design Systems",
      "UI Design — Responsividade",
      "UX Design — Usabilidade",
      "UX Design — Pesquisa",
      "UX Design — Personas",
      "UX Design — Jornada",
      "UX Design — Wireframes",
      "UX Design — Protótipos",
      "UX Design — Testes",
      "Ferramentas de Design — Figma",
      "Front-end — HTML",
      "Front-end — CSS",
      "Front-end — JavaScript",
    ],
  },
];

type SeedExercise = { name: string; sets: number; reps: string };
export const SEED_WORKOUTS: { name: string; focus: string; weekday: number; exercises: SeedExercise[] }[] = [
  { name: "Segunda", focus: "Peitoral", weekday: 1, exercises: [
    { name: "Wall slide", sets: 2, reps: "15" },
    { name: "Supino reto", sets: 3, reps: "10" },
    { name: "Supino inclinado", sets: 3, reps: "10" },
    { name: "Desenvolvimento máquina", sets: 3, reps: "10" },
    { name: "Tríceps francês", sets: 3, reps: "10" },
    { name: "Elevação lateral", sets: 3, reps: "10" },
    { name: "Elevação frontal", sets: 3, reps: "10" },
    { name: "Prancha ventral", sets: 3, reps: "30" },
  ] },
  { name: "Terça", focus: "Glúteo e Quadríceps", weekday: 2, exercises: [
    { name: "Cadeira abdutora (aquecimento)", sets: 2, reps: "15" },
    { name: "Cadeira extensora", sets: 3, reps: "12" },
    { name: "Step Up na polia", sets: 3, reps: "12 cada perna" },
    { name: "Abdução na polia em pé", sets: 3, reps: "15 cada perna" },
    { name: "Leg press 45°", sets: 3, reps: "10" },
    { name: "Mesa flexora", sets: 3, reps: "12" },
    { name: "Elevação pélvica com barra", sets: 3, reps: "12" },
    { name: "Afundo búlgaro", sets: 3, reps: "10 cada perna" },
  ] },
  { name: "Quarta", focus: "Dorsais", weekday: 3, exercises: [
    { name: "Rotação interna ombro polia alta", sets: 3, reps: "10" },
    { name: "Puxada articulada", sets: 3, reps: "10" },
    { name: "Pulley frente com triângulo", sets: 3, reps: "10" },
    { name: "Remada curvada barra fechada", sets: 3, reps: "10" },
    { name: "Crucifixo invertido", sets: 3, reps: "10" },
    { name: "Rosca direta na polia", sets: 3, reps: "10" },
    { name: "Remada aberta máquina", sets: 3, reps: "10" },
    { name: "Pallof press", sets: 3, reps: "10" },
  ] },
  { name: "Quinta", focus: "Inferiores", weekday: 4, exercises: [
    { name: "Retração escapular remada baixa", sets: 2, reps: "15" },
    { name: "Recuo no smith", sets: 3, reps: "10" },
    { name: "Agachamento barra hexagonal", sets: 3, reps: "10" },
    { name: "Stiff com halter", sets: 3, reps: "10" },
    { name: "Cadeira flexora", sets: 3, reps: "10" },
    { name: "Panturrilha no leg press", sets: 3, reps: "10" },
  ] },
  { name: "Sexta", focus: "Braços e Core", weekday: 5, exercises: [
    { name: "Rosca alternada", sets: 3, reps: "12" },
    { name: "Face pull", sets: 3, reps: "15" },
    { name: "Retração escapular", sets: 3, reps: "15" },
    { name: "Tríceps corda polia", sets: 3, reps: "12" },
    { name: "Rosca martelo", sets: 3, reps: "12" },
    { name: "Abdominal máquina", sets: 3, reps: "15" },
    { name: "Prancha lateral", sets: 3, reps: "30s cada" },
    { name: "Abdominal bicicleta", sets: 3, reps: "20" },
  ] },
];

type SeedMeal = { kind: MealKind; description: string; calories: number | null };
export const SEED_DIET: { name: string; weekday: number; meals: SeedMeal[] }[] = [
  { name: "Segunda", weekday: 1, meals: [
    { kind: "cafe", description: "Shake de morango", calories: 250 },
    { kind: "lanche", description: "Bolinho fit + maçã (170) ou Pipoca + uvas (140)", calories: null },
    { kind: "pre_treino", description: "Banana", calories: 90 },
    { kind: "almoco", description: "Marmita fit congelada", calories: null },
    { kind: "lanche_tarde", description: "Iogurte + granola (150) ou Mingau (250)", calories: null },
    { kind: "janta", description: "Pizza fit Rap10", calories: 420 },
  ] },
  { name: "Terça", weekday: 2, meals: [
    { kind: "cafe", description: "Shake whey chocolate + ovos mexidos", calories: 350 },
    { kind: "lanche", description: "Sanduíche natural (180) ou Pão com ovo (160)", calories: null },
    { kind: "pre_treino", description: "Banana", calories: 90 },
    { kind: "almoco", description: "Marmita fit congelada", calories: null },
    { kind: "lanche_tarde", description: "Gelatina zero + leite condensado", calories: 100 },
    { kind: "janta", description: "Sanduíche integral", calories: 350 },
  ] },
  { name: "Quarta", weekday: 3, meals: [
    { kind: "cafe", description: "Shake whey chocolate + ovos mexidos", calories: 350 },
    { kind: "lanche", description: "Pipoca + uvas (140) ou Bolinho + maçã (170)", calories: null },
    { kind: "pre_treino", description: "Banana + aveia", calories: 120 },
    { kind: "almoco", description: "Marmita fit congelada", calories: null },
    { kind: "lanche_tarde", description: "Iogurte + uvas (140) ou Mingau (250)", calories: null },
    { kind: "janta", description: "Pizza fit Rap10", calories: 420 },
  ] },
  { name: "Quinta", weekday: 4, meals: [
    { kind: "cafe", description: "Shake whey + ovos + pão", calories: 510 },
    { kind: "almoco", description: "Frango grelhado + macarrão + salada", calories: 400 },
    { kind: "lanche", description: "Gelatina", calories: 100 },
    { kind: "janta", description: "Hambúrguer de frango + pão", calories: 370 },
  ] },
  { name: "Sexta", weekday: 5, meals: [
    { kind: "cafe", description: "Iogurte morango + banana + aveia", calories: 270 },
    { kind: "almoco", description: "Músculo + purê + salada", calories: 420 },
    { kind: "lanche", description: "Iogurte + doce de leite zero", calories: 160 },
    { kind: "janta", description: "Pizza fit", calories: 420 },
  ] },
  { name: "Sábado", weekday: 6, meals: [
    { kind: "cafe", description: "Pão + requeijão + suco", calories: 290 },
    { kind: "almoco", description: "Frango + macarrão + salada", calories: 400 },
    { kind: "lanche", description: "Gelatina (100) ou Mingau (250)", calories: null },
    { kind: "janta", description: "Hambúrguer patinho + pão", calories: 400 },
  ] },
  { name: "Domingo", weekday: 0, meals: [
    { kind: "cafe", description: "Pão + frango + requeijão + maçã", calories: 310 },
    { kind: "almoco", description: "Strogonoff + macarrão", calories: 450 },
    { kind: "lanche", description: "Iogurte + uvas", calories: 140 },
    { kind: "janta", description: "Pizza fit", calories: 420 },
  ] },
];

export const SEED_FINANCE = ["Despesas Estágio", "Dinheiro Pai", "Despesas Mãe"];

// tipos re-exportados para uso no dashboard
export type { HobbyKind };
