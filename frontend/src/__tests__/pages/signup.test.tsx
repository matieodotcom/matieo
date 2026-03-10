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

// Select account type
async function selectAccountType(type: 'Individual' | 'Organization' = 'Individual') {
  await userEvent.click(
    screen.getByRole('button', { name: new RegExp(`sign up as ${type}`, 'i') })
  )
}

// Helper to fill the form with valid values
async function fillForm(overrides: Partial<{
  accountType: 'Individual' | 'Organization'
  firstName: string
  lastName: string
  organizationName: string
  email: string
  confirmEmail: string
  password: string
  confirmPassword: string
}> = {}) {
  const type = overrides.accountType ?? 'Individual'
  // Individual is default — only click if switching to Organization
  if (type === 'Organization') await selectAccountType('Organization')

  if (type === 'Individual') {
    const values = {
      firstName: overrides.firstName ?? 'Jane',
      lastName: overrides.lastName ?? 'Smith',
      email: overrides.email ?? 'jane@example.com',
      confirmEmail: overrides.confirmEmail ?? 'jane@example.com',
      password: overrides.password ?? 'password123',
      confirmPassword: overrides.confirmPassword ?? 'password123',
    }
    await userEvent.type(screen.getByLabelText('First name'), values.firstName)
    await userEvent.type(screen.getByLabelText('Last name'), values.lastName)
    await userEvent.type(screen.getByLabelText('Email'), values.email)
    await userEvent.type(screen.getByLabelText('Confirm email'), values.confirmEmail)
    await userEvent.type(screen.getByLabelText('Password'), values.password)
    await userEvent.type(screen.getByLabelText('Confirm password'), values.confirmPassword)
  } else {
    const values = {
      organizationName: overrides.organizationName ?? 'Acme Corp',
      email: overrides.email ?? 'org@example.com',
      confirmEmail: overrides.confirmEmail ?? 'org@example.com',
      password: overrides.password ?? 'password123',
      confirmPassword: overrides.confirmPassword ?? 'password123',
    }
    await userEvent.type(screen.getByLabelText('Organization Name'), values.organizationName)
    await userEvent.type(screen.getByLabelText('Email'), values.email)
    await userEvent.type(screen.getByLabelText('Confirm email'), values.confirmEmail)
    await userEvent.type(screen.getByLabelText('Password'), values.password)
    await userEvent.type(screen.getByLabelText('Confirm password'), values.confirmPassword)
  }
}

describe('SignUpPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders without crashing', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders "Sign up" heading', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument()
  })

  it('renders 14 days free trial subtitle', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByText(/14 days free trial/i)).toBeInTheDocument()
  })

  it('renders account type selector with Individual and Organization buttons', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByRole('button', { name: /sign up as individual/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up as organization/i })).toBeInTheDocument()
  })

  it('renders Google Sign Up button', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByRole('button', { name: /sign up with google/i })).toBeInTheDocument()
  })

  it('Individual is selected by default — Google button enabled', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByRole('button', { name: /sign up with google/i })).not.toBeDisabled()
  })

  it('Individual is selected by default — First/Last name fields visible', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByLabelText('First name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last name')).toBeInTheDocument()
  })

  it('shows Organization Name field after selecting Organization', async () => {
    renderWithProviders(<SignUpPage />)
    await selectAccountType('Organization')
    expect(screen.getByLabelText('Organization Name')).toBeInTheDocument()
    expect(screen.queryByLabelText('First name')).not.toBeInTheDocument()
  })

  it('switching back to Individual hides Organization Name field', async () => {
    renderWithProviders(<SignUpPage />)
    await selectAccountType('Organization')
    await selectAccountType('Individual')
    expect(screen.getByLabelText('First name')).toBeInTheDocument()
    expect(screen.queryByLabelText('Organization Name')).not.toBeInTheDocument()
  })

  it('renders Email, Confirm email, Password, Confirm password fields', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
  })

  it('renders "Log in now" link pointing to /signin', () => {
    renderWithProviders(<SignUpPage />)
    const link = screen.getByRole('link', { name: /log in now/i })
    expect(link).toHaveAttribute('href', '/signin')
  })

  it('renders Terms of Service and Privacy Policy links', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument()
  })

  it('renders copyright footer', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByText(/© 2026 MATIEO/i)).toBeInTheDocument()
  })

  it('shows password toggle buttons with accessible labels', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByRole('button', { name: /show password$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show confirm password/i })).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    renderWithProviders(<SignUpPage />)
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: /show password$/i }))
    expect(input).toHaveAttribute('type', 'text')
  })

  it('submit button is enabled by default (Individual pre-selected)', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByRole('button', { name: /^sign up$/i })).not.toBeDisabled()
  })

  it('shows field errors when submitting empty individual form (no supabase call)', async () => {
    renderWithProviders(<SignUpPage />)
    await userEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
    expect(supabase.auth.signUp).not.toHaveBeenCalled()
  })

  it('shows invalid email error from Zod', async () => {
    renderWithProviders(<SignUpPage />)
    await fillForm({ email: 'not-an-email', confirmEmail: 'not-an-email' })
    await userEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
    expect(supabase.auth.signUp).not.toHaveBeenCalled()
  })

  it('shows short password error from Zod', async () => {
    renderWithProviders(<SignUpPage />)
    await fillForm({ password: 'short', confirmPassword: 'short' })
    await userEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    })
    expect(supabase.auth.signUp).not.toHaveBeenCalled()
  })

  it('shows mismatch error when confirm email differs', async () => {
    renderWithProviders(<SignUpPage />)
    await fillForm({ confirmEmail: 'different@example.com' })
    await userEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

    await waitFor(() => {
      expect(screen.getByText(/do not match/i)).toBeInTheDocument()
    })
    expect(supabase.auth.signUp).not.toHaveBeenCalled()
  })

  it('shows mismatch error when confirm password differs', async () => {
    renderWithProviders(<SignUpPage />)
    await fillForm({ confirmPassword: 'differentpass' })
    await userEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

    await waitFor(() => {
      expect(screen.getByText(/do not match/i)).toBeInTheDocument()
    })
    expect(supabase.auth.signUp).not.toHaveBeenCalled()
  })

  it('shows verification banner after successful individual submit', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: { identities: [{ id: '1' }] }, session: null },
      error: null,
    } as never)

    renderWithProviders(<SignUpPage />)
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText(/verification link sent/i)).toBeInTheDocument()
    })
  })

  it('shows verification banner after successful organization submit', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: { identities: [{ id: '1' }] }, session: null },
      error: null,
    } as never)

    renderWithProviders(<SignUpPage />)
    await fillForm({ accountType: 'Organization' })
    await userEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText(/verification link sent/i)).toBeInTheDocument()
    })
  })

  it('calls toast.success after successful submit', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: { identities: [{ id: '1' }] }, session: null },
      error: null,
    } as never)

    renderWithProviders(<SignUpPage />)
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

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
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

    await waitFor(() => {
      expect(screen.getByText('User already registered')).toBeInTheDocument()
    })
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('shows right panel heading on desktop', () => {
    renderWithProviders(<SignUpPage />)
    expect(screen.getByText(/a modern way to remember/i)).toBeInTheDocument()
  })
})
