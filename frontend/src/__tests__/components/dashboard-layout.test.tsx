import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/store/authStore'
import { mockProfile } from '@/__tests__/utils'
import type { User } from '@supabase/supabase-js'

vi.mock('@/hooks/use-profile', () => ({
  useProfile: vi.fn(),
}))

import { useProfile } from '@/hooks/use-profile'

const mockUser = {
  id: 'test-user-id',
  email: 'test@matieo.com',
  user_metadata: { full_name: 'Jane Smith', avatar_url: null },
} as unknown as User

function renderLayout(initialRoute = '/dashboard') {
  return renderWithProviders(<DashboardLayout />, { initialRoute })
}

// jsdom does not implement HTMLElement.scrollTo
HTMLElement.prototype.scrollTo = vi.fn()

describe('DashboardLayout — authenticated', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: mockUser, session: {} as never, isLoading: false })
    vi.mocked(useProfile).mockReturnValue({
      data: mockProfile({ account_type: 'individual' }) as never,
      isLoading: false,
      error: null,
    } as never)
    vi.clearAllMocks()
  })

  it('renders "Toggle navigation" button', () => {
    renderLayout()
    expect(screen.getByRole('button', { name: 'Toggle navigation' })).toBeInTheDocument()
  })

  it('toggle button starts collapsed (aria-expanded false)', () => {
    renderLayout()
    expect(screen.getByRole('button', { name: 'Toggle navigation' }))
      .toHaveAttribute('aria-expanded', 'false')
  })

  it('clicking toggle sets aria-expanded to true', async () => {
    renderLayout()
    await userEvent.click(screen.getByRole('button', { name: 'Toggle navigation' }))
    expect(screen.getByRole('button', { name: 'Toggle navigation' }))
      .toHaveAttribute('aria-expanded', 'true')
  })

  it('clicking toggle again collapses sidebar (aria-expanded false)', async () => {
    renderLayout()
    const btn = screen.getByRole('button', { name: 'Toggle navigation' })
    await userEvent.click(btn)
    await userEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders Home back link on /dashboard', () => {
    renderLayout('/dashboard')
    const link = screen.getByRole('link', { name: /^home$/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders Dashboard back link on sub-routes', () => {
    renderLayout('/dashboard/insights')
    const link = screen.getByRole('link', { name: /^dashboard$/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('renders user avatar button', () => {
    renderLayout()
    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
  })

  it('renders core nav labels for individual users', () => {
    renderLayout()
    expect(screen.getByText('Insights')).toBeInTheDocument()
    expect(screen.getByText('Memorials')).toBeInTheDocument()
    expect(screen.getByText('Obituary')).toBeInTheDocument()
  })

  it('hides Services link for individual users', () => {
    renderLayout()
    expect(screen.queryByText('Services')).not.toBeInTheDocument()
  })

  it('shows Services link for organization users', () => {
    vi.mocked(useProfile).mockReturnValue({
      data: mockProfile({ account_type: 'organization' }) as never,
      isLoading: false,
      error: null,
    } as never)
    renderLayout()
    expect(screen.getByText('Services')).toBeInTheDocument()
  })

  it('Insights link points to /dashboard/insights', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /insights/i }))
      .toHaveAttribute('href', '/dashboard/insights')
  })

  it('Memorials link points to /dashboard/memorials', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /memorials/i }))
      .toHaveAttribute('href', '/dashboard/memorials')
  })

  it('Obituary link points to /dashboard/obituary', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /obituary/i }))
      .toHaveAttribute('href', '/dashboard/obituary')
  })

  it('Services link points to /dashboard/services for org users', () => {
    vi.mocked(useProfile).mockReturnValue({
      data: mockProfile({ account_type: 'organization' }) as never,
      isLoading: false,
      error: null,
    } as never)
    renderLayout()
    expect(screen.getByRole('link', { name: /services/i }))
      .toHaveAttribute('href', '/dashboard/services')
  })
})

describe('DashboardLayout — preview route', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: mockUser, session: {} as never, isLoading: false })
    vi.mocked(useProfile).mockReturnValue({
      data: mockProfile({ account_type: 'individual' }) as never,
      isLoading: false,
      error: null,
    } as never)
    vi.clearAllMocks()
  })

  it('shows "Back to editing" button instead of Dashboard link on preview route', () => {
    renderLayout('/dashboard/memorials/preview')
    expect(screen.getByRole('button', { name: /back to editing/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^dashboard$/i })).not.toBeInTheDocument()
  })

  it('shows Dashboard link on non-preview, non-create/edit routes', () => {
    renderLayout('/dashboard/memorials')
    expect(screen.getByRole('link', { name: /^dashboard$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /back to editing/i })).not.toBeInTheDocument()
  })

  it('shows "My Memorials" back link on create route', () => {
    renderLayout('/dashboard/memorials/create')
    const link = screen.getByRole('link', { name: /my memorials/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard/memorials')
    expect(screen.queryByRole('link', { name: /^dashboard$/i })).not.toBeInTheDocument()
  })

  it('shows "My Memorials" back link on edit route', () => {
    renderLayout('/dashboard/memorials/abc-123/edit')
    const link = screen.getByRole('link', { name: /my memorials/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard/memorials')
  })
})

describe('DashboardLayout — services routes', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: mockUser, session: {} as never, isLoading: false })
    vi.mocked(useProfile).mockReturnValue({
      data: mockProfile({ account_type: 'organization' }) as never,
      isLoading: false,
      error: null,
    } as never)
    vi.clearAllMocks()
  })

  it('shows "My Services" back link on services create route', () => {
    renderLayout('/dashboard/services/create')
    const link = screen.getByRole('link', { name: /my services/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard/services')
    expect(screen.queryByRole('link', { name: /^dashboard$/i })).not.toBeInTheDocument()
  })

  it('shows "My Services" back link on services edit route', () => {
    renderLayout('/dashboard/services/abc/edit')
    const link = screen.getByRole('link', { name: /my services/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard/services')
  })

  it('shows "Back to editing" button on services preview route', () => {
    renderLayout('/dashboard/services/preview')
    expect(screen.getByRole('button', { name: /back to editing/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^dashboard$/i })).not.toBeInTheDocument()
  })
})

describe('DashboardLayout — mobile drawer', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: mockUser, session: {} as never, isLoading: false })
    vi.mocked(useProfile).mockReturnValue({
      data: mockProfile({ account_type: 'individual' }) as never,
      isLoading: false,
      error: null,
    } as never)
    vi.clearAllMocks()
  })

  it('backdrop is not rendered when sidebar is closed', () => {
    renderLayout()
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument()
  })

  it('backdrop renders when sidebar is open', async () => {
    renderLayout()
    await userEvent.click(screen.getByRole('button', { name: 'Toggle navigation' }))
    expect(screen.getByTestId('sidebar-backdrop')).toBeInTheDocument()
  })

  it('clicking backdrop closes the sidebar', async () => {
    renderLayout()
    await userEvent.click(screen.getByRole('button', { name: 'Toggle navigation' }))
    await userEvent.click(screen.getByTestId('sidebar-backdrop'))
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Toggle navigation' }))
      .toHaveAttribute('aria-expanded', 'false')
  })
})

describe('DashboardLayout — unauthenticated', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, session: null, isLoading: false })
    vi.mocked(useProfile).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as never)
    vi.clearAllMocks()
  })

  it('redirects to /signin when not authenticated', () => {
    renderLayout()
    expect(screen.queryByRole('button', { name: 'Toggle navigation' })).not.toBeInTheDocument()
  })
})
