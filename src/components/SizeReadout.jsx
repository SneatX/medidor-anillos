import { formatMm, formatUsa } from '../lib/format'

/** Lectura en vivo de la medida actual: talla, diámetro y equivalencia USA. */
export default function SizeReadout({ analysis }) {
  const { status, recommended, lower, upper, mm } = analysis
  let hint
  if (status === 'exact') hint = <span className="chip chip-ok">Talla exacta</span>
  else if (status === 'between')
    hint = (
      <span className="chip">
        Entre T{lower.t} y T{upper.t}
      </span>
    )
  else hint = <span className="chip chip-warn">{status === 'below' ? 'Menor que T1' : 'Mayor que T36'}</span>

  return (
    <div className="readout" aria-live="polite">
      <div className="readout-main">
        <span className="readout-t">T {recommended.t}</span>
        <span className="readout-sub">
          Ø {formatMm(mm)} mm · {formatUsa(recommended.usa)} USA
        </span>
      </div>
      {hint}
    </div>
  )
}
