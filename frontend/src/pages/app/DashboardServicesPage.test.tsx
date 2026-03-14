import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
          { id: 's1', name: 'My Florist', category_id: 'c1', organization_id: 'u1', is_active: true, is_draft: false, created_at: '2026-01-01', description: null, phone: null, email: null, website: null, address: null, city: 'KL', country: 'MY', service_categories: { id: 'c1', name: 'Florists', slug: 'florists', icon: null } },
        ],
        error: null,
      },
      isLoading: false, error: null,
    } as ReturnType<typeof useMyServices>)

    render(createElement(DashboardServicesPage), { wrapper: makeWrapper() })
    expect(screen.getByText('My Florist')).toBeInTheDocument()
  })

  it('published card links to public listing page', () => {
    vi.mocked(useProfile).mockReturnValue({
      data: { id: 'u1', account_type: 'organization', role: 'user' } as ReturnType<typeof useProfile>['data'],
      isLoading: false,
    } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({
      data: {
        data: [
          { id: 's1', name: 'My Florist', category_id: 'c1', organization_id: 'u1', is_active: true, is_draft: false, created_at: '2026-01-01', description: null, phone: null, email: null, website: null, address: null, city: 'KL', country: 'MY', service_categories: { id: 'c1', name: 'Florists', slug: 'florists', icon: null } },
        ],
        error: null,
      },
      isLoading: false, error: null,
    } as ReturnType<typeof useMyServices>)

    render(createElement(DashboardServicesPage), { wrapper: makeWrapper() })
    const link = screen.getByRole('link', { name: 'My Florist' })
    expect(link).toHaveAttribute('href', '/services/florists/s1')
  })

  it('draft card links to edit page', () => {
    vi.mocked(useProfile).mockReturnValue({
      data: { id: 'u1', account_type: 'organization', role: 'user' } as ReturnType<typeof useProfile>['data'],
      isLoading: false,
    } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({
      data: {
        data: [
          { id: 's2', name: 'Draft Service', category_id: 'c1', organization_id: 'u1', is_active: false, is_draft: true, created_at: '2026-01-01', description: null, phone: null, email: null, website: null, address: null, city: null, country: null, service_categories: { id: 'c1', name: 'Florists', slug: 'florists', icon: null } },
        ],
        error: null,
      },
      isLoading: false, error: null,
    } as ReturnType<typeof useMyServices>)

    render(createElement(DashboardServicesPage), { wrapper: makeWrapper() })
    const link = screen.getByRole('link', { name: 'Draft Service' })
    expect(link).toHaveAttribute('href', '/dashboard/services/s2/edit')
  })

  it('does not render a Preview button', () => {
    vi.mocked(useProfile).mockReturnValue({
      data: { id: 'u1', account_type: 'organization', role: 'user' } as ReturnType<typeof useProfile>['data'],
      isLoading: false,
    } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({
      data: {
        data: [
          { id: 's1', name: 'My Florist', category_id: 'c1', organization_id: 'u1', is_active: true, is_draft: false, created_at: '2026-01-01', description: null, phone: null, email: null, website: null, address: null, city: 'KL', country: 'MY', service_categories: { id: 'c1', name: 'Florists', slug: 'florists', icon: null } },
        ],
        error: null,
      },
      isLoading: false, error: null,
    } as ReturnType<typeof useMyServices>)

    render(createElement(DashboardServicesPage), { wrapper: makeWrapper() })
    expect(screen.queryByRole('link', { name: /preview/i })).not.toBeInTheDocument()
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

  it('draft card ⋮ menu shows Delete option', async () => {
    vi.mocked(useProfile).mockReturnValue({
      data: { id: 'u1', account_type: 'organization', role: 'user' } as ReturnType<typeof useProfile>['data'],
      isLoading: false,
    } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({
      data: {
        data: [
          { id: 's2', name: 'Draft Service', category_id: 'c1', organization_id: 'u1', is_active: false, is_draft: true, created_at: '2026-01-01', description: null, phone: null, email: null, website: null, address: null, city: null, country: null, service_categories: { id: 'c1', name: 'Florists', slug: 'florists', icon: null } },
        ],
        error: null,
      },
      isLoading: false, error: null,
    } as ReturnType<typeof useMyServices>)

    render(createElement(DashboardServicesPage), { wrapper: makeWrapper() })
    await userEvent.click(screen.getByRole('button', { name: 'Service options' }))
    expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument()
  })

  it('published card ⋮ menu shows Edit option', async () => {
    vi.mocked(useProfile).mockReturnValue({
      data: { id: 'u1', account_type: 'organization', role: 'user' } as ReturnType<typeof useProfile>['data'],
      isLoading: false,
    } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({
      data: {
        data: [
          { id: 's1', name: 'My Florist', category_id: 'c1', organization_id: 'u1', is_active: true, is_draft: false, created_at: '2026-01-01', description: null, phone: null, email: null, website: null, address: null, city: 'KL', country: 'MY', service_categories: { id: 'c1', name: 'Florists', slug: 'florists', icon: null } },
        ],
        error: null,
      },
      isLoading: false, error: null,
    } as ReturnType<typeof useMyServices>)

    render(createElement(DashboardServicesPage), { wrapper: makeWrapper() })
    await userEvent.click(screen.getByRole('button', { name: 'Service options' }))
    expect(screen.getByRole('menuitem', { name: /edit/i })).toBeInTheDocument()
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
