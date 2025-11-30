import { render, screen, fireEvent } from '@testing-library/react'
import Alert from '../../src/components/Alert.jsx'

describe('Alert', () => {
  test('renders title and message', () => {
    render(<Alert title="Test title" message="Test message" />)

    expect(screen.getByText('Test title')).toBeInTheDocument()
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  test('calls onClose when close button clicked', () => {
    const handleClose = vi.fn()
    render(<Alert title="T" message="M" onClose={handleClose} />)

    fireEvent.click(screen.getByRole('button'))
    vi.runAllTimers()

    expect(handleClose).toHaveBeenCalled()
  })
})
