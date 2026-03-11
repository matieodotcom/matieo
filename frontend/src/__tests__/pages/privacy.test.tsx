import { render, screen } from '../utils'
import PrivacyPage from '@/pages/legal/PrivacyPage'

describe('PrivacyPage', () => {
  beforeEach(() => {
    render(<PrivacyPage />)
  })

  it('renders H1 "Privacy Policy"', () => {
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument()
  })

  it('renders "Last updated" text', () => {
    expect(screen.getByText(/last updated:/i)).toBeInTheDocument()
  })

  it('renders "1. Introduction" section heading', () => {
    expect(screen.getByRole('heading', { level: 2, name: '1. Introduction' })).toBeInTheDocument()
  })

  it('renders "2. Information We Collect" section heading', () => {
    expect(
      screen.getByRole('heading', { level: 2, name: '2. Information We Collect' }),
    ).toBeInTheDocument()
  })

  it('renders "2.1 Information You Provide" subsection heading', () => {
    expect(
      screen.getByRole('heading', { level: 3, name: '2.1 Information You Provide' }),
    ).toBeInTheDocument()
  })

  it('renders "2.2 Information Collected Automatically" subsection heading', () => {
    expect(
      screen.getByRole('heading', { level: 3, name: '2.2 Information Collected Automatically' }),
    ).toBeInTheDocument()
  })

  it('renders "2.3 Information from Third Parties" subsection heading', () => {
    expect(
      screen.getByRole('heading', { level: 3, name: '2.3 Information from Third Parties' }),
    ).toBeInTheDocument()
  })

  it('renders "3. How We Use Your Information" section heading', () => {
    expect(
      screen.getByRole('heading', { level: 2, name: '3. How We Use Your Information' }),
    ).toBeInTheDocument()
  })

  it('renders "9. Contact Us" section heading', () => {
    expect(screen.getByRole('heading', { level: 2, name: '9. Contact Us' })).toBeInTheDocument()
  })

  it('renders legal@matieo.com email', () => {
    const matches = screen.getAllByText(/legal@matieo\.com/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('renders "View Terms of Service" link pointing to /terms', () => {
    const link = screen.getByRole('link', { name: /view terms of service/i })
    expect(link).toHaveAttribute('href', '/terms')
  })

  it('renders "View Cookie Policy" link pointing to /cookie-policy', () => {
    const link = screen.getByRole('link', { name: /view cookie policy/i })
    expect(link).toHaveAttribute('href', '/cookie-policy')
  })

  it('does not render a "Back to Sign Up" link', () => {
    expect(screen.queryByRole('link', { name: /back to sign up/i })).not.toBeInTheDocument()
  })
})
