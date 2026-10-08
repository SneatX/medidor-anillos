import { formatMm, formatUsa } from './format'

export function shareText(t, mm, usa, label) {
  const who = label ? `${label}: ` : ''
  return `${who}talla de anillo T ${t} (Ø ${formatMm(mm)} mm · ${formatUsa(usa)} USA)`
}

export async function shareOrCopy(text) {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Talla de anillo', text })
      return 'shared'
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
