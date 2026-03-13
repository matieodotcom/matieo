import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import type { ReactNode } from 'react'

// Mock hooks
vi.mock('@/hooks/use-profile', () => ({
  useProfile: vi.fn(),
}))
vi.mock('@/hooks/use-services', () => ({
  useMyServices: vi.fn(),
  useCreateMyService: vi.fn(),
  useUpdateMyService: vi.fn(),
  useDeleteMyService: vi.fn(),
  usePublicServiceCategories: vi.fn(),
}))
vi.mock('@/lib/toast', () => ({ toast: vi.fn() }))

// Mock Navigate so redirect is observable
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, Navigate: ({ to }: { to: string }) => createElement('div', { 'data-testid': 'navigate', 'data-to': to }) }
})

import { useProfile } from '@/hooks/use-profile'
import {
  useMyServices,
  useCreateMyService,
  useUpdateMyService,
  useDeleteMyService,
  usePublicServiceCategories,
} from '@/hooks/use-services'

import DashboardServicesPage from './DashboardServicesPage'

const mockMutate = vi.fn()

function makeWrapper() {
  const qc = new QueryClient()
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useCreateMyService).mockReturnValue({ mutate: mockMutate, isPending: false } as ReturnType<typeof useCreateMyService>)
  vi.mocked(useUpdateMyService).mockReturnValue({ mutate: mockMutate, isPending: false } as ReturnType<typeof useUpdateMyService>)
  vi.mocked(useDeleteMyService).mockReturnValue({ mutate: mockMutate, isPending: false } as ReturnType<typeof useDeleteMyService>)
  vi.mocked(usePublicServiceCategories).mockReturnValue({ data: { data: [], error: null }, isLoading: false } as ReturnType<typeof usePublicServiceCategories>)
})

describe('DashboardServicesPage — org user', () => {
  it('renders service listings for org user', () => {
    vi.mocked(useProfile).mockReturnValue({
      data: { id: 'u1', account_type: 'organization', role: 'user' } as ReturnType<typeof useProfile>['data'],
      isLoading: false,
    } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({
      data: {
        data: [
          { id: 's1', name: 'My Florist', category_id: 'c1', organization_id: 'u1', is_active: true, created_at: '2026-01-01', description: null, phone: null, email: null, website: null, address: null, city: 'KL', country: 'MY', service_categories: { id: 'c1', name: 'Florists', slug: 'florists', icon: null } },
        ],
        error: null,
      },
      isLoading: false, error: null,
    } as ReturnType<typeof useMyServices>)

    render(createElement(DashboardServicesPage), { wrapper: makeWrapper() })
    expect(screen.getByText('My Florist')).toBeInTheDocument()
  })

  it('shows empty state when no services', () => {
    vi.mocked(useProfile).mockReturnValue({
      data: { id: 'u1', account_type: 'organization', role: 'user' } as ReturnType<typeof useProfile>['data'],
      isLoading: false,
    } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({
      data: { data: [], error: null },
      isLoading: false, error: null,
    } as ReturnType<typeof useMyServices>)

    render(createElement(DashboardServicesPage), { wrapper: makeWrapper() })
    expect(screen.getByText(/haven't listed any services/i)).toBeInTheDocument()
  })
})

describe('DashboardServicesPage — non-org user', () => {
  it('redirects to /dashboard for individual users', () => {
    vi.mocked(useProfile).mockReturnValue({
      data: { id: 'u2', account_type: 'individual', role: 'user' } as ReturnType<typeof useProfile>['data'],
      isLoading: false,
    } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({
      data: { data: [], error: null },
      isLoading: false, error: null,
    } as ReturnType<typeof useMyServices>)

    render(createElement(DashboardServicesPage), { wrapper: makeWrapper() })
    const nav = screen.getByTestId('navigate')
    expect(nav).toHaveAttribute('data-to', '/dashboard')
  })
})
