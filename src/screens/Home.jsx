import Icon from '../components/Icon'

const OPTIONS = [
  {
    id: 'ring',
    icon: 'ring',
    title: 'Tengo un anillo',
    text: 'Lo pones sobre la pantalla. El método más preciso.',
    tag: 'Recomendado',
  },
  {
    id: 'finger',
    icon: 'thread',
    title: 'Tengo hilo o papel',
    text: 'Mides el contorno de tu dedo en 3 pasos.',
  },
  {
    id: 'gift',
    icon: 'gift',
    title: 'Es un regalo sorpresa',
    text: 'Toma prestado un anillo de esa persona… sin que se entere.',
  },
]

export default function Home({ calibration, onPick, onCalibrate }) {
  const calibrated = calibration && !calibration.stale
  return (
    <div className="screen home">
      <header className="home-head">
        <div className="logo" aria-hidden="true" />
        <h1>Medidor de Anillos</h1>
        <p className="lead">Descubre tu talla con la pantalla de tu celular, sin ir a la joyería.</p>
        <button
          type="button"
          className={`calib-chip ${calibrated ? 'ok' : ''}`}
          onClick={onCalibrate}
          aria-label={calibrated ? 'Pantalla calibrada. Volver a calibrar' : 'Calibrar pantalla'}
        >
          <span className="dot" />
          {calibrated ? 'Pantalla calibrada' : 'Sin calibrar · toca para calibrar'}
        </button>
      </header>

      <section className="home-options" aria-labelledby="pick-title">
        <h2 id="pick-title">¿Qué tienes a mano?</h2>
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" className="option" onClick={() => onPick(o.id)}>
            <span className="option-icon">
              <Icon name={o.icon} size={28} />
            </span>
            <span className="option-body">
              <span className="option-title">
                {o.title}
                {o.tag && <span className="tag">{o.tag}</span>}
              </span>
              <span className="option-text">{o.text}</span>
            </span>
            <Icon name="next" size={20} className="option-arrow" />
          </button>
        ))}
      </section>
    </div>
  )
}
