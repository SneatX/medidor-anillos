import { useEffect, useRef } from 'react'
import ActionBar from '../components/ActionBar'
import CalibrationBanner from '../components/CalibrationBanner'
import Icon from '../components/Icon'
import SizeReadout from '../components/SizeReadout'
import Stepper from '../components/Stepper'
import { tick } from '../hooks/haptics'
import { useElementSize } from '../hooks/useElementSize'
import { formatMm } from '../lib/format'
import { analyzeDiameter, stepSize } from '../lib/sizes'

export default function RingMeasure({ mm, setMm, pxPerMm, calibration, gift, onCalibrate, onDone, onBack }) {
  const stageRef = useRef(null)
  const { width, height } = useElementSize(stageRef)
  const analysis = analyzeDiameter(mm)
  const calibrated = calibration && !calibration.stale

  // Vibración suave cada vez que se cruza a otra talla
  const lastT = useRef(analysis.recommended.t)
  useEffect(() => {
    if (lastT.current !== analysis.recommended.t) {
      lastT.current = analysis.recommended.t
      tick()
    }
  }, [analysis.recommended.t])

  const r = (mm * pxPerMm) / 2
  const cx = width / 2
  const cy = height / 2
  // Grosor típico de un anillo (~2 mm) para dibujar una "sombra" de referencia
  const band = 2.2 * pxPerMm

  return (
    <div className="screen">
      {!calibrated && <CalibrationBanner onCalibrate={onCalibrate} stale={calibration?.stale} />}
      <div className="stage stage-dark" ref={stageRef}>
        {width > 0 && (
          <svg width={width} height={height} className="stage-svg" aria-label={`Círculo de ${formatMm(mm)} milímetros`}>
            <line className="crosshair" x1={cx} y1={0} x2={cx} y2={height} />
            <line className="crosshair" x1={0} y1={cy} x2={width} y2={cy} />
            <circle className="ring-band" cx={cx} cy={cy} r={r + band / 2} strokeWidth={band} />
            <circle className="ring-hole" cx={cx} cy={cy} r={r} />
            <circle className="ring-edge" cx={cx} cy={cy} r={r} />
          </svg>
        )}
        <p className="stage-hint">
          {gift ? 'Usa un anillo que la persona use en el dedo correcto. ' : ''}
          Pon el anillo encima. La <span className="accent-cyan">línea celeste</span> debe tocar el{' '}
          <strong>borde interior</strong>.
        </p>
      </div>

      <div className="controls">
        <SizeReadout analysis={analysis} />
        <Stepper
          label="diámetro"
          value={mm}
          onChange={setMm}
          min={11}
          max={26}
          step={0.05}
          sliderStep={0.05}
          valueText={`${formatMm(mm)} milímetros, talla ${analysis.recommended.t}`}
        />
        <div className="size-jump">
          <button type="button" className="btn btn-soft" onClick={() => setMm(stepSize(mm, -1).mm)}>
            <Icon name="back" size={18} /> Talla menor
          </button>
          <button type="button" className="btn btn-soft" onClick={() => setMm(stepSize(mm, 1).mm)}>
            Talla mayor <Icon name="next" size={18} />
          </button>
        </div>
        <ActionBar onBack={onBack}>
          <button type="button" className="btn btn-primary" onClick={onDone}>
            <Icon name="check" size={20} /> Esta es la talla
          </button>
        </ActionBar>
      </div>
    </div>
  )
}
