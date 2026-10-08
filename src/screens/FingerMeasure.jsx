import { useRef } from 'react'
import ActionBar from '../components/ActionBar'
import CalibrationBanner from '../components/CalibrationBanner'
import Icon from '../components/Icon'
import SizeReadout from '../components/SizeReadout'
import Stepper from '../components/Stepper'
import { useElementSize } from '../hooks/useElementSize'
import { formatMm } from '../lib/format'
import { analyzeDiameter, diameterFromCircumference } from '../lib/sizes'

const STEPS = [
  {
    title: 'Corta una tira',
    text: 'De papel o un hilo que no estire, de unos 10 cm.',
    art: (
      <svg viewBox="0 0 120 70" className="step-art" aria-hidden="true">
        <rect x="10" y="28" width="100" height="14" rx="2" className="art-paper" />
        <path d="M84 12l12 46M96 12 84 58" className="art-scissors" />
      </svg>
    ),
  },
  {
    title: 'Rodea tu dedo',
    text: 'En la base del dedo, firme pero sin apretar. Marca donde se cruza.',
    art: (
      <svg viewBox="0 0 120 70" className="step-art" aria-hidden="true">
        <rect x="42" y="4" width="36" height="66" rx="18" className="art-finger" />
        <ellipse cx="60" cy="44" rx="22" ry="6" className="art-band" />
        <circle cx="80" cy="44" r="3.5" className="art-mark" />
      </svg>
    ),
  },
  {
    title: 'Mide hasta la marca',
    text: 'Con una regla o con la regla de la pantalla. Esa es la circunferencia.',
    art: (
      <svg viewBox="0 0 120 70" className="step-art" aria-hidden="true">
        <rect x="8" y="34" width="104" height="22" rx="2" className="art-ruler" />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={14 + i * 9.2} y1="34" x2={14 + i * 9.2} y2={i % 5 === 0 ? 46 : 41} className="art-stroke" />
        ))}
        <rect x="14" y="22" width="70" height="8" rx="1" className="art-paper" />
        <circle cx="84" cy="26" r="3.5" className="art-mark" />
      </svg>
    ),
  },
]

function HowTo({ onContinue, onBack }) {
  return (
    <div className="screen">
      <header className="screen-head">
        <p className="eyebrow">Sin anillo</p>
        <h1>Mide tu dedo</h1>
        <p className="lead">Hazlo al final del día: los dedos se hinchan un poco con el calor y la actividad.</p>
      </header>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s.title} className="step">
            {s.art}
            <div>
              <h2>
                <span className="step-num">{i + 1}</span> {s.title}
              </h2>
              <p>{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="controls">
        <ActionBar onBack={onBack}>
          <button type="button" className="btn btn-primary" onClick={onContinue}>
            Ya la tengo marcada <Icon name="next" size={20} />
          </button>
        </ActionBar>
      </div>
    </div>
  )
}

const RULER_TOP = 18

function ScreenRuler({ circumference, pxPerMm }) {
  const ref = useRef(null)
  const { width, height } = useElementSize(ref)
  const maxMm = Math.floor((height - RULER_TOP - 8) / pxPerMm)
  const ticks = []
  for (let mm = 0; mm <= maxMm; mm++) {
    const y = RULER_TOP + mm * pxPerMm
    const len = mm % 10 === 0 ? 30 : mm % 5 === 0 ? 20 : 11
    ticks.push(<line key={mm} x1={0} y1={y} x2={len} y2={y} className={mm % 10 === 0 ? 'tick-major' : 'tick'} />)
    if (mm % 10 === 0 && mm > 0)
      ticks.push(
        <text key={`l${mm}`} x={36} y={y + 5} className="tick-label ruler-num">
          {mm / 10}
        </text>,
      )
  }
  const markerY = RULER_TOP + circumference * pxPerMm
  const fits = circumference <= maxMm

  return (
    <div className="stage stage-dark" ref={ref}>
      {width > 0 && (
        <svg width={width} height={height} className="stage-svg">
          <rect x={0} y={RULER_TOP} width={56} height={height} className="ruler-body" />
          <line x1={0} y1={RULER_TOP} x2={width} y2={RULER_TOP} className="zero-line" />
          <text x={64} y={RULER_TOP - 4} className="tick-label">
            0 — pon aquí el inicio de la tira
          </text>
          {ticks}
          {fits && (
            <>
              <line x1={0} y1={markerY} x2={width} y2={markerY} className="marker-line" />
              <text x={width - 12} y={markerY - 8} textAnchor="end" className="marker-label">
                {formatMm(circumference)} mm — tu marca aquí
              </text>
            </>
          )}
        </svg>
      )}
      {!fits && height > 0 && (
        <p className="stage-hint bottom">No cabe en la pantalla: usa una regla física o gira el celular.</p>
      )}
    </div>
  )
}

export default function FingerMeasure({
  circumference,
  setCircumference,
  phase,
  setPhase,
  tool,
  setTool,
  pxPerMm,
  calibration,
  onCalibrate,
  onDone,
  onBack,
}) {
  const mm = diameterFromCircumference(circumference)
  const analysis = analyzeDiameter(mm)
  const calibrated = calibration && !calibration.stale

  if (phase === 'howto') return <HowTo onContinue={() => setPhase('measure')} onBack={onBack} />

  return (
    <div className="screen">
      <header className="screen-head compact">
        <div className="segmented" role="tablist" aria-label="Cómo vas a medir la tira">
          <button type="button" role="tab" aria-selected={tool === 'ruler'} onClick={() => setTool('ruler')}>
            <Icon name="ruler" size={18} /> Tengo regla
          </button>
          <button type="button" role="tab" aria-selected={tool === 'screen'} onClick={() => setTool('screen')}>
            <Icon name="target" size={18} /> Regla en pantalla
          </button>
        </div>
      </header>

      {tool === 'screen' ? (
        <>
          {!calibrated && <CalibrationBanner onCalibrate={onCalibrate} stale={calibration?.stale} />}
          <ScreenRuler circumference={circumference} pxPerMm={pxPerMm} />
        </>
      ) : (
        <div className="stage manual-entry">
          <p className="big-number" aria-live="polite">
            {formatMm(circumference)}
            <small> mm</small>
          </p>
          <p className="lead center">Largo de la tira hasta la marca (circunferencia del dedo)</p>
          <p className="note center">Diámetro = circunferencia ÷ π = {formatMm(mm)} mm</p>
        </div>
      )}

      <div className="controls">
        <SizeReadout analysis={analysis} />
        <Stepper
          label="circunferencia"
          value={circumference}
          onChange={setCircumference}
          min={38}
          max={82}
          step={0.5}
          sliderStep={0.5}
          valueText={`${formatMm(circumference)} milímetros`}
        />
        <ActionBar onBack={() => setPhase('howto')} backLabel="Pasos">
          <button type="button" className="btn btn-primary" onClick={onDone}>
            <Icon name="check" size={20} /> Ver mi talla
          </button>
        </ActionBar>
      </div>
    </div>
  )
}
