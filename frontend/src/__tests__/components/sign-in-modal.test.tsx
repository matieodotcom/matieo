import { render, screen, fireEvent } from '../utils'
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/hooks/use-auth', () => ({
  useSignIn: vi.fn(() => ({
    form: {
      register: vi.fn(() => ({})),
      formState: { errors: {} },
      handleSubmit: (fn: unknown) => fn,
    },
    onSubmit: vi.fn(),
    isPending: false,
    error: null,
  })),
  useGoogleAuth: vi.fn(() => ({
    handleGoogleAuth: vi.fn(),
    isPending: false,
    error: null,
  })),
}))

async function getModal() {
  const { SignInModal } = await import('@/components/auth/SignInModal')
  return SignInModal
}

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  onSuccess: vi.fn(),
}

describe('SignInModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when open is true', async () => {
    const Modal = await getModal()
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render dialog content when open is false', async () => {
    const Modal = await getModal()
    render(<Modal {...defaultProps} open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders "Sign in" heading', async () => {
    const Modal = await getModal()
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('renders email input', async () => {
    const Modal = await getModal()
    render(<Modal {...defaultProps} />)
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
  })

  it('renders password input', async () => {
    const Modal = await getModal()
    render(<Modal {...defaultProps} />)
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders "Forgot Password?" link', async () => {
    const Modal = await getModal()
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
  })

  it('renders "Login with Google" button', async () => {
    const Modal = await getModal()
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /login with google/i })).toBeInTheDocument()
  })

  it('renders "Create New Account" link', async () => {
    const Modal = await getModal()
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('link', { name: /create new account/i })).toBeInTheDocument()
  })

  it('calls onOpenChange(false) when close button clicked', async () => {
    const onOpenChange = vi.fn()
    const Modal = await getModal()
    render(<Modal {...defaultProps} onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
