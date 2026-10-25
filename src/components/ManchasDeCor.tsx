/**
 * As manchas de cor desfocadas da Landing, reaproveitadas no fundo do planner.
 *
 * Usam as variáveis do tema (magenta, wine, laranja, pink e --glow-middle), então
 * acompanham o tema escolhido. Quem usa decide a posição pelo `className`.
 *
 * - `rodape` (Landing e telas de acesso): todas juntas no pé da tela.
 * - `cantos` (planner): magenta e verde-água no canto de cima à direita,
 *   laranja e rosa no canto de baixo à esquerda (o canto de cima à esquerda fica
 *   livre para os títulos das abas).
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
        {/* No celular as manchas são menores, senão cobrem a tela inteira */}
        <div className="bg-magenta absolute -top-32 -right-28 h-[16rem] w-[18rem] rounded-full opacity-70 blur-[60px] md:-top-48 md:-right-40 md:h-[28rem] md:w-[34rem] md:opacity-80 md:blur-[100px]" />
        <div className="bg-wine absolute -top-36 right-[10%] h-[13rem] w-[16rem] rounded-full opacity-50 blur-[60px] md:-top-56 md:right-[4%] md:h-[24rem] md:w-[30rem] md:opacity-60 md:blur-[100px]" />
        <div
          className="absolute -bottom-32 left-[20%] h-[12rem] w-[15rem] rounded-full blur-[60px] md:-bottom-48 md:left-[14%] md:h-[22rem] md:w-[28rem] md:blur-[100px]"
          style={{ background: "var(--glow-middle)" }}
        />
        <div className="bg-laranja absolute -bottom-28 -left-24 h-[16rem] w-[18rem] rounded-full opacity-70 blur-[60px] md:-bottom-40 md:-left-24 md:h-[28rem] md:w-[34rem] md:opacity-80 md:blur-[100px]" />
        <div className="bg-pink absolute -bottom-36 left-[10%] h-[13rem] w-[16rem] rounded-full opacity-70 blur-[60px] md:-bottom-56 md:left-[18%] md:h-[24rem] md:w-[30rem] md:opacity-80 md:blur-[100px]" />
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
