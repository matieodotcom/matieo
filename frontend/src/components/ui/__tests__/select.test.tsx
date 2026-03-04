import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import { Select } from '../Select'

const OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

describe('Select', () => {
  it('renders with placeholder when no value', () => {
    renderWithProviders(
      <Select value="" onValueChange={vi.fn()} placeholder="Select gender" options={OPTIONS} />,
    )
    expect(screen.getByText('Select gender')).toBeInTheDocument()
  })

  it('shows selected value label', () => {
    renderWithProviders(
      <Select value="male" onValueChange={vi.fn()} placeholder="Select gender" options={OPTIONS} />,
    )
    expect(screen.getByText('Male')).toBeInTheDocument()
  })

  it('calls onValueChange when an option is selected', async () => {
    const onValueChange = vi.fn()
    renderWithProviders(
      <Select value="" onValueChange={onValueChange} placeholder="Pick one" options={OPTIONS} />,
    )
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByText('Female'))
    expect(onValueChange).toHaveBeenCalledWith('female')
  })

  it('is disabled when disabled prop is true', () => {
    renderWithProviders(
      <Select value="" onValueChange={vi.fn()} options={OPTIONS} disabled />,
    )
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('renders with an id for accessibility', () => {
    renderWithProviders(
      <Select id="gender-select" value="" onValueChange={vi.fn()} options={OPTIONS} />,
    )
    expect(document.getElementById('gender-select')).toBeInTheDocument()
  })
})
