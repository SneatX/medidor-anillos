import { useState } from 'react'
import Icon from '../components/Icon'
import { formatMm, formatUsa } from '../lib/format'
import { sizeByT } from '../lib/sizes'
import { shareOrCopy, shareText } from '../lib/share'

const dateFmt = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Saved({ entries, onRemove, onRestore, onMeasure }) {
  const [removed, setRemoved] = useState(null)
  const [toast, setToast] = useState('')

  const remove = (entry, index) => {
    onRemove(entry.id)
    setRemoved({ entry, index })
  }

  const share = async (e) => {
    const size = sizeByT(e.t)
    const outcome = await shareOrCopy(shareText(e.t, e.mm, size.usa, e.label))
    if (outcome === 'copied') {
      setToast('Copiado al portapapeles')
      setTimeout(() => setToast(''), 2200)
    }
  }

  return (
    <div className="screen">
      <header className="screen-head compact">
        <h1>Mis tallas</h1>
        <p className="note">Se guardan solo en este dispositivo.</p>
      </header>

      <div className="scroll-area">
        {entries.length === 0 ? (
          <div className="empty-state">
            <div className="logo" aria-hidden="true" />
            <p>Aún no guardas tallas. Guarda la tuya o la de alguien especial para no volver a medir.</p>
          </div>
        ) : (
          <ul className="saved-list">
            {entries.map((e, i) => {
              const size = sizeByT(e.t)
              return (
                <li key={e.id} className="saved-item">
                  <span className="saved-t">T {e.t}</span>
                  <span className="saved-body">
                    <strong>{e.label}</strong>
                    <span className="note">
                      Ø {formatMm(size.mm)} mm · {formatUsa(size.usa)} USA · {dateFmt.format(new Date(e.date))}
                    </span>
                  </span>
                  <button type="button" className="icon-btn" aria-label={`Compartir talla de ${e.label}`} onClick={() => share(e)}>
                    <Icon name="share" size={20} />
                  </button>
                  <button type="button" className="icon-btn" aria-label={`Eliminar talla de ${e.label}`} onClick={() => remove(e, i)}>
                    <Icon name="trash" size={20} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="controls">
        {removed && (
          <div className="toast" role="status">
            Eliminada "{removed.entry.label}"
            <button
              type="button"
              className="toast-btn"
              onClick={() => {
                onRestore(removed.entry, removed.index)
                setRemoved(null)
              }}
            >
              Deshacer
            </button>
          </div>
        )}
        {toast && !removed && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
        <div className="action-bar">
          <button type="button" className="btn btn-primary" onClick={onMeasure}>
            <Icon name="ring" size={20} /> Medir una talla
          </button>
        </div>
      </div>
    </div>
  )
}
