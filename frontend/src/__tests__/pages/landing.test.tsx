import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import LandingPage from '@/pages/landing/LandingPage'

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

    it('renders Create Memorial CTA links', () => {
      renderWithProviders(<LandingPage />)
      // Appears in both hero and CTA section
      const links = screen.getAllByRole('link', { name: /Create Memorial/i })
      expect(links.length).toBeGreaterThan(0)
    })

    it('renders Create Obituary CTA links', () => {
      renderWithProviders(<LandingPage />)
      const links = screen.getAllByRole('link', { name: /Create Obituary/i })
      expect(links.length).toBeGreaterThan(0)
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
      // Use heading role to avoid matching nav links or footer links with same text
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

  describe('Waitlist section', () => {
    it('renders the section heading', () => {
      renderWithProviders(<LandingPage />)
      expect(
        screen.getByRole('heading', { name: /Not Ready To Sign Up Yet\?/i }),
      ).toBeInTheDocument()
    })

    it('renders name and email inputs with proper labels', () => {
      renderWithProviders(<LandingPage />)
      expect(screen.getByLabelText('Your name')).toBeInTheDocument()
      expect(screen.getByLabelText('Your email')).toBeInTheDocument()
    })

    it('shows success message after form submission', () => {
      renderWithProviders(<LandingPage />)
      const nameInput = screen.getByLabelText('Your name')
      const emailInput = screen.getByLabelText('Your email')
      const submitBtn = screen.getByRole('button', { name: /Follow Us/i })

      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } })
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } })
      fireEvent.click(submitBtn)

      expect(screen.getByText(/You're in!/i)).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Follow Us/i })).not.toBeInTheDocument()
    })
  })
})
