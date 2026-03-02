## Status: ✅ Complete
> Do not load spec unless editing this page.

# Features Page — `/features`

## Overview
Public marketing page showcasing all MATIEO platform features. No authentication required. No data fetching.

## Sections

### 1. HeroSection
- Light blue gradient background (`from-blue-50 to-white`)
- "All Features" pill badge (brand-primaryLight)
- H1: "Powerful Features for Every Need"
- Subtitle paragraph

### 2. MainFeaturesSection — 4 alternating feature rows
Each row: icon + h2 + description + bullet list on one side, styled mockup visual on the other.

| # | Title | Layout | Visual bg |
|---|-------|--------|-----------|
| 1 | Obituary Management | text-left / image-right | amber gradient |
| 2 | Digital Memorials | image-left / text-right | blue/primaryLight gradient |
| 3 | Advanced Insights | text-left / image-right | neutral-800 → brand-secondary |
| 4 | Funeral Services | image-left / text-right | rose/stone gradient |

Alternating direction: `md:flex-row` / `md:flex-row-reverse`

### 3. MoreFeaturesSection — "And Much More"
- `bg-blue-50` background
- 6-card grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
- Cards: Global Coverage, Advanced Search, Privacy First, Mobile-Friendly, API Integration, Cloud Storage

### 4. CTASection
- Same dark gradient as LandingPage CTA (`from-brand-secondary to-brand-primary`)
- "Get Started Today" h2
- Two links to `/signup`: "Create Obituary" + "Learn More"
- Trust signals: No hidden fees, Cancel anytime, Get support

## File
`frontend/src/pages/features/FeaturesPage.tsx`

## Tests
`frontend/src/__tests__/pages/features.test.tsx` — 12 tests

## Route
`/features` in `router.tsx`

## Navbar link
`Navbar.tsx` NAV_LINKS: `{ label: 'Features', to: '/features' }` (updated from `/#features`)
