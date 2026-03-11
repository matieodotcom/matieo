/**
 * Policy version dates — single source of truth.
 * Update ONLY this file when a policy changes. Pages format the date
 * using Intl.DateTimeFormat in the user's active locale automatically.
 *
 * Use Date(year, monthIndex, day) NOT Date(ISO string) to avoid
 * UTC-midnight shift rendering the day before in west-of-UTC timezones.
 */
export const POLICY_VERSIONS = {
  terms:   new Date(2025, 11, 16), // December 16, 2025
  privacy: new Date(2025, 11, 16), // December 16, 2025
  cookie:  new Date(2026,  2, 11), // March 11, 2026
} as const
