import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import LandingPage from '@/pages/landing/LandingPage'
import { useAuthStore } from '@/store/authStore'

// ── Mock useWaitlist so we control mutation state in tests ────────────────────

const mockSubmit = vi.fn()
const mockWaitlistState = {
  submit: mockSubmit,
  isPending: false,
  isSuccess: false,
  isError: false,
  errorMessage: null as string | null,
}

vi.mock('@/hooks/use-waitlist', () => ({
  useWaitlist: () => mockWaitlistState,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function setAuthState(user: object | null, isLoading = false) {
  useAuthStore.setState({ user: user as never, isLoading })
}

beforeEach(() => {
  // Default: logged-out, auth resolved
  setAuthState(null, false)
  // Reset mutation state
  mockWaitlistState.submit = mockSubmit
  mockWaitlistState.isPending = false
  mockWaitlistState.isSuccess = false
  mockWaitlistState.isError = false
  mockWaitlistState.errorMessage = null
  mockSubmit.mockReset()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LandingPage', () => {
  it('renders without crashing', () => {
    renderWithProviders(<LandingPage />)
  })

  describe('Hero section', () => {
    it('renders the main heading', () => {
      renderWithProviders(<LandingPage />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        /Honoring Lives.*Preserving.*Memories/s,
      )
    })

    it('renders Create Memorial CTA buttons', () => {
      renderWithProviders(<LandingPage />)
      const buttons = screen.getAllByRole('button', { name: /Create Memorial/i })
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('renders Create Obituary CTA buttons', () => {
      renderWithProviders(<LandingPage />)
      const buttons = screen.getAllByRole('button', { name: /Create Obituary/i })
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('opens sign-in modal when unauthenticated user clicks Create Obituary', async () => {
      setAuthState(null, false)
      renderWithProviders(<LandingPage />)
      const [firstButton] = screen.getAllByRole('button', { name: /Create Obituary/i })
      fireEvent.click(firstButton)
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('does not open sign-in modal when authenticated user clicks Create Obituary', () => {
      setAuthState({ id: 'user-1', email: 'user@matieo.com' }, false)
      renderWithProviders(<LandingPage />)
      const [firstButton] = screen.getAllByRole('button', { name: /Create Obituary/i })
      fireEvent.click(firstButton)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders trust badge', () => {
      renderWithProviders(<LandingPage />)
      expect(screen.getByText(/Trusted by 30,000\+ Families/)).toBeInTheDocument()
    })
  })

  describe('Features section', () => {
    it('renders the features heading', () => {
      renderWithProviders(<LandingPage />)
      expect(
        screen.getByRole('heading', { name: /Everything You Need in One Platform/i }),
      ).toBeInTheDocument()
    })

    it('renders all 6 feature card headings', () => {
      renderWithProviders(<LandingPage />)
      const headings = screen.getAllByRole('heading').map((h) => h.textContent)
      expect(headings).toContain('Obituary')
      expect(headings).toContain('Digital Memorials')
      expect(headings).toContain('Funeral Services')
      expect(headings).toContain('Insights')
      expect(headings).toContain('Privacy & Security')
      expect(headings).toContain('Community Support')
    })
  })

  describe('How It Works section', () => {
    it('renders the section heading', () => {
      renderWithProviders(<LandingPage />)
      expect(screen.getByRole('heading', { name: /How It Works/i })).toBeInTheDocument()
    })

    it('renders play buttons with accessible labels', () => {
      renderWithProviders(<LandingPage />)
      expect(screen.getByRole('button', { name: /Play Memorials tutorial/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Play Obituary tutorial/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Play Insights tutorial/i })).toBeInTheDocument()
    })
  })

  describe('Stats section', () => {
    it('renders Trusted by Thousands heading', () => {
      renderWithProviders(<LandingPage />)
      expect(screen.getByRole('heading', { name: /Trusted by Thousands/i })).toBeInTheDocument()
    })

    it('renders all 4 stats', () => {
      renderWithProviders(<LandingPage />)
      expect(screen.getByText('500K+')).toBeInTheDocument()
      expect(screen.getByText('2.5M+')).toBeInTheDocument()
      expect(screen.getByText('1B+')).toBeInTheDocument()
      expect(screen.getByText('99.9%')).toBeInTheDocument()
    })
  })

  describe('Testimonials section', () => {
    it('renders the section heading', () => {
      renderWithProviders(<LandingPage />)
      expect(screen.getByRole('heading', { name: /What Our Users Say/i })).toBeInTheDocument()
    })

    it('renders all 6 testimonial articles', () => {
      renderWithProviders(<LandingPage />)
      expect(screen.getAllByRole('article').length).toBe(6)
    })

    it('renders rating summary', () => {
      renderWithProviders(<LandingPage />)
      expect(screen.getByText(/4\.9 out of 5 stars/)).toBeInTheDocument()
    })
  })

  describe('CTA section', () => {
    it('renders Get Started Today heading', () => {
      renderWithProviders(<LandingPage />)
      expect(screen.getByRole('heading', { name: /Get Started Today/i })).toBeInTheDocument()
    })

    it('renders trust signals', () => {
      renderWithProviders(<LandingPage />)
      expect(screen.getByText('No hidden fees')).toBeInTheDocument()
      expect(screen.getByText('Cancel anytime')).toBeInTheDocument()
      expect(screen.getByText('Get support')).toBeInTheDocument()
    })
  })

  describe('Waitlist section — auth-aware visibility', () => {
    it('renders when user is null and auth is resolved', () => {
      setAuthState(null, false)
      renderWithProviders(<LandingPage />)
      expect(
        screen.getByRole('heading', { name: /Not Ready To Sign Up Yet\?/i }),
      ).toBeInTheDocument()
    })

    it('does not render when a user is signed in', () => {
      setAuthState({ id: 'user-1', email: 'user@matieo.com' }, false)
      renderWithProviders(<LandingPage />)
      expect(
        screen.queryByRole('heading', { name: /Not Ready To Sign Up Yet\?/i }),
      ).not.toBeInTheDocument()
    })

    it('does not render while auth is still loading', () => {
      setAuthState(null, true)
      renderWithProviders(<LandingPage />)
      expect(
        screen.queryByRole('heading', { name: /Not Ready To Sign Up Yet\?/i }),
      ).not.toBeInTheDocument()
    })

    it('renders name and email inputs with proper labels', () => {
      renderWithProviders(<LandingPage />)
      expect(screen.getByLabelText('Your name')).toBeInTheDocument()
      expect(screen.getByLabelText('Your email')).toBeInTheDocument()
    })

    it('calls submit with name and email on form submit', async () => {
      renderWithProviders(<LandingPage />)

      fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Jane Doe' } })
      fireEvent.change(screen.getByLabelText('Your email'), { target: { value: 'jane@example.com' } })
      fireEvent.click(screen.getByRole('button', { name: /Follow Us/i }))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          { name: 'Jane Doe', email: 'jane@example.com' },
        )
      })
    })

    it('shows success state when isSuccess is true', () => {
      mockWaitlistState.isSuccess = true
      renderWithProviders(<LandingPage />)
      expect(screen.getByText(/You're in!/i)).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Follow Us/i })).not.toBeInTheDocument()
    })

    it('shows error message when isError is true', () => {
      mockWaitlistState.isError = true
      mockWaitlistState.errorMessage = 'Already subscribed'
      renderWithProviders(<LandingPage />)
      expect(screen.getByText('Already subscribed')).toBeInTheDocument()
    })

    it('disables inputs and button while isPending', () => {
      mockWaitlistState.isPending = true
      renderWithProviders(<LandingPage />)
      expect(screen.getByLabelText('Your name')).toBeDisabled()
      expect(screen.getByLabelText('Your email')).toBeDisabled()
      expect(screen.getByRole('button', { name: /Sending/i })).toBeDisabled()
    })
  })
})
