// Calibración de pantalla: cuántos píxeles CSS ocupan 1 mm real.
// Los navegadores no exponen el tamaño físico de la pantalla, por eso
// el usuario compara contra un objeto de tamaño conocido.

export const CARD_WIDTH_MM = 53.98 // lado corto de una tarjeta ISO/IEC 7810 ID-1
export const CARD_HEIGHT_MM = 85.6
export const CARD_RADIUS_MM = 3.18
export const RULER_REFERENCE_MM = 50 // 5 cm en una regla

const STORAGE_KEY = 'medidor-anillos:calibracion'

/** Huella del entorno: si cambia (zoom, otra pantalla) la calibración ya no vale. */
export function screenFingerprint(win = window) {
  return `${win.screen?.width ?? 0}x${win.screen?.height ?? 0}@${win.devicePixelRatio ?? 1}`
}

/** Estimación sin calibrar: 96 ppp en escritorio, ~160 ppp en celulares. */
export function estimatePxPerMm(win = window) {
  const coarse = win.matchMedia?.('(pointer: coarse)').matches
  return (coarse ? 160 : 96) / 25.4
}

export function loadCalibration(storage = localStorage, win = window) {
  try {
    const data = JSON.parse(storage.getItem(STORAGE_KEY))
    if (!data || !(data.pxPerMm > 0)) return null
    return { ...data, stale: data.fingerprint !== screenFingerprint(win) }
  } catch {
    return null
  }
}

export function saveCalibration(pxPerMm, method, storage = localStorage, win = window) {
  const data = { pxPerMm, method, fingerprint: screenFingerprint(win), date: new Date().toISOString() }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Modo privado o almacenamiento lleno: la calibración vale solo esta sesión
  }
  return { ...data, stale: false }
}

export function clearCalibration(storage = localStorage) {
  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    // nada que hacer
  }
}
