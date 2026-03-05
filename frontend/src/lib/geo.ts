import { Country, State } from 'country-state-city'
import type { SelectOption } from '@/components/ui/Select'

/**
 * Detects user's country ISO code via Cloudflare's CDN trace endpoint.
 * Free, CORS-allowed, no auth, no rate limits.
 * Falls back to navigator.language region if the request fails or times out.
 * Returns null if neither source yields a region.
 */
export async function detectUserCountryCode(): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch('https://cloudflare.com/cdn-cgi/trace', { signal: controller.signal })
    clearTimeout(timeout)
    if (res.ok) {
      const text = await res.text()
      const match = text.match(/^loc=([A-Z]{2})$/m)
      if (match) return match[1]
    }
  } catch {
    // Unreachable or timed out — fall through to language-based detection
  }

  try {
    return new Intl.Locale(navigator.language).region ?? null
  } catch {
    return null
  }
}

/** Full sorted country list; user's country moved to position 0 if detected. value = country name. */
export function buildCountryOptions(userCountryCode: string | null): SelectOption[] {
  const all = [...Country.getAllCountries()].sort((a, b) => a.name.localeCompare(b.name))

  if (userCountryCode) {
    const idx = all.findIndex(c => c.isoCode === userCountryCode)
    if (idx > 0) all.unshift(all.splice(idx, 1)[0])
  }

  return all.map(c => ({ value: c.name, label: c.name }))
}

/** States/provinces for a country identified by name. Returns [] if country unknown or has no states. value = state name. */
export function buildStateOptions(countryName: string): SelectOption[] {
  if (!countryName) return []
  const country = Country.getAllCountries().find(c => c.name === countryName)
  if (!country) return []
  return State.getStatesOfCountry(country.isoCode)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(s => ({ value: s.name, label: s.name }))
}
