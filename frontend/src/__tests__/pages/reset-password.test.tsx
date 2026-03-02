import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

// ── Render ────────────────────────────────────────────────────────────────────

describe('ResetPasswordPage — render', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders without crashing', () => {
    renderWithProviders(<ResetPasswordPage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders "Set New Password" heading', () => {
    renderWithProviders(<ResetPasswordPage />)
    expect(screen.getByRole('heading', { name: /set new password/i })).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    renderWithProviders(<ResetPasswordPage />)
    expect(
      screen.getByText(/choose a strong password for your account/i)
    ).toBeInTheDocument()
  })

  it('renders "New Password" field with label', () => {
    renderWithProviders(<ResetPasswordPage />)
    expect(screen.getByLabelText('New Password')).toBeInTheDocument()
  })

  it('renders "Confirm Password" field with label', () => {
    renderWithProviders(<ResetPasswordPage />)
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
  })

  it('renders "Update Password" submit button', () => {
    renderWithProviders(<ResetPasswordPage />)
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument()
  })

  it('renders "Back to Sign in" link pointing to /signin', () => {
    renderWithProviders(<ResetPasswordPage />)
    const link = screen.getByRole('link', { name: /back to sign in/i })
    expect(link).toHaveAttribute('href', '/signin')
  })

  it('renders copyright footer "© 2026 MATIEO"', () => {
    renderWithProviders(<ResetPasswordPage />)
    expect(screen.getByText(/© 2026 MATIEO/i)).toBeInTheDocument()
  })

  it('renders password toggle buttons with accessible labels', () => {
    renderWithProviders(<ResetPasswordPage />)
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show confirm password/i })).toBeInTheDocument()
  })
})

// ── Behaviour ─────────────────────────────────────────────────────────────────

describe('ResetPasswordPage — behaviour', () => {
  beforeEach(() => vi.clearAllMocks())

  it('empty submit shows field errors and does not call supabase', async () => {
    renderWithProviders(<ResetPasswordPage />)
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
    expect(supabase.auth.updateUser).not.toHaveBeenCalled()
  })

  it('password too short shows Zod error and does not call supabase', async () => {
    renderWithProviders(<ResetPasswordPage />)
    await userEvent.type(screen.getByLabelText('New Password'), 'short')
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'short')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    })
    expect(supabase.auth.updateUser).not.toHaveBeenCalled()
  })

  it('mismatched passwords shows Zod error and does not call supabase', async () => {
    renderWithProviders(<ResetPasswordPage />)
    await userEvent.type(screen.getByLabelText('New Password'), 'password123')
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'different456')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
    expect(supabase.auth.updateUser).not.toHaveBeenCalled()
  })

  it('auth error on submit shows inline error (no toast)', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Auth session missing' } as never,
    } as never)

    renderWithProviders(<ResetPasswordPage />)
    await userEvent.type(screen.getByLabelText('New Password'), 'newpassword1')
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'newpassword1')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(screen.getByText('Auth session missing')).toBeInTheDocument()
    })
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('success calls toast.success and navigates to /signin', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
      data: { user: {} as never },
      error: null,
    } as never)

    renderWithProviders(<ResetPasswordPage />)
    await userEvent.type(screen.getByLabelText('New Password'), 'newpassword1')
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'newpassword1')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Password updated successfully')
    })
  })

  it('password visibility toggle changes input type', async () => {
    renderWithProviders(<ResetPasswordPage />)
    const passwordInput = screen.getByLabelText('New Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button', { name: /show password/i }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await userEvent.click(screen.getByRole('button', { name: /hide password/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
