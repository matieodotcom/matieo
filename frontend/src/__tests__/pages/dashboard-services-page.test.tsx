import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createElement } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'

vi.mock('@/hooks/use-profile', () => ({ useProfile: vi.fn() }))
vi.mock('@/hooks/use-services', () => ({
  useMyServices: vi.fn(),
  useCreateMyService: vi.fn(),
  useUpdateMyService: vi.fn(),
  useDeleteMyService: vi.fn(),
  usePublicServiceCategories: vi.fn(),
}))
vi.mock('@/lib/toast', () => ({ toast: vi.fn() }))

vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>()
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
import DashboardServicesPage from '@/pages/app/DashboardServicesPage'

const mockMutate = vi.fn()

const orgProfile = { id: 'u1', account_type: 'organization', role: 'user' }

const publishedService = {
  id: 's1', name: 'My Florist', category_id: 'c1', organization_id: 'u1',
  is_active: true, is_draft: false, created_at: '2026-01-01',
  description: null, phone: null, email: null, website: null,
  address: null, city: 'KL', country: 'MY',
  service_categories: { id: 'c1', name: 'Florists', slug: 'florists', icon: null },
}

const draftService = {
  id: 's2', name: 'Draft Service', category_id: 'c1', organization_id: 'u1',
  is_active: false, is_draft: true, created_at: '2026-01-01',
  description: null, phone: null, email: null, website: null,
  address: null, city: null, country: null,
  service_categories: { id: 'c1', name: 'Florists', slug: 'florists', icon: null },
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useCreateMyService).mockReturnValue({ mutate: mockMutate, isPending: false } as ReturnType<typeof useCreateMyService>)
  vi.mocked(useUpdateMyService).mockReturnValue({ mutate: mockMutate, isPending: false } as ReturnType<typeof useUpdateMyService>)
  vi.mocked(useDeleteMyService).mockReturnValue({ mutate: mockMutate, isPending: false } as ReturnType<typeof useDeleteMyService>)
  vi.mocked(usePublicServiceCategories).mockReturnValue({ data: { data: [], error: null }, isLoading: false } as ReturnType<typeof usePublicServiceCategories>)
})

describe('DashboardServicesPage — org user', () => {
  it('renders service name', () => {
    vi.mocked(useProfile).mockReturnValue({ data: orgProfile, isLoading: false } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({ data: { data: [publishedService], error: null }, isLoading: false, error: null } as ReturnType<typeof useMyServices>)
    renderWithProviders(<DashboardServicesPage />)
    expect(screen.getByText('My Florist')).toBeInTheDocument()
  })

  it('published card links to public listing page', () => {
    vi.mocked(useProfile).mockReturnValue({ data: orgProfile, isLoading: false } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({ data: { data: [publishedService], error: null }, isLoading: false, error: null } as ReturnType<typeof useMyServices>)
    renderWithProviders(<DashboardServicesPage />)
    expect(screen.getByRole('link', { name: 'My Florist' })).toHaveAttribute('href', '/services/florists/s1')
  })

  it('draft card links to edit page', () => {
    vi.mocked(useProfile).mockReturnValue({ data: orgProfile, isLoading: false } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({ data: { data: [draftService], error: null }, isLoading: false, error: null } as ReturnType<typeof useMyServices>)
    renderWithProviders(<DashboardServicesPage />)
    expect(screen.getByRole('link', { name: 'Draft Service' })).toHaveAttribute('href', '/dashboard/services/s2/edit')
  })

  it('does not render a Preview button', () => {
    vi.mocked(useProfile).mockReturnValue({ data: orgProfile, isLoading: false } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({ data: { data: [publishedService], error: null }, isLoading: false, error: null } as ReturnType<typeof useMyServices>)
    renderWithProviders(<DashboardServicesPage />)
    expect(screen.queryByRole('link', { name: /preview/i })).not.toBeInTheDocument()
  })

  it('shows empty state when no services', () => {
    vi.mocked(useProfile).mockReturnValue({ data: orgProfile, isLoading: false } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({ data: { data: [], error: null }, isLoading: false, error: null } as ReturnType<typeof useMyServices>)
    renderWithProviders(<DashboardServicesPage />)
    expect(screen.getByText(/haven't listed any services/i)).toBeInTheDocument()
  })

  it('draft card ⋮ menu shows Delete option', async () => {
    vi.mocked(useProfile).mockReturnValue({ data: orgProfile, isLoading: false } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({ data: { data: [draftService], error: null }, isLoading: false, error: null } as ReturnType<typeof useMyServices>)
    renderWithProviders(<DashboardServicesPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Service options' }))
    expect(screen.getByRole('menuitem', { name: /remove service/i })).toBeInTheDocument()
  })

  it('published card ⋮ menu shows Edit option', async () => {
    vi.mocked(useProfile).mockReturnValue({ data: orgProfile, isLoading: false } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({ data: { data: [publishedService], error: null }, isLoading: false, error: null } as ReturnType<typeof useMyServices>)
    renderWithProviders(<DashboardServicesPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Service options' }))
    expect(screen.getByRole('menuitem', { name: /edit/i })).toBeInTheDocument()
  })
})

describe('DashboardServicesPage — non-org user', () => {
  it('redirects to /dashboard for individual users', () => {
    vi.mocked(useProfile).mockReturnValue({ data: { id: 'u2', account_type: 'individual', role: 'user' }, isLoading: false } as ReturnType<typeof useProfile>)
    vi.mocked(useMyServices).mockReturnValue({ data: { data: [], error: null }, isLoading: false, error: null } as ReturnType<typeof useMyServices>)
    renderWithProviders(<DashboardServicesPage />)
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/dashboard')
  })
})
