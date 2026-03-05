import { describe, it, expect, vi, afterEach } from 'vitest'

// Mock country-state-city before importing geo helpers
vi.mock('country-state-city', () => ({
  Country: {
    getAllCountries: vi.fn(() => [
      { name: 'Australia', isoCode: 'AU' },
      { name: 'India', isoCode: 'IN' },
      { name: 'Malaysia', isoCode: 'MY' },
      { name: 'Singapore', isoCode: 'SG' },
      { name: 'United States', isoCode: 'US' },
      { name: 'Zimbabwe', isoCode: 'ZW' },
    ]),
  },
  State: {
    getStatesOfCountry: vi.fn((isoCode: string) => {
      if (isoCode === 'MY') {
        return [
          { name: 'Selangor', isoCode: 'SGR' },
          { name: 'Johor', isoCode: 'JHR' },
          { name: 'Kedah', isoCode: 'KDH' },
        ]
      }
      if (isoCode === 'US') {
        return [
          { name: 'California', isoCode: 'CA' },
          { name: 'Texas', isoCode: 'TX' },
        ]
      }
      return []
    }),
  },
}))

import { detectUserCountryCode, buildCountryOptions, buildStateOptions } from '@/lib/geo'

const cfTrace = (loc: string) =>
  `fl=123f1\nh=cloudflare.com\nip=1.2.3.4\nts=1234567890.123\nloc=${loc}\ntls=TLSv1.3\n`

describe('detectUserCountryCode', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns country code from Cloudflare trace on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(
      new Response(cfTrace('IN'), { status: 200 })
    ))
    expect(await detectUserCountryCode()).toBe('IN')
  })

  it('falls back to navigator.language region when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('Network error')))
    Object.defineProperty(navigator, 'language', { value: 'en-MY', configurable: true })
    expect(await detectUserCountryCode()).toBe('MY')
  })

  it('falls back to navigator.language region when response is non-ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('', { status: 500 })))
    Object.defineProperty(navigator, 'language', { value: 'en-AU', configurable: true })
    expect(await detectUserCountryCode()).toBe('AU')
  })

  it('returns null when fetch fails and language has no region', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('timeout')))
    Object.defineProperty(navigator, 'language', { value: 'en', configurable: true })
    expect(await detectUserCountryCode()).toBeNull()
  })

  it('falls back gracefully when trace body has no loc field', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(
      new Response('fl=123\nip=1.2.3.4\n', { status: 200 })
    ))
    Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true })
    expect(await detectUserCountryCode()).toBe('US')
  })
})

describe('buildCountryOptions', () => {
  it('returns options sorted alphabetically when no user country', () => {
    const opts = buildCountryOptions(null)
    expect(opts.map(o => o.label)).toEqual([
      'Australia', 'India', 'Malaysia', 'Singapore', 'United States', 'Zimbabwe',
    ])
  })

  it('moves detected country to position 0', () => {
    const opts = buildCountryOptions('IN')
    expect(opts[0]).toEqual({ value: 'India', label: 'India' })
    expect(opts.slice(1).map(o => o.label)).toEqual([
      'Australia', 'Malaysia', 'Singapore', 'United States', 'Zimbabwe',
    ])
  })

  it('maps value and label both to country name', () => {
    const opts = buildCountryOptions(null)
    opts.forEach(o => expect(o.value).toBe(o.label))
  })

  it('does not reorder when country code is not found', () => {
    const opts = buildCountryOptions('XX')
    expect(opts[0].label).toBe('Australia')
  })
})

describe('buildStateOptions', () => {
  it('returns sorted states for Malaysia', () => {
    expect(buildStateOptions('Malaysia').map(o => o.label)).toEqual(['Johor', 'Kedah', 'Selangor'])
  })

  it('returns sorted states for United States', () => {
    expect(buildStateOptions('United States').map(o => o.label)).toEqual(['California', 'Texas'])
  })

  it('returns [] for empty string', () => {
    expect(buildStateOptions('')).toEqual([])
  })

  it('returns [] for unknown country name', () => {
    expect(buildStateOptions('Unknown Country')).toEqual([])
  })

  it('returns [] for country with no states (Singapore)', () => {
    expect(buildStateOptions('Singapore')).toEqual([])
  })
})
