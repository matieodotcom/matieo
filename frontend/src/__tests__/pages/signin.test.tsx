import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import SignInPage from '@/pages/auth/SignInPage'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

describe('SignInPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders without crashing', () => {
    renderWithProviders(<SignInPage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders "Sign in" heading', () => {
    renderWithProviders(<SignInPage />)
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders welcome back subtitle', () => {
    renderWithProviders(<SignInPage />)
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
  })

  it('renders Email Address and Password fields with labels', () => {
    renderWithProviders(<SignInPage />)
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders Forgot Password? link pointing to /forgot-password', () => {
    renderWithProviders(<SignInPage />)
    const link = screen.getByRole('link', { name: /forgot password/i })
    expect(link).toHaveAttribute('href', '/forgot-password')
  })

  it('renders Sign In submit button', () => {
    renderWithProviders(<SignInPage />)
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument()
  })

  it('renders Login with Google button', () => {
    renderWithProviders(<SignInPage />)
    expect(screen.getByRole('button', { name: /login with google/i })).toBeInTheDocument()
  })

  it('renders Create New Account link pointing to /signup', () => {
    renderWithProviders(<SignInPage />)
    const link = screen.getByRole('link', { name: /create new account/i })
    expect(link).toHaveAttribute('href', '/signup')
  })

  it('renders Terms of Service and Privacy Policy links', () => {
    renderWithProviders(<SignInPage />)
    expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument()
  })

  it('renders copyright footer', () => {
    renderWithProviders(<SignInPage />)
    expect(screen.getByText(/© 2026 MATIEO/i)).toBeInTheDocument()
  })

  it('shows password toggle button with accessible label', () => {
    renderWithProviders(<SignInPage />)
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument()
  })

  it('toggles password visibility when eye button clicked', async () => {
    renderWithProviders(<SignInPage />)
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: /show password/i }))
    expect(input).toHaveAttribute('type', 'text')
  })

  it('shows field errors on empty submit (no supabase call)', async () => {
    renderWithProviders(<SignInPage />)
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled()
  })

  it('shows invalid email error from Zod', async () => {
    renderWithProviders(<SignInPage />)
    await userEvent.type(screen.getByLabelText('Email Address'), 'not-an-email')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled()
  })

  it('shows inline error on wrong credentials (no toast)', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' } as never,
    })

    renderWithProviders(<SignInPage />)
    await userEvent.type(screen.getByLabelText('Email Address'), 'jane@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
    })
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('renders right panel heading', () => {
    renderWithProviders(<SignInPage />)
    expect(screen.getByText(/a modern way to remember/i)).toBeInTheDocument()
  })

  it('shows unconfirmed banner (not generic error) when Supabase returns "Email not confirmed"', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Email not confirmed' } as never,
    })

    renderWithProviders(<SignInPage />)
    await userEvent.type(screen.getByLabelText('Email Address'), 'jane@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/email not verified/i)).toBeInTheDocument()
    })
    expect(screen.queryByText('Email not confirmed')).not.toBeInTheDocument()
  })

  it('resend button visible inside banner and clickable', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Email not confirmed' } as never,
    })
    vi.mocked(supabase.auth.resend).mockResolvedValueOnce({ data: {}, error: null } as never)

    renderWithProviders(<SignInPage />)
    await userEvent.type(screen.getByLabelText('Email Address'), 'jane@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /resend verification email/i }))

    expect(supabase.auth.resend).toHaveBeenCalledOnce()
  })

  it('resend button shows "Resend in Ns" text after first resend (cooldown active)', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Email not confirmed' } as never,
    })
    vi.mocked(supabase.auth.resend).mockResolvedValueOnce({ data: {}, error: null } as never)

    renderWithProviders(<SignInPage />)
    await userEvent.type(screen.getByLabelText('Email Address'), 'jane@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /resend verification email/i }))

    await waitFor(() => {
      expect(screen.getByText(/resend in \d+s/i)).toBeInTheDocument()
    })
  })
})
