import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@supabase/supabase-js'

vi.mock('@/hooks/use-obituaries', () => ({
  useObitaries: vi.fn(() => ({ data: { data: [], total: 0 }, isPending: false, error: null })),
}))

vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

import ObituaryPage from '@/pages/public/ObituaryPage'

function renderPage() {
  return renderWithProviders(<ObituaryPage />, { initialRoute: '/obituaries' })
}

describe('ObituaryPage — Create Obituary auth gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: null, session: null, isLoading: false })
  })

  it('renders the page heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /Obituaries/i })).toBeInTheDocument()
  })

  it('shows sign-in modal when unauthenticated user clicks Create Obituary', async () => {
    renderPage()
    const [firstBtn] = screen.getAllByRole('button', { name: /Create Obituary/i })
    fireEvent.click(firstBtn)
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
  })

  it('does not open modal when authenticated user clicks Create Obituary', () => {
    useAuthStore.setState({
      user: { id: 'user-1', email: 'user@matieo.com' } as unknown as User,
      session: {} as never,
      isLoading: false,
    })
    renderPage()
    const [firstBtn] = screen.getAllByRole('button', { name: /Create Obituary/i })
    fireEvent.click(firstBtn)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
