import { describe, expect, it } from 'vitest'
import {
  SIZES,
  analyzeDiameter,
  circumferenceFromDiameter,
  diameterFromCircumference,
  nearestSize,
  searchSizes,
  stepSize,
} from './sizes'
import { formatMm, formatUsa } from './format'

describe('tabla de tallas', () => {
  it('tiene las 36 tallas de la tabla, ordenadas y crecientes', () => {
    expect(SIZES).toHaveLength(36)
    SIZES.forEach((s, i) => {
      expect(s.t).toBe(i + 1)
      if (i > 0) {
        expect(s.mm).toBeGreaterThan(SIZES[i - 1].mm)
        expect(s.usa).toBeGreaterThan(SIZES[i - 1].usa)
      }
    })
  })

  it('coincide con valores puntuales de la imagen de referencia', () => {
    expect(SIZES[0]).toEqual({ t: 1, mm: 13, usa: 1 })
    expect(SIZES[16]).toEqual({ t: 17, mm: 18.1, usa: 8 })
    expect(SIZES[35]).toEqual({ t: 36, mm: 24.2, usa: 15.5 })
  })
})

describe('conversiones', () => {
  it('convierte circunferencia <-> diámetro', () => {
    expect(diameterFromCircumference(Math.PI * 18.1)).toBeCloseTo(18.1)
    expect(circumferenceFromDiameter(20)).toBeCloseTo(62.83, 2)
  })

  it('formatea con coma decimal y fracciones USA', () => {
    expect(formatMm(18.1)).toBe('18,1')
    expect(formatMm(13)).toBe('13,0')
    expect(formatUsa(8)).toBe('8')
    expect(formatUsa(8.5)).toBe('8 ½')
    expect(formatUsa(3.75)).toBe('3 ¾')
  })
})

describe('analyzeDiameter', () => {
  it('reconoce una medida exacta (±0,1 mm)', () => {
    const r = analyzeDiameter(18.15)
    expect(r.status).toBe('exact')
    expect(r.recommended.t).toBe(17)
  })

  it('entre dos tallas recomienda la mayor', () => {
    const r = analyzeDiameter(18.25)
    expect(r.status).toBe('between')
    expect(r.lower.t).toBe(17)
    expect(r.upper.t).toBe(18)
    expect(r.recommended.t).toBe(18)
  })

  it('marca medidas fuera de la tabla', () => {
    expect(analyzeDiameter(11).status).toBe('below')
    expect(analyzeDiameter(26).status).toBe('above')
    expect(analyzeDiameter(26).recommended.t).toBe(36)
  })

  it('los extremos de la tabla son exactos', () => {
    expect(analyzeDiameter(13).status).toBe('exact')
    expect(analyzeDiameter(24.2).recommended.t).toBe(36)
  })
})

describe('navegación por tallas', () => {
  it('nearestSize elige la más cercana', () => {
    expect(nearestSize(17.0).t).toBe(13)
    expect(nearestSize(17.1).t).toBe(14)
  })

  it('stepSize salta a la talla siguiente/anterior', () => {
    expect(stepSize(18.1, 1).t).toBe(18)
    expect(stepSize(18.1, -1).t).toBe(16)
    expect(stepSize(18.2, -1).t).toBe(17)
    expect(stepSize(24.2, 1).t).toBe(36)
    expect(stepSize(13, -1).t).toBe(1)
  })
})

describe('searchSizes', () => {
  it('vacío devuelve todo', () => {
    expect(searchSizes('  ')).toHaveLength(36)
  })
  it('busca por talla T', () => {
    expect(searchSizes('T17').map((s) => s.t)).toEqual([17])
    expect(searchSizes('t 5').map((s) => s.t)).toEqual([5])
  })
  it('busca por milímetros', () => {
    expect(searchSizes('18,1').map((s) => s.t)).toEqual([17])
    expect(searchSizes('20 mm').map((s) => s.t)).toEqual([23])
  })
  it('busca por USA', () => {
    expect(searchSizes('8 usa').map((s) => s.t)).toEqual([17, 18, 19])
    expect(searchSizes('8,5 usa').map((s) => s.t)).toEqual([18])
  })
  it('texto sin sentido no devuelve nada', () => {
    expect(searchSizes('hola')).toEqual([])
  })
})
