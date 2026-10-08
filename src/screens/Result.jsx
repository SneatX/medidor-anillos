import { useState } from 'react'
import ActionBar from '../components/ActionBar'
import Icon from '../components/Icon'
import { formatMm, formatUsa } from '../lib/format'
import { shareOrCopy, shareText } from '../lib/share'
import { analyzeDiameter, circumferenceFromDiameter } from '../lib/sizes'

const QUICK_LABELS = ['Yo', 'Mi pareja', 'Mamá', 'Papá', 'Amigo/a']

function Explanation({ analysis }) {
  const { status, lower, upper, recommended, mm } = analysis
  if (status === 'exact')
    return (
      <p>
        Tu medida coincide con la <strong>T {recommended.t}</strong> de la tabla.
      </p>
    )
  if (status === 'between')
    return (
      <p>
        Tu medida ({formatMm(mm)} mm) está entre la <strong>T {lower.t}</strong> ({formatMm(lower.mm)} mm) y la{' '}
        <strong>T {upper.t}</strong> ({formatMm(upper.mm)} mm). Te sugerimos la <strong>mayor</strong>: un anillo
        un poco holgado se puede usar, uno apretado no pasa por el nudillo.
      </p>
    )
  return (
    <p>
      Tu medida ({formatMm(mm)} mm) está {status === 'below' ? 'por debajo de la T 1' : 'por encima de la T 36'}. Revisa la
      medición o consulta con la joyería: puede necesitar una talla especial.
    </p>
  )
}

export default function Result({ result, calibrated, onSave, onAgain, onTable, onHome }) {
  const analysis = analyzeDiameter(result.mm)
  const size = analysis.recommended
  const [label, setLabel] = useState(result.gift ? 'Regalo' : '')
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState('')
  const approximate = result.method === 'ring' ? !calibrated : result.tool === 'screen' && !calibrated

  const share = async () => {
    const outcome = await shareOrCopy(shareText(size.t, result.mm, size.usa, label))
    if (outcome === 'copied') setToast('Copiado al portapapeles')
    if (outcome === 'failed') setToast('No se pudo compartir')
    setTimeout(() => setToast(''), 2200)
  }

  const save = () => {
    onSave({ label, mm: result.mm, t: size.t, method: result.method })
    setSaved(true)
  }

  return (
    <div className="screen">
      <div className="scroll-area">
        <section className="result-hero">
          <div className="result-ring" aria-hidden="true">
            <span className="sparkle s1">✦</span>
            <span className="sparkle s2">✦</span>
            <span className="sparkle s3">✦</span>
          </div>
          <p className="eyebrow">{result.gift ? 'Talla para el regalo' : 'Tu talla'}</p>
          <p className="result-t">T {size.t}</p>
          <dl className="result-facts">
            <div>
              <dt>Diámetro</dt>
              <dd>{formatMm(size.mm)} mm</dd>
            </div>
            <div>
              <dt>USA</dt>
              <dd>{formatUsa(size.usa)}</dd>
            </div>
            <div>
              <dt>Contorno</dt>
              <dd>{formatMm(circumferenceFromDiameter(size.mm))} mm</dd>
            </div>
          </dl>
        </section>

        <section className="card">
          <Explanation analysis={analysis} />
          {approximate && (
            <p className="note warn">
              <Icon name="warning" size={16} /> Mediste sin calibrar la pantalla: el resultado puede variar 1–3 tallas.
            </p>
          )}
        </section>

        <section className="card tips">
          <h2>Antes de comprar</h2>
          <ul>
            <li>Si el anillo es ancho (más de 6 mm), pide media talla más.</li>
            <li>Si tu nudillo es grueso, prueba que el anillo pase por él.</li>
            <li>En duda, la mayoría de joyerías ajusta 1–2 tallas.</li>
          </ul>
        </section>

        <section className="card">
          <h2>Guardar esta talla</h2>
          {saved ? (
            <p className="note ok">
              <Icon name="check" size={16} /> Guardada en "Mis tallas".
            </p>
          ) : (
            <>
              <div className="chips">
                {QUICK_LABELS.map((q) => (
                  <button key={q} type="button" className={`chip-btn ${label === q ? 'on' : ''}`} onClick={() => setLabel(q)}>
                    {q}
                  </button>
                ))}
              </div>
              <div className="save-row">
                <input
                  className="text-input"
                  placeholder="¿De quién es? Ej: anular de Ana"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  aria-label="Nombre para guardar la talla"
                  enterKeyHint="done"
                />
                <button type="button" className="btn btn-soft" onClick={save}>
                  Guardar
                </button>
              </div>
            </>
          )}
        </section>

        <button type="button" className="link-btn" onClick={onTable}>
          Ver todas las equivalencias
        </button>
      </div>

      <div className="controls">
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
        <ActionBar onBack={onAgain} backLabel="Ajustar">
          <button type="button" className="btn btn-soft" onClick={share}>
            <Icon name="share" size={20} /> Compartir
          </button>
          <button type="button" className="btn btn-primary" onClick={onHome}>
            Listo
          </button>
        </ActionBar>
      </div>
    </div>
  )
}
