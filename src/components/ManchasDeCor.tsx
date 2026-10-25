/**
 * As manchas de cor desfocadas da Landing, reaproveitadas no fundo do planner.
 *
 * Usam as variáveis do tema (magenta, wine, laranja, pink e --glow-middle), então
 * acompanham o tema escolhido. Quem usa decide a posição pelo `className`.
 *
 * - `rodape` (Landing e telas de acesso): todas juntas no pé da tela.
 * - `cantos` (planner): magenta e verde-água no canto de cima à esquerda,
 *   laranja e rosa no canto de baixo à direita.
 */
export function ManchasDeCor({
  className = "",
  arranjo = "rodape",
  suavizarFim = false,
}: {
  className?: string;
  arranjo?: "rodape" | "cantos";
  /** Some em degradê no fim, para não fazer uma linha reta com o que vem embaixo. */
  suavizarFim?: boolean;
}) {
  if (arranjo === "cantos") {
    return (
      <div aria-hidden className={`pointer-events-none overflow-hidden ${className}`}>
        <div className="bg-magenta absolute -top-48 -left-40 h-[28rem] w-[34rem] rounded-full opacity-80 blur-[100px]" />
        <div className="bg-wine absolute -top-56 left-[4%] h-[24rem] w-[30rem] rounded-full opacity-60 blur-[100px]" />
        <div
          className="absolute right-[14%] -bottom-48 h-[22rem] w-[28rem] rounded-full blur-[100px]"
          style={{ background: "var(--glow-middle)" }}
        />
        <div className="bg-laranja absolute -right-24 -bottom-40 h-[28rem] w-[34rem] rounded-full opacity-80 blur-[100px]" />
        <div className="bg-pink absolute right-[18%] -bottom-56 h-[24rem] w-[30rem] rounded-full opacity-80 blur-[100px]" />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={`pointer-events-none overflow-hidden ${className}`}
      // O topo some aos poucos: sem isso, em telas mais baixas (ou com zoom) as
      // manchas batem na borda de cima e fica uma linha reta entre branco e cor.
      style={{
        maskImage: "linear-gradient(to bottom, transparent, black 45%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent, black 45%)",
      }}
    >
      <div className="bg-magenta absolute -bottom-24 -left-40 h-[26rem] w-[34rem] rounded-full opacity-90 blur-[90px]" />
      <div className="bg-wine absolute -bottom-56 left-[12%] h-[24rem] w-[30rem] rounded-full opacity-90 blur-[90px]" />
      <div
        className="absolute -bottom-40 left-[38%] h-[22rem] w-[30rem] rounded-full blur-[90px]"
        style={{ background: "var(--glow-middle)" }}
      />
      <div className="bg-laranja absolute right-[8%] -bottom-28 h-[26rem] w-[32rem] rounded-full opacity-90 blur-[90px]" />
      <div className="bg-pink absolute -right-40 bottom-0 h-[24rem] w-[28rem] rounded-full opacity-80 blur-[90px]" />
      {suavizarFim && (
        <div className="from-background absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent" />
      )}
    </div>
  );
}
