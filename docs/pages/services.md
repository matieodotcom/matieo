# Services Page

**Route:** `/services`
**File:** `frontend/src/pages/public/ServicesPage.tsx`
**Status:** ✅ Complete
**Auth:** Public (no auth required)

## Description
Public-facing funeral services directory. Lists 14 service categories with provider counts and search. Includes a CTA for service providers to register.

## Sections
1. **Hero banner** — brand gradient with heading, tagline, contact links, building illustration
2. **Funeral Services grid** — 4-col grid (2-col mobile) of category cards; real-time search filter
3. **List Your Services CTA** — links to `/signup` for service providers

## Categories (static data)
Florists · Casket & Urn Sellers · Transportation · Counselling · Funeral Undertakers · Caterers · Prayer Services · Funeral Parlour · Crematorium · Canopy · Burial Services · Photography · Memorial Parks · Feng Shui

## Locale keys
`services.hero.*` · `services.categories.*` · `services.category.{key}.name/description` · `services.listCta.*`
`nav.services` added to all 6 locale files.
