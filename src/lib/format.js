const nf = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** 18.1 -> "18,1" */
export const formatMm = (mm) => nf.format(mm)

const FRACTIONS = { 0.25: '¼', 0.5: '½', 0.75: '¾' }

/** 8.75 -> "8 ¾" */
export function formatUsa(usa) {
  const whole = Math.floor(usa)
  const frac = FRACTIONS[usa - whole]
  return frac ? `${whole} ${frac}` : String(whole)
}
