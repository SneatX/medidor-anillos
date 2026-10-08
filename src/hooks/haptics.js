/** Vibración corta (Android). En iOS/escritorio simplemente no hace nada. */
export function tick(ms = 8) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    // sin soporte
  }
}
