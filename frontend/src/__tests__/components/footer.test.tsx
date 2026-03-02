import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import { Footer } from '@/components/layout/Footer'

describe('Footer', () => {
  it('renders the MATIEO brand name', () => {
    renderWithProviders(<Footer />)
    expect(screen.getAllByText('MATIEO').length).toBeGreaterThan(0)
  })

  it('renders all column headings', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
    expect(screen.getByText('Resources')).toBeInTheDocument()
  })

  it('renders copyright notice', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByText(/© 2026 MATIEO/)).toBeInTheDocument()
  })

  it('renders legal links', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    expect(screen.getByText('Cookie Policy')).toBeInTheDocument()
  })

  it('renders social icon links with aria-labels', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByRole('link', { name: 'Facebook' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Twitter' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Instagram' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument()
  })
})
