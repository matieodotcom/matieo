import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import { Navbar } from '@/components/layout/Navbar'

describe('Navbar', () => {
  it('renders the MATIEO logo', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByText('MATIEO')).toBeInTheDocument()
  })

  it('renders all nav links', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByText('Memorials')).toBeInTheDocument()
    expect(screen.getByText('Obituary')).toBeInTheDocument()
    expect(screen.getByText('Insights')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('renders Sign in and Sign up links', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })

  it('Sign up link points to /signup', () => {
    renderWithProviders(<Navbar />)
    const signUp = screen.getByRole('link', { name: 'Sign up' })
    expect(signUp).toHaveAttribute('href', '/signup')
  })

  it('Sign in link points to /signin', () => {
    renderWithProviders(<Navbar />)
    const signIn = screen.getByRole('link', { name: 'Sign in' })
    expect(signIn).toHaveAttribute('href', '/signin')
  })

  it('has accessible main navigation landmark', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })
})
