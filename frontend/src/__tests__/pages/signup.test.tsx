import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import SignUpPage from '@/pages/auth/SignUpPage'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

describe('SignUpPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders without crashing', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders Google Sign Up button', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
  })

  it('renders full name field with label', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
  })

  it('renders email field with label', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
  })

  it('renders password field with label', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders link to /signin', () => {
    renderWithProviders(<SignUpPage />)
    const signInLink = screen.getByRole('link', { name: /sign in/i })
    expect(signInLink).toHaveAttribute('href', '/signin')
  })

  it('shows password toggle button with accessible label', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument()
  })

  it('toggles password visibility when eye button clicked', async () => {
    renderWithProviders(<SignUpPage />)
    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button', { name: /show password/i }))
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('shows field errors when submitting with empty fields (no supabase call)', async () => {
    renderWithProviders(<SignUpPage />)
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
    expect(supabase.auth.signUp).not.toHaveBeenCalled()
  })

  it('shows invalid email error from Zod', async () => {
    renderWithProviders(<SignUpPage />)

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Smith')
    await userEvent.type(screen.getByLabelText(/email address/i), 'not-an-email')
    await userEvent.type(screen.getByLabelText('Password'),'password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
    expect(supabase.auth.signUp).not.toHaveBeenCalled()
  })

  it('shows short password error from Zod', async () => {
    renderWithProviders(<SignUpPage />)

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Smith')
    await userEvent.type(screen.getByLabelText(/email address/i), 'jane@example.com')
    await userEvent.type(screen.getByLabelText('Password'),'short')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    })
    expect(supabase.auth.signUp).not.toHaveBeenCalled()
  })

  it('shows verify email heading after successful submit', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: null,
    } as never)

    renderWithProviders(<SignUpPage />)

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Smith')
    await userEvent.type(screen.getByLabelText(/email address/i), 'jane@example.com')
    await userEvent.type(screen.getByLabelText('Password'),'password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/verify your email/i)).toBeInTheDocument()
    })
  })

  it('calls toast.success after successful submit', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: null,
    } as never)

    renderWithProviders(<SignUpPage />)

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Smith')
    await userEvent.type(screen.getByLabelText(/email address/i), 'jane@example.com')
    await userEvent.type(screen.getByLabelText('Password'),'password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('jane@example.com')
      )
    })
  })

  it('shows inline auth error on submit failure (no toast)', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'User already registered' } as never,
    })

    renderWithProviders(<SignUpPage />)

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Smith')
    await userEvent.type(screen.getByLabelText(/email address/i), 'jane@example.com')
    await userEvent.type(screen.getByLabelText('Password'),'password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('User already registered')).toBeInTheDocument()
    })
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('shows email in success state', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: null,
    } as never)

    renderWithProviders(<SignUpPage />)

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Smith')
    await userEvent.type(screen.getByLabelText(/email address/i), 'jane@example.com')
    await userEvent.type(screen.getByLabelText('Password'),'password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })
  })
})
