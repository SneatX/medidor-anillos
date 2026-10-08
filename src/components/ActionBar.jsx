import Icon from './Icon'

/**
 * Barra inferior de acciones (zona natural del pulgar).
 * El botón "Atrás" también vive aquí: la esquina superior izquierda
 * es la zona más difícil de alcanzar con una mano.
 */
export default function ActionBar({ onBack, backLabel = 'Atrás', children }) {
  return (
    <div className="action-bar">
      {onBack && (
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <Icon name="back" size={20} />
          {backLabel}
        </button>
      )}
      {children}
    </div>
  )
}
