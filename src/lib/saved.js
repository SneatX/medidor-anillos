const STORAGE_KEY = 'medidor-anillos:tallas'

export function loadSaved(storage = localStorage) {
  try {
    const list = JSON.parse(storage.getItem(STORAGE_KEY))
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function persistSaved(list, storage = localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // sin almacenamiento disponible: la lista vive solo en memoria
  }
}

export function createEntry({ label, mm, t, method }) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: label.trim() || 'Sin nombre',
    mm: Math.round(mm * 100) / 100,
    t,
    method,
    date: new Date().toISOString(),
  }
}
