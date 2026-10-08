import { useCallback, useEffect, useMemo, useState } from 'react'
import BottomNav from './components/BottomNav'
import { estimatePxPerMm, loadCalibration, saveCalibration } from './lib/calibration'
import { createEntry, loadSaved, persistSaved } from './lib/saved'
import { analyzeDiameter, diameterFromCircumference } from './lib/sizes'
import Calibrate from './screens/Calibrate'
import FingerMeasure from './screens/FingerMeasure'
import Home from './screens/Home'
import Result from './screens/Result'
import RingMeasure from './screens/RingMeasure'
import Saved from './screens/Saved'
import SizeTable from './screens/SizeTable'

const TABS = ['home', 'table', 'saved']

export default function App() {
  const [screen, setScreen] = useState('home')
  const [calibration, setCalibration] = useState(() => loadCalibration())
  const [calibrateNext, setCalibrateNext] = useState(null) // pantalla a la que seguir tras calibrar
  const [ringMm, setRingMm] = useState(18.1) // T17: talla promedio, buen punto de partida
  const [fingerCirc, setFingerCirc] = useState(57)
  const [fingerPhase, setFingerPhase] = useState('howto')
  const [fingerTool, setFingerTool] = useState('ruler')
  const [gift, setGift] = useState(false)
  const [result, setResult] = useState(null)
  const [saved, setSaved] = useState(() => loadSaved())

  const pxPerMm = useMemo(() => calibration?.pxPerMm ?? estimatePxPerMm(), [calibration])
  const calibrated = Boolean(calibration && !calibration.stale)

  // Navegación integrada con el historial: el botón/gesto "atrás" del celular funciona.
  // `depth` cuenta cuántas pantallas hay apiladas sobre el inicio.
  useEffect(() => {
    history.replaceState({ screen: 'home', depth: 0 }, '')
    const onPop = (e) => setScreen(e.state?.screen ?? 'home')
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])

  const go = useCallback((next, { replace = false } = {}) => {
    const depth = history.state?.depth ?? 0
    if (replace) history.replaceState({ screen: next, depth }, '')
    else history.pushState({ screen: next, depth: depth + 1 }, '')
    setScreen(next)
  }, [])
  const back = () => history.back()

  /** Vuelve al inicio desapilando todo, para que "atrás" no regrese a un flujo terminado. */
  const goHome = () => {
    const depth = history.state?.depth ?? 0
    if (depth > 0) history.go(-depth)
    else go('home', { replace: true })
  }

  useEffect(() => persistSaved(saved), [saved])

  const startFlow = (flow) => {
    const isGift = flow === 'gift'
    const target = isGift ? 'ring' : flow
    setGift(isGift)
    // El anillo depende de la escala de la pantalla: calibrar primero si hace falta
    if (target === 'ring' && !calibrated) {
      setCalibrateNext('ring')
      go('calibrate')
    } else {
      go(target)
    }
  }

  const openCalibration = (next = null) => {
    setCalibrateNext(next)
    go('calibrate')
  }

  const finishCalibration = (ppm, method) => {
    setCalibration(saveCalibration(ppm, method))
    if (calibrateNext) go(calibrateNext, { replace: true })
    else back()
  }

  const skipCalibration = () => {
    if (calibrateNext) go(calibrateNext, { replace: true })
    else back()
  }

  const showResult = (data) => {
    setResult(data)
    go('result')
  }

  const addEntry = (data) => setSaved((list) => [createEntry(data), ...list])
  const removeEntry = (id) => setSaved((list) => list.filter((e) => e.id !== id))
  const restoreEntry = (entry, index) =>
    setSaved((list) => [...list.slice(0, index), entry, ...list.slice(index)])

  let content
  switch (screen) {
    case 'calibrate':
      content = (
        <Calibrate
          initialPxPerMm={pxPerMm}
          canSkip={Boolean(calibrateNext)}
          onDone={finishCalibration}
          onSkip={skipCalibration}
          onBack={back}
        />
      )
      break
    case 'ring':
      content = (
        <RingMeasure
          mm={ringMm}
          setMm={setRingMm}
          pxPerMm={pxPerMm}
          calibration={calibration}
          gift={gift}
          onCalibrate={() => openCalibration('ring')}
          onDone={() => showResult({ mm: ringMm, method: 'ring', gift })}
          onBack={back}
        />
      )
      break
    case 'finger':
      content = (
        <FingerMeasure
          circumference={fingerCirc}
          setCircumference={setFingerCirc}
          phase={fingerPhase}
          setPhase={setFingerPhase}
          tool={fingerTool}
          setTool={setFingerTool}
          pxPerMm={pxPerMm}
          calibration={calibration}
          onCalibrate={() => openCalibration('finger')}
          onDone={() =>
            showResult({ mm: diameterFromCircumference(fingerCirc), method: 'finger', tool: fingerTool, gift: false })
          }
          onBack={back}
        />
      )
      break
    case 'result':
      content = result ? (
        <Result
          result={result}
          calibrated={calibrated}
          onSave={addEntry}
          onAgain={back}
          onTable={() => go('table')}
          onHome={goHome}
        />
      ) : null
      break
    case 'table':
      content = <SizeTable pxPerMm={pxPerMm} highlightT={result ? analyzeDiameter(result.mm).recommended.t : null} />
      break
    case 'saved':
      content = (
        <Saved entries={saved} onRemove={removeEntry} onRestore={restoreEntry} onMeasure={goHome} />
      )
      break
    default:
      content = <Home calibration={calibration} onPick={startFlow} onCalibrate={() => openCalibration()} />
  }

  // Si se recarga en una pantalla que necesita datos que ya no existen, volver al inicio
  if (!content) content = <Home calibration={calibration} onPick={startFlow} onCalibrate={() => openCalibration()} />

  return (
    <div className="app">
      <main className="app-main">{content}</main>
      {TABS.includes(screen) && (
        <BottomNav current={screen} onChange={(tab) => go(tab, { replace: true })} savedCount={saved.length} />
      )}
    </div>
  )
}
