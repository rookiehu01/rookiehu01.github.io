import '@testing-library/jest-dom/vitest'
import { beforeEach, afterEach, vi } from 'vitest'

beforeEach(() => {
	vi.useFakeTimers()
})

afterEach(() => {
	vi.useRealTimers()
})
