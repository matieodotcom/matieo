import { render, screen } from '../utils'
import TermsPage from '@/pages/legal/TermsPage'

describe('TermsPage', () => {
  beforeEach(() => {
    render(<TermsPage />)
  })

  it('renders H1 "Terms of Service"', () => {
    expect(screen.getByRole('heading', { level: 1, name: 'Terms of Service' })).toBeInTheDocument()
  })

  it('renders "Last updated" text', () => {
    expect(screen.getByText(/last updated:/i)).toBeInTheDocument()
  })

  it('renders "1. Introduction" section heading', () => {
    expect(screen.getByRole('heading', { level: 2, name: '1. Introduction' })).toBeInTheDocument()
  })

  it('renders "2. Use of Service" section heading', () => {
    expect(
      screen.getByRole('heading', { level: 2, name: '2. Use of Service' }),
    ).toBeInTheDocument()
  })

  it('renders "2.1 Eligibility" subsection heading', () => {
    expect(
      screen.getByRole('heading', { level: 3, name: '2.1 Eligibility' }),
    ).toBeInTheDocument()
  })

  it('renders "2.2 Account Registration" subsection heading', () => {
    expect(
      screen.getByRole('heading', { level: 3, name: '2.2 Account Registration' }),
    ).toBeInTheDocument()
  })

  it('renders "2.3 Acceptable Use" subsection heading', () => {
    expect(
      screen.getByRole('heading', { level: 3, name: '2.3 Acceptable Use' }),
    ).toBeInTheDocument()
  })

  it('renders "3. Data and Privacy" section heading', () => {
    expect(
      screen.getByRole('heading', { level: 2, name: '3. Data and Privacy' }),
    ).toBeInTheDocument()
  })

  it('renders "9. Contact Us" section heading', () => {
    expect(screen.getByRole('heading', { level: 2, name: '9. Contact Us' })).toBeInTheDocument()
  })

  it('renders legal@matieo.com email', () => {
    expect(screen.getByText(/legal@matieo\.com/i)).toBeInTheDocument()
  })

  it('renders "View Privacy Policy" link pointing to /privacy', () => {
    const link = screen.getByRole('link', { name: /view privacy policy/i })
    expect(link).toHaveAttribute('href', '/privacy')
  })

  it('renders "View Cookie Policy" link pointing to /cookie-policy', () => {
    const link = screen.getByRole('link', { name: /view cookie policy/i })
    expect(link).toHaveAttribute('href', '/cookie-policy')
  })
})
