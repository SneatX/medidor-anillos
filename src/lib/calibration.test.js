import { describe, expect, it } from 'vitest'
import { loadCalibration, saveCalibration, screenFingerprint } from './calibration'
import { createEntry, loadSaved, persistSaved } from './saved'

function memoryStorage() {
  const data = {}
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v)
    },
    removeItem: (k) => delete data[k],
  }
}

const fakeWindow = (dpr = 2) => ({ screen: { width: 390, height: 844 }, devicePixelRatio: dpr })

describe('calibración', () => {
  it('guarda y recupera px/mm', () => {
    const storage = memoryStorage()
    saveCalibration(6.3, 'card', storage, fakeWindow())
    const c = loadCalibration(storage, fakeWindow())
    expect(c.pxPerMm).toBe(6.3)
    expect(c.method).toBe('card')
    expect(c.stale).toBe(false)
  })

  it('marca la calibración como vencida si cambia el zoom o la pantalla', () => {
    const storage = memoryStorage()
    saveCalibration(6.3, 'card', storage, fakeWindow(2))
    expect(loadCalibration(storage, fakeWindow(3)).stale).toBe(true)
  })

  it('ignora datos corruptos', () => {
    const storage = memoryStorage()
    storage.setItem('medidor-anillos:calibracion', '{no es json')
    expect(loadCalibration(storage, fakeWindow())).toBeNull()
  })

  it('la huella incluye resolución y densidad', () => {
    expect(screenFingerprint(fakeWindow(2))).toBe('390x844@2')
  })
})

describe('tallas guardadas', () => {
  it('persiste la lista', () => {
    const storage = memoryStorage()
    const e = createEntry({ label: '  Mamá ', mm: 17.234, t: 14, method: 'ring' })
    expect(e.label).toBe('Mamá')
    expect(e.mm).toBe(17.23)
    persistSaved([e], storage)
    expect(loadSaved(storage)).toEqual([e])
  })

  it('nombre vacío queda como "Sin nombre"', () => {
    expect(createEntry({ label: ' ', mm: 18, t: 17, method: 'finger' }).label).toBe('Sin nombre')
  })
})
