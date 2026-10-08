import { useRef, useState } from 'react'
import ActionBar from '../components/ActionBar'
import Icon from '../components/Icon'
import Stepper from '../components/Stepper'
import { useElementSize } from '../hooks/useElementSize'
import { CARD_RADIUS_MM, CARD_WIDTH_MM, RULER_REFERENCE_MM } from '../lib/calibration'

const MARGIN = 20 // px desde la esquina superior izquierda del área

/**
 * La esquina de la tarjeta se apoya ABAJO a la izquierda del área y la tarjeta
 * sobresale hacia arriba (sobre los textos, que ya se leyeron). Así nunca tapa
 * los controles de la zona del pulgar. Solo importa el ancho.
 */
function CardGuide({ ppm, height }) {
  const w = CARD_WIDTH_MM * ppm
  const r = CARD_RADIUS_MM * ppm
  const x = MARGIN
  const y = height - MARGIN
  const top = -10
  const outline = `M${x} ${top} V${y - r} Q${x} ${y} ${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y - r} V${top}`
  return (
    <>
      <path className="guide-fill" d={`${outline} Z`} />
      <path className="guide-line" d={outline} />
      <line className="guide-accent" x1={x + w} y1={top} x2={x + w} y2={y - r} />
      <text className="guide-text" x={x + w / 2} y={y - 54} textAnchor="middle">
        tarjeta aquí
      </text>
      <text className="guide-text small" x={x + w / 2} y={y - 32} textAnchor="middle">
        (en vertical, esquina en el punto)
      </text>
    </>
  )
}

function RulerGuide({ ppm }) {
  const y = MARGIN + 40
  const ticks = []
  for (let mm = 0; mm <= RULER_REFERENCE_MM; mm++) {
    const x = MARGIN + mm * ppm
    const len = mm % 10 === 0 ? 26 : mm % 5 === 0 ? 18 : 10
    ticks.push(<line key={mm} className={mm % 10 === 0 ? 'guide-line' : 'guide-tick'} x1={x} y1={y} x2={x} y2={y + len} />)
    if (mm % 10 === 0) {
      ticks.push(
        <text key={`t${mm}`} className="guide-text small" x={x} y={y + 44} textAnchor="middle">
          {mm / 10}
        </text>,
      )
    }
  }
  const end = MARGIN + RULER_REFERENCE_MM * ppm
  return (
    <>
      <line className="guide-line" x1={MARGIN} y1={y} x2={end} y2={y} />
      {ticks}
      <line className="guide-accent" x1={end} y1={y - 16} x2={end} y2={y + 30} />
      <text className="guide-text" x={end} y={y - 22} textAnchor="middle">
        5 cm
      </text>
    </>
  )
}

export default function Calibrate({ initialPxPerMm, canSkip, onDone, onSkip, onBack }) {
  const [method, setMethod] = useState('card')
  const [ppm, setPpm] = useState(initialPxPerMm)
  const stageRef = useRef(null)
  const { width, height } = useElementSize(stageRef)

  const referenceMm = method === 'card' ? CARD_WIDTH_MM : RULER_REFERENCE_MM
  // Rango del slider: lo que cabe en el ancho disponible
  const maxPpm = width ? Math.max(4, (width - MARGIN * 2) / referenceMm) : 12
  const fits = !width || referenceMm * ppm <= width - MARGIN

  return (
    <div className="screen">
      <header className="screen-head">
        <p className="eyebrow">Paso único · 30 segundos</p>
        <h1>Calibra tu pantalla</h1>
        <div className="segmented" role="tablist" aria-label="Objeto de referencia">
          <button type="button" role="tab" aria-selected={method === 'card'} onClick={() => setMethod('card')}>
            <Icon name="card" size={18} /> Tarjeta
          </button>
          <button type="button" role="tab" aria-selected={method === 'ruler'} onClick={() => setMethod('ruler')}>
            <Icon name="ruler" size={18} /> Regla
          </button>
        </div>
      </header>

      <div className="stage" ref={stageRef}>
        {width > 0 && (
          <svg width={width} height={height} className="stage-svg">
            <circle className="guide-anchor" cx={MARGIN} cy={method === 'card' ? height - MARGIN : MARGIN + 40} r="5" />
            {method === 'card' ? <CardGuide ppm={ppm} height={height} /> : <RulerGuide ppm={ppm} />}
          </svg>
        )}
      </div>

      <div className="controls">
        <p className="instructions">
          {method === 'card' ? (
            <>
              Apoya <strong>cualquier tarjeta</strong> (débito, crédito, cédula) en vertical, con su esquina inferior
              en el punto. Ajusta hasta que la <span className="accent">línea dorada</span> toque su borde derecho.
            </>
          ) : (
            <>
              Pon el <strong>0 de una regla</strong> en el punto. Ajusta hasta que la{' '}
              <span className="accent">línea dorada</span> quede justo en los <strong>5 cm</strong>.
            </>
          )}
        </p>
        {!fits && <p className="note warn">La guía no cabe: gira el celular o reduce el tamaño.</p>}
        <Stepper
          label="escala"
          value={ppm}
          onChange={setPpm}
          min={2}
          max={maxPpm}
          step={0.01}
          sliderStep={0.01}
          valueText={`${Math.round(referenceMm * ppm)} píxeles`}
        />
        <ActionBar onBack={onBack}>
          {canSkip && (
            <button type="button" className="btn btn-ghost" onClick={onSkip}>
              Omitir
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={() => onDone(ppm, method)}>
            <Icon name="check" size={20} /> Coincide
          </button>
        </ActionBar>
      </div>
    </div>
  )
}
