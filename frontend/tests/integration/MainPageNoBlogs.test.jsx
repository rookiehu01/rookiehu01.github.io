import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import MainPage from '../../src/routes/MainPage.jsx'

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../../src/context/UserContext.jsx', () => ({
  useUser: () => ({ user: null }),
}))

describe('MainPage integration', () => {
  test('shows "No blogs found" when backend returns empty list', async () => {
    const originalFetch = global.fetch

    global.fetch = vi.fn(async (input, init) => {
      console.log('Fetch called with:', input)
      if (typeof input === 'string' && input.includes('/blogs')) {
        return {
          ok: true,
          json: async () => [],
        }
      }
      if (originalFetch) return originalFetch(input, init)
      throw new Error('Unexpected fetch call in test: ' + input)
    })

    render(<MainPage />)

    await screen.findByText('No blogs found')

    global.fetch = originalFetch
  })
})
