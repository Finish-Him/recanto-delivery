/**
 * BrandDecorations — Elementos decorativos sutis baseados na identidade visual
 * do Recanto do Açaí: círculos roxos, pontos dourados e ondas suaves.
 */
export function MemphisShapes() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {/* Grande círculo roxo - canto superior direito */}
      <div
        className="absolute rounded-full opacity-[0.07]"
        style={{ width: 400, height: 400, top: -120, right: -120, background: "oklch(0.38 0.22 305)" }}
      />
      {/* Círculo roxo médio - canto inferior esquerdo */}
      <div
        className="absolute rounded-full opacity-[0.07]"
        style={{ width: 300, height: 300, bottom: -80, left: -80, background: "oklch(0.38 0.22 305)" }}
      />
      {/* Pontos dourados - lado esquerdo */}
      <svg className="absolute opacity-[0.18]" style={{ top: "22%", left: 16 }} width="72" height="72" viewBox="0 0 72 72" fill="none">
        {[0,1,2,3].map(row => [0,1,2,3].map(col => (
          <circle key={`${row}-${col}`} cx={col*18+9} cy={row*18+9} r="3.5" fill="oklch(0.77 0.19 90)" />
        )))}
      </svg>
      {/* Pontos dourados - lado direito */}
      <svg className="absolute opacity-[0.18]" style={{ bottom: "28%", right: 16 }} width="72" height="72" viewBox="0 0 72 72" fill="none">
        {[0,1,2,3].map(row => [0,1,2,3].map(col => (
          <circle key={`${row}-${col}`} cx={col*18+9} cy={row*18+9} r="3.5" fill="oklch(0.77 0.19 90)" />
        )))}
      </svg>
      {/* Anel roxo decorativo - meio direito */}
      <svg className="absolute opacity-[0.06]" style={{ top: "40%", right: -30 }} width="160" height="160" viewBox="0 0 160 160" fill="none">
        <circle cx="80" cy="80" r="70" stroke="oklch(0.38 0.22 305)" strokeWidth="20" fill="none" />
      </svg>
      {/* Anel dourado - meio esquerdo */}
      <svg className="absolute opacity-[0.08]" style={{ top: "55%", left: -20 }} width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" stroke="oklch(0.77 0.19 90)" strokeWidth="14" fill="none" />
      </svg>
    </div>
  );
}
