import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
  window.matchMedia ??= () => ({ matches: false })
})

describe('flujo con hilo (sin anillo)', () => {
  it('lleva de la tira medida a la talla y permite guardarla', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Tengo hilo o papel/ }))
    await user.click(screen.getByRole('button', { name: /Ya la tengo marcada/ }))

    // 57 mm de contorno -> 18,1 mm de diámetro -> T17
    expect(screen.getByText('T 17')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Aumentar circunferencia' }))
    expect(screen.getByText('57,5')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Ver mi talla/ }))
    expect(screen.getByText('Tu talla')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mamá' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getByText(/Guardada en/)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('medidor-anillos:tallas'))[0].label).toBe('Mamá')
  })
})

describe('flujo con anillo', () => {
  it('pide calibrar primero y luego muestra el círculo', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Tengo un anillo/ }))
    expect(screen.getByRole('heading', { name: 'Calibra tu pantalla' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Coincide/ }))
    expect(localStorage.getItem('medidor-anillos:calibracion')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: /Talla mayor/ }))
    expect(screen.getByText('T 18')).toBeInTheDocument()
    expect(screen.getByText('Talla exacta')).toBeInTheDocument()
  })
})

describe('tabla', () => {
  it('filtra por talla USA desde el buscador', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Tabla' }))
    await user.type(screen.getByLabelText('Buscar talla'), '8 usa')
    const list = screen.getByRole('list')
    expect(within(list).getAllByRole('button').map((b) => b.textContent.slice(0, 4))).toEqual(['T 17', 'T 18', 'T 19'])
  })
})
