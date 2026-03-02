import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import { Navbar } from '@/components/layout/Navbar'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

function renderNavbar() {
  return renderWithProviders(<Navbar />)
}

describe('Navbar — signed out', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, session: null, isLoading: false })
    vi.clearAllMocks()
  })

  it('renders the MATIEO logo', () => {
    renderNavbar()
    expect(screen.getByText('MATIEO')).toBeInTheDocument()
  })

  it('renders all nav links', () => {
    renderNavbar()
    expect(screen.getByText('Memorials')).toBeInTheDocument()
    expect(screen.getByText('Obituary')).toBeInTheDocument()
    expect(screen.getByText('Insights')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('renders Sign in and Sign up links', () => {
    renderNavbar()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })

  it('Sign up link points to /signup', () => {
    renderNavbar()
    const signUp = screen.getByRole('link', { name: 'Sign up' })
    expect(signUp).toHaveAttribute('href', '/signup')
  })

  it('Sign in link points to /signin', () => {
    renderNavbar()
    const signIn = screen.getByRole('link', { name: 'Sign in' })
    expect(signIn).toHaveAttribute('href', '/signin')
  })

  it('has accessible main navigation landmark', () => {
    renderNavbar()
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })
})

describe('Navbar — signed in', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@matieo.com',
    user_metadata: { full_name: 'Jane Smith', avatar_url: null },
  } as unknown as User

  beforeEach(() => {
    useAuthStore.setState({ user: mockUser, session: {} as never, isLoading: false })
    vi.clearAllMocks()
  })

  it('renders avatar button instead of Sign in/Sign up links', () => {
    renderNavbar()
    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument()
  })

  it('avatar button has aria-label "User menu"', () => {
    renderNavbar()
    const avatarBtn = screen.getByRole('button', { name: /user menu/i })
    expect(avatarBtn).toHaveAttribute('aria-label', 'User menu')
  })

  it('opens dropdown with Profile, Settings, Sign Out on click', async () => {
    renderNavbar()
    await userEvent.click(screen.getByRole('button', { name: /user menu/i }))

    expect(await screen.findByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('calls signOut when Sign Out is clicked', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null })
    renderNavbar()
    await userEvent.click(screen.getByRole('button', { name: /user menu/i }))
    await userEvent.click(await screen.findByText('Sign Out'))

    expect(supabase.auth.signOut).toHaveBeenCalledOnce()
  })

  it('renders neither avatar nor auth links when isLoading=true', () => {
    useAuthStore.setState({ user: null, session: null, isLoading: true })
    renderNavbar()

    expect(screen.queryByRole('button', { name: /user menu/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument()
  })
})
