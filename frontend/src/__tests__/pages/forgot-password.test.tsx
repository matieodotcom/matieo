import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

describe('ForgotPasswordPage — Screen 1 render', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders without crashing', () => {
    renderWithProviders(<ForgotPasswordPage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders "Forgot Password?" heading', () => {
    renderWithProviders(<ForgotPasswordPage />)
    expect(screen.getByRole('heading', { name: /forgot password\?/i })).toBeInTheDocument()
  })

  it('renders subtitle about reset instructions', () => {
    renderWithProviders(<ForgotPasswordPage />)
    expect(screen.getByText(/no worries.*reset instructions/i)).toBeInTheDocument()
  })

  it('renders Email Address field with label', () => {
    renderWithProviders(<ForgotPasswordPage />)
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
  })

  it('renders "Reset Password" submit button', () => {
    renderWithProviders(<ForgotPasswordPage />)
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })

  it('renders "Back to Sign in" link pointing to /signin', () => {
    renderWithProviders(<ForgotPasswordPage />)
    const link = screen.getByRole('link', { name: /back to sign in/i })
    expect(link).toHaveAttribute('href', '/signin')
  })

  it('renders copyright footer "© 2026 MATIEO"', () => {
    renderWithProviders(<ForgotPasswordPage />)
    expect(screen.getByText(/© 2026 MATIEO/i)).toBeInTheDocument()
  })
})

describe('ForgotPasswordPage — Screen 1 behaviour', () => {
  beforeEach(() => vi.clearAllMocks())

  it('empty submit shows field error and does not call supabase', async () => {
    renderWithProviders(<ForgotPasswordPage />)
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
    expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled()
  })

  it('invalid email shows Zod error and does not call supabase', async () => {
    renderWithProviders(<ForgotPasswordPage />)
    await userEvent.type(screen.getByLabelText('Email Address'), 'not-an-email')
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
    expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled()
  })

  it('auth error on submit shows inline error (no toast)', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
      data: {},
      error: { message: 'Email rate limit exceeded' } as never,
    })

    renderWithProviders(<ForgotPasswordPage />)
    await userEvent.type(screen.getByLabelText('Email Address'), 'jane@example.com')
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => {
      expect(screen.getByText('Email rate limit exceeded')).toBeInTheDocument()
    })
    expect(toast.success).not.toHaveBeenCalled()
  })
})

describe('ForgotPasswordPage — Screen 2', () => {
  beforeEach(() => vi.clearAllMocks())

  async function submitValidEmail() {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: null,
    } as never)
    renderWithProviders(<ForgotPasswordPage />)
    await userEvent.type(screen.getByLabelText('Email Address'), 'jane@example.com')
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument()
    })
  }

  it('successful submit shows "Check your email" heading', async () => {
    await submitValidEmail()
    expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument()
  })

  it('successful submit displays the submitted email', async () => {
    await submitValidEmail()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('successful submit shows "Open email" button', async () => {
    await submitValidEmail()
    expect(screen.getByRole('button', { name: /open email/i })).toBeInTheDocument()
  })

  it('"Click to resend" triggers another resetPasswordForEmail call', async () => {
    await submitValidEmail()
    await userEvent.click(screen.getByRole('button', { name: /click to resend/i }))

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledTimes(2)
    })
  })
})
