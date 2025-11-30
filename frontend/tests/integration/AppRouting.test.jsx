import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Header from '../../src/components/Header.jsx'

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../../src/context/UserContext.jsx', () => ({
  useUser: () => ({ user: null }),
}))

describe('App routing (Header integration)', () => {
  test('renders Login link in header', () => {
    render(<Header />)

    expect(screen.getByText('Login')).toBeInTheDocument()
  })
})
