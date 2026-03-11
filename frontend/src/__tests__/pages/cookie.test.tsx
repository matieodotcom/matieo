import { render, screen } from '../utils'
import CookiePage from '@/pages/legal/CookiePage'

describe('CookiePage', () => {
  beforeEach(() => {
    render(<CookiePage />)
  })

  it('renders H1 "Cookie Policy"', () => {
    expect(screen.getByRole('heading', { level: 1, name: 'Cookie Policy' })).toBeInTheDocument()
  })

  it('renders "Last updated" text', () => {
    expect(screen.getByText(/last updated:/i)).toBeInTheDocument()
  })

  it('renders "1. What Are Cookies" section heading', () => {
    expect(
      screen.getByRole('heading', { level: 2, name: '1. What Are Cookies' }),
    ).toBeInTheDocument()
  })

  it('renders "2. Types of Cookies We Use" section heading', () => {
    expect(
      screen.getByRole('heading', { level: 2, name: '2. Types of Cookies We Use' }),
    ).toBeInTheDocument()
  })

  it('renders "2.1 Essential Cookies" subsection heading', () => {
    expect(
      screen.getByRole('heading', { level: 3, name: '2.1 Essential Cookies' }),
    ).toBeInTheDocument()
  })

  it('renders "2.2 Analytics Cookies" subsection heading', () => {
    expect(
      screen.getByRole('heading', { level: 3, name: '2.2 Analytics Cookies' }),
    ).toBeInTheDocument()
  })

  it('renders "2.3 Functional Cookies" subsection heading', () => {
    expect(
      screen.getByRole('heading', { level: 3, name: '2.3 Functional Cookies' }),
    ).toBeInTheDocument()
  })

  it('renders "3. Third-Party Cookies" section heading', () => {
    expect(
      screen.getByRole('heading', { level: 2, name: '3. Third-Party Cookies' }),
    ).toBeInTheDocument()
  })

  it('renders "4. Managing Your Cookies" section heading', () => {
    expect(
      screen.getByRole('heading', { level: 2, name: '4. Managing Your Cookies' }),
    ).toBeInTheDocument()
  })

  it('renders "5. Changes to This Policy" section heading', () => {
    expect(
      screen.getByRole('heading', { level: 2, name: '5. Changes to This Policy' }),
    ).toBeInTheDocument()
  })

  it('renders "6. Contact Us" section heading', () => {
    expect(screen.getByRole('heading', { level: 2, name: '6. Contact Us' })).toBeInTheDocument()
  })

  it('renders legal@matieo.com email', () => {
    const matches = screen.getAllByText(/legal@matieo\.com/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('renders "View Privacy Policy" link pointing to /privacy', () => {
    const link = screen.getByRole('link', { name: /view privacy policy/i })
    expect(link).toHaveAttribute('href', '/privacy')
  })

  it('renders "View Terms of Service" link pointing to /terms', () => {
    const link = screen.getByRole('link', { name: /view terms of service/i })
    expect(link).toHaveAttribute('href', '/terms')
  })
})
