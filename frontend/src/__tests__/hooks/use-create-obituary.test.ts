import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AllProviders } from '@/__tests__/utils'
import { sanitiseSlug, deriveSlug } from '@/hooks/use-create-obituary'

// Mock apiClient
vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({}) }
})

describe('sanitiseSlug', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(sanitiseSlug('John Doe')).toBe('john-doe')
  })

  it("removes special characters", () => {
    expect(sanitiseSlug("John O'Brien")).toBe('john-obrien')
  })

  it('collapses multiple hyphens', () => {
    expect(sanitiseSlug('john  doe')).toBe('john-doe')
  })
})

describe('deriveSlug', () => {
  it('derives slug from first + last name and year', () => {
    expect(deriveSlug('John', 'Doe', '2024')).toBe('john-doe-2024')
  })

  it('returns empty string when name is empty', () => {
    expect(deriveSlug('', '', '2024')).toBe('')
  })

  it('omits year when not provided', () => {
    expect(deriveSlug('Jane', 'Smith')).toBe('jane-smith')
  })
})

describe('useObituaryForm', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  it('initialises with empty default values', async () => {
    const { useObituaryForm } = await import('@/hooks/use-create-obituary')
    const { result } = renderHook(() => useObituaryForm(), { wrapper: AllProviders })
    expect(result.current.form.getValues('firstName')).toBe('')
    expect(result.current.form.getValues('biography')).toBe('')
  })

  it('onSaveDraft calls mutateAsync with status draft and navigates', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValue({ data: { id: '1', slug: 'test' }, error: null })

    const { useObituaryForm } = await import('@/hooks/use-create-obituary')
    const { result } = renderHook(() => useObituaryForm(), { wrapper: AllProviders })

    await act(async () => {
      result.current.form.setValue('firstName', 'John')
      result.current.form.setValue('lastName', 'Doe')
    })

    await act(async () => {
      await result.current.onSaveDraft()
    })

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        '/api/obituaries',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"status":"draft"'),
        }),
      )
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/obituary')
    })
  })

  it('onPublish does not navigate when required fields are missing', async () => {
    const { useObituaryForm } = await import('@/hooks/use-create-obituary')
    const { result } = renderHook(() => useObituaryForm(), { wrapper: AllProviders })

    await act(async () => {
      await result.current.onPublish(result.current.form.getValues())
    })

    // Navigation should not have been called — publish blocked by validation
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('onPublish calls mutateAsync with status published when valid', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValue({ data: { id: '1', slug: 'jane-doe-2024' }, error: null })

    const { useObituaryForm } = await import('@/hooks/use-create-obituary')
    const { result } = renderHook(() => useObituaryForm(), { wrapper: AllProviders })

    await act(async () => {
      result.current.form.setValue('firstName', 'Jane')
      result.current.form.setValue('lastName', 'Doe')
      result.current.form.setValue('ageAtDeath', '73')
      result.current.form.setValue('gender', 'female')
      result.current.form.setValue('raceEthnicity', 'Malay')
      result.current.form.setValue('country', 'Malaysia')
      result.current.form.setValue('contactPersonName', 'John Smith')
      result.current.form.setValue('contactPersonRelationship', 'Spouse')
      result.current.form.setValue('contactPersonPhone', '+60123456789')
      result.current.form.setValue('profilePhoto', { public_id: 'test-id', url: 'https://example.com/photo.jpg' })
    })

    await act(async () => {
      await result.current.onPublish(result.current.form.getValues())
    })

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        '/api/obituaries',
        expect.objectContaining({
          body: expect.stringContaining('"status":"published"'),
        }),
      )
    })
  })
})
