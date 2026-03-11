/**
 * Global test setup — mocks all external services.
 * Tests are written per-feature as each page/hook/component is built.
 */
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => cleanup())

// Supabase client mock
const mockFromChain = {
  select: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue({ data: null, error: null }),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      resend: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue(mockFromChain),
  },
}))

// localStorage mock
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
})

// Cloudinary mock
vi.mock('@/lib/cloudinary', () => ({
  uploadToCloudinary: vi.fn(),
}))

// React Router mock
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}) }
})

// matchMedia mock (not provided by jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// emoji-picker-react mock
vi.mock('emoji-picker-react', () => ({
  default: ({ onEmojiClick }: { onEmojiClick: (d: { emoji: string }) => void }) => {
    const { createElement } = require('react')
    return createElement('button', { onClick: () => onEmojiClick({ emoji: '😊' }) }, 'mock-emoji-picker')
  },
  Theme: { AUTO: 'auto' },
}))

// IntersectionObserver mock
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

// Suppress noise
global.console.error = vi.fn()
global.console.warn = vi.fn()
