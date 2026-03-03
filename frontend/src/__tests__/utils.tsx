/**
 * Shared test utilities.
 * Add mock factories here as data models are built.
 * Import renderWithProviders instead of @testing-library/react directly.
 */
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

export function AllProviders({ children, initialRoute = '/' }: { children: React.ReactNode; initialRoute?: string }) {
  const queryClient = makeTestQueryClient()
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  )
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialRoute?: string }
) {
  const { initialRoute, ...rest } = options ?? {}
  return render(ui, {
    wrapper: ({ children }) => <AllProviders initialRoute={initialRoute}>{children}</AllProviders>,
    ...rest,
  })
}

// ── Mock data factories (add as models are built) ────────────────────────────

export function mockUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@matieo.com',
    user_metadata: { full_name: 'Test User' },
    ...overrides,
  }
}

export function mockMemorial(overrides = {}) {
  return {
    id: 'memorial-id-123',
    created_by: 'test-user-id',
    full_name: 'John Doe',
    date_of_birth: '1945-03-15',
    date_of_death: '2024-01-10',
    age_at_death: 78,
    gender: 'male',
    race_ethnicity: 'Caucasian',
    status: 'draft',
    slug: 'john-doe-2024',
    location: null,
    cover_url: null,
    biography: null,
    tribute_message: null,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    ...overrides,
  }
}

export function mockProfile(overrides = {}) {
  return {
    id: 'test-user-id',
    full_name: 'Test User',
    email: 'test@matieo.com',
    avatar_url: null,
    role: 'user',
    dark_mode: false,
    ...overrides,
  }
}

export * from '@testing-library/react'
export { renderWithProviders as render }
