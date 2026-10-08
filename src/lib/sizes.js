// Tabla "Tallas y equivalencias" (diámetro interior en mm y talla USA).
// T = talla usada en Colombia/España, mm = diámetro interior del anillo.
export const SIZES = [
  { t: 1, mm: 13.0, usa: 1 },
  { t: 2, mm: 13.4, usa: 2 },
  { t: 3, mm: 13.7, usa: 2.5 },
  { t: 4, mm: 14.0, usa: 3 },
  { t: 5, mm: 14.3, usa: 3.5 },
  { t: 6, mm: 14.6, usa: 3.75 },
  { t: 7, mm: 15.0, usa: 4 },
  { t: 8, mm: 15.3, usa: 4.5 },
  { t: 9, mm: 15.6, usa: 5 },
  { t: 10, mm: 15.9, usa: 5.5 },
  { t: 11, mm: 16.2, usa: 5.75 },
  { t: 12, mm: 16.5, usa: 6 },
  { t: 13, mm: 16.8, usa: 6.5 },
  { t: 14, mm: 17.2, usa: 7 },
  { t: 15, mm: 17.5, usa: 7.5 },
  { t: 16, mm: 17.8, usa: 7.75 },
  { t: 17, mm: 18.1, usa: 8 },
  { t: 18, mm: 18.4, usa: 8.5 },
  { t: 19, mm: 18.8, usa: 8.75 },
  { t: 20, mm: 19.1, usa: 9 },
  { t: 21, mm: 19.4, usa: 9.5 },
  { t: 22, mm: 19.7, usa: 10 },
  { t: 23, mm: 20.0, usa: 10.5 },
  { t: 24, mm: 20.3, usa: 10.75 },
  { t: 25, mm: 20.6, usa: 11 },
  { t: 26, mm: 21.0, usa: 11.5 },
  { t: 27, mm: 21.3, usa: 12 },
  { t: 28, mm: 21.6, usa: 12.5 },
  { t: 29, mm: 22.0, usa: 12.75 },
  { t: 30, mm: 22.3, usa: 13 },
  { t: 31, mm: 22.6, usa: 13.5 },
  { t: 32, mm: 22.9, usa: 13.75 },
  { t: 33, mm: 23.2, usa: 14 },
  { t: 34, mm: 23.5, usa: 14.5 },
  { t: 35, mm: 23.9, usa: 15 },
  { t: 36, mm: 24.2, usa: 15.5 },
]

export const MIN_MM = SIZES[0].mm
export const MAX_MM = SIZES[SIZES.length - 1].mm

// Margen dentro del cual una medida se considera "exacta" para una talla.
// La tabla avanza ~0,3 mm por talla, así que 0,1 mm es menos de media talla.
export const EXACT_TOLERANCE_MM = 0.1

export const diameterFromCircumference = (c) => c / Math.PI
export const circumferenceFromDiameter = (d) => d * Math.PI

export const sizeByT = (t) => SIZES.find((s) => s.t === t)

/** Talla cuyo diámetro está más cerca de `mm`. */
export function nearestSize(mm) {
  let best = SIZES[0]
  for (const s of SIZES) {
    if (Math.abs(s.mm - mm) < Math.abs(best.mm - mm)) best = s
  }
  return best
}

/**
 * Interpreta una medida y devuelve la talla recomendada.
 * Regla: si la medida cae entre dos tallas se recomienda la MAYOR,
 * porque un anillo un poco holgado se puede usar (o ajustar con un
 * reductor) pero uno apretado no pasa por el nudillo.
 */
export function analyzeDiameter(mm) {
  const nearest = nearestSize(mm)

  if (mm < MIN_MM - EXACT_TOLERANCE_MM) {
    return { status: 'below', recommended: SIZES[0], lower: null, upper: SIZES[0], mm }
  }
  if (mm > MAX_MM + EXACT_TOLERANCE_MM) {
    return { status: 'above', recommended: SIZES[SIZES.length - 1], lower: SIZES[SIZES.length - 1], upper: null, mm }
  }
  if (Math.abs(nearest.mm - mm) <= EXACT_TOLERANCE_MM + 1e-9) {
    return { status: 'exact', recommended: nearest, lower: nearest, upper: nearest, mm }
  }

  const upperIndex = SIZES.findIndex((s) => s.mm > mm)
  const upper = SIZES[upperIndex]
  const lower = SIZES[upperIndex - 1]
  return { status: 'between', recommended: upper, lower, upper, mm }
}

/** Talla siguiente/anterior respecto a un diámetro (para saltar talla a talla). */
export function stepSize(mm, direction) {
  if (direction > 0) return SIZES.find((s) => s.mm > mm + 0.01) ?? SIZES[SIZES.length - 1]
  return [...SIZES].reverse().find((s) => s.mm < mm - 0.01) ?? SIZES[0]
}

/** Busca tallas por texto: "17", "t17", "18,1", "8 usa", "8.5"... */
export function searchSizes(query) {
  const q = query.trim().toLowerCase().replace(',', '.')
  if (!q) return SIZES

  const tMatch = q.match(/^t\s*(\d+)$/)
  if (tMatch) return SIZES.filter((s) => s.t === Number(tMatch[1]))

  const usaMatch = q.match(/^(\d+(?:\.\d+)?)\s*usa$/)
  if (usaMatch) {
    const n = Number(usaMatch[1])
    return SIZES.filter((s) => Math.floor(s.usa) === Math.floor(n) && (n % 1 === 0 || s.usa === n))
  }

  const mmMatch = q.match(/^(\d+(?:\.\d+)?)\s*(mm)?$/)
  if (mmMatch) {
    const n = Number(mmMatch[1])
    // Números entre 13 y 25 con "mm" o con decimales se leen como diámetro
    if (mmMatch[2] || (!Number.isInteger(n) && n >= 12)) {
      return [nearestSize(n)]
    }
    return SIZES.filter((s) => s.t === n || Math.floor(s.usa) === n || Math.round(s.mm) === n)
  }
  return []
}
