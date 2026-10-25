/**
 * Os temas de cor do seletor (AppShell) e da Landing.
 * `color` é só a bolinha de amostra; as cores de verdade de cada tema
 * ficam em src/styles.css, no bloco `:root[data-color-theme="..."]`.
 */
export const THEMES = [
  { id: "estudia", label: "Estudia", color: "linear-gradient(135deg, #D6249F, #F7853B, #0F9488)" },
  { id: "rosa", label: "Rosa", color: "#E84C91" },
  { id: "verde-agua", label: "Verde-água", color: "#36B9A8" },
  { id: "roxo", label: "Roxo", color: "#8B5CF6" },
  { id: "azul", label: "Azul", color: "#3B82F6" },
  { id: "vermelho", label: "Vermelho", color: "#EF4444" },
] as const;

export type Theme = (typeof THEMES)[number]["id"];
