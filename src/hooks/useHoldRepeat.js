import { useEffect, useRef } from 'react'

const FIRST_DELAY = 380
const REPEAT_EVERY = 55

/**
 * Props para un botón que repite su acción mientras se mantiene presionado,
 * así el usuario no tiene que tocar 30 veces para un ajuste grande.
 */
export function useHoldRepeat(action) {
  const actionRef = useRef(action)
  const timers = useRef([])

  useEffect(() => {
    actionRef.current = action
  }, [action])

  const stop = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  useEffect(() => stop, [])

  const repeat = () => {
    actionRef.current()
    timers.current.push(setTimeout(repeat, REPEAT_EVERY))
  }

  return {
    onPointerDown: (e) => {
      if (e.button !== undefined && e.button !== 0) return
      stop()
      actionRef.current()
      timers.current.push(setTimeout(repeat, FIRST_DELAY))
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    // Teclado (Enter/Espacio) llega como click sin puntero
    onClick: (e) => {
      if (e.detail === 0) actionRef.current()
    },
    onContextMenu: (e) => e.preventDefault(),
  }
}
