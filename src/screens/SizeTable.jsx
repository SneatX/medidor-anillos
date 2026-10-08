import { useState } from 'react'
import Icon from '../components/Icon'
import { formatMm, formatUsa } from '../lib/format'
import { circumferenceFromDiameter, searchSizes } from '../lib/sizes'

export default function SizeTable({ pxPerMm, highlightT }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(highlightT ?? null)
  const rows = searchSizes(query)

  return (
    <div className="screen">
      <header className="screen-head compact">
        <h1>Tallas y equivalencias</h1>
        <p className="note">Toca una talla para verla a tamaño real y compararla con un anillo.</p>
      </header>

      <div className="scroll-area table-area">
        <div className="size-row head" aria-hidden="true">
          <span>Talla</span>
          <span>Diámetro</span>
          <span>USA</span>
          <span>Contorno</span>
        </div>
        <ul className="size-list">
          {rows.map((s) => (
            <li key={s.t}>
              <button
                type="button"
                className={`size-row ${s.t === highlightT ? 'highlight' : ''} ${open === s.t ? 'open' : ''}`}
                aria-expanded={open === s.t}
                onClick={() => setOpen(open === s.t ? null : s.t)}
              >
                <span className="cell-t">T {s.t}</span>
                <span>{formatMm(s.mm)} mm</span>
                <span>{formatUsa(s.usa)}</span>
                <span>{formatMm(circumferenceFromDiameter(s.mm))} mm</span>
              </button>
              {open === s.t && (
                <div className="real-size">
                  <svg width={s.mm * pxPerMm + 8} height={s.mm * pxPerMm + 8} aria-label={`Círculo real de T ${s.t}`}>
                    <circle
                      cx={(s.mm * pxPerMm) / 2 + 4}
                      cy={(s.mm * pxPerMm) / 2 + 4}
                      r={(s.mm * pxPerMm) / 2}
                      className="ring-edge"
                    />
                  </svg>
                  <p className="note">Pon un anillo encima: si el círculo llena justo el hueco, es la T {s.t}.</p>
                </div>
              )}
            </li>
          ))}
          {rows.length === 0 && <li className="empty">No hay tallas para "{query}". Prueba "T17", "18,1" u "8 usa".</li>}
        </ul>
      </div>

      {/* Buscador abajo: al alcance del pulgar y junto al teclado */}
      <div className="controls search-bar">
        <label className="search">
          <Icon name="search" size={20} />
          <input
            type="search"
            inputMode="decimal"
            placeholder="Busca: T17, 18,1 mm, 8 usa"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar talla"
          />
        </label>
      </div>
    </div>
  )
}
