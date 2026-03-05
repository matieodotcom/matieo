import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import { Select } from '@/components/ui/Select'

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
    expect(screen.getByPlaceholderText('Select gender')).toBeInTheDocument()
  })

  it('shows selected value label', () => {
    renderWithProviders(
      <Select value="male" onValueChange={vi.fn()} placeholder="Select gender" options={OPTIONS} />,
    )
    expect(screen.getByDisplayValue('Male')).toBeInTheDocument()
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

  it('filters options when typing in the combobox input', async () => {
    renderWithProviders(
      <Select value="" onValueChange={vi.fn()} placeholder="Pick one" options={OPTIONS} />,
    )
    await userEvent.type(screen.getByRole('combobox'), 'fem')
    expect(screen.getByText('Female')).toBeInTheDocument()
    expect(screen.queryByText('Male')).not.toBeInTheDocument()
    expect(screen.queryByText('Other')).not.toBeInTheDocument()
  })

  it('shows "No results" when query matches nothing', async () => {
    renderWithProviders(
      <Select value="" onValueChange={vi.fn()} placeholder="Pick one" options={OPTIONS} />,
    )
    await userEvent.type(screen.getByRole('combobox'), 'zzz')
    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('clears search when closed and reopened', async () => {
    renderWithProviders(
      <Select value="" onValueChange={vi.fn()} placeholder="Pick one" options={OPTIONS} />,
    )
    const input = screen.getByRole('combobox')
    await userEvent.type(input, 'fem')
    expect(screen.queryByText('Male')).not.toBeInTheDocument()
    // close by blurring
    await userEvent.tab()
    // reopen by focusing again
    await userEvent.click(input)
    expect(screen.getByText('Male')).toBeInTheDocument()
    expect(screen.getByText('Female')).toBeInTheDocument()
    expect(screen.getByText('Other')).toBeInTheDocument()
  })
})
