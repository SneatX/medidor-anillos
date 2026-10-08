import Icon from './Icon'

const TABS = [
  { id: 'home', label: 'Medir', icon: 'target' },
  { id: 'table', label: 'Tabla', icon: 'table' },
  { id: 'saved', label: 'Mis tallas', icon: 'heart' },
]

export default function BottomNav({ current, onChange, savedCount }) {
  return (
    <nav className="bottom-nav" aria-label="Secciones">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`nav-item ${current === tab.id ? 'active' : ''}`}
          aria-current={current === tab.id ? 'page' : undefined}
          onClick={() => onChange(tab.id)}
        >
          <Icon name={tab.icon} size={22} />
          <span>{tab.label}</span>
          {tab.id === 'saved' && savedCount > 0 && <span className="nav-badge">{savedCount}</span>}
        </button>
      ))}
    </nav>
  )
}
