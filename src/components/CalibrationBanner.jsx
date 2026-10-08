import Icon from './Icon'

export default function CalibrationBanner({ onCalibrate, stale }) {
  return (
    <div className="banner" role="status">
      <Icon name="warning" size={18} />
      <span>{stale ? 'Cambió el zoom o la pantalla.' : 'Pantalla sin calibrar.'} La medida es aproximada.</span>
      <button type="button" className="banner-btn" onClick={onCalibrate}>
        Calibrar
      </button>
    </div>
  )
}
