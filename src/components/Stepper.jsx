import { useHoldRepeat } from '../hooks/useHoldRepeat'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const round = (v, step) => Number((Math.round(v / step) * step).toFixed(4))

/**
 * Control de ajuste fino pensado para el pulgar: botones grandes − / +
 * (mantener presionado repite) y un slider para cambios grandes.
 */
export default function Stepper({ label, value, onChange, min, max, step, sliderStep = step, valueText }) {
  const set = (v) => onChange(clamp(round(v, sliderStep), min, max))
  const minus = useHoldRepeat(() => onChange((v) => clamp(round(v - step, sliderStep), min, max)))
  const plus = useHoldRepeat(() => onChange((v) => clamp(round(v + step, sliderStep), min, max)))

  return (
    <div className="stepper">
      <button type="button" className="stepper-btn" aria-label={`Reducir ${label}`} {...minus}>
        −
      </button>
      <input
        type="range"
        className="stepper-range"
        aria-label={label}
        aria-valuetext={valueText}
        min={min}
        max={max}
        step={sliderStep}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
      />
      <button type="button" className="stepper-btn" aria-label={`Aumentar ${label}`} {...plus}>
        +
      </button>
    </div>
  )
}
