## Status: ✅ Complete
> Do not load spec unless editing this page.

# About Page — `/about`

## Overview
Public marketing page. No authentication required. No data fetching. Static content only.

## Sections

### 1. HeroSection
- `bg-gradient-to-b from-blue-50 to-white`, centered, `py-20`
- H1: "Building a Better Way to Honor Lives and Understand Mortality"
- Subtitle about MATIEO's founding belief

### 2. MissionSection
- White bg, split layout: text left / visual right (`md:flex-row`)
- "Our Mission" green badge
- H2: "Honoring Lives Through Comprehensive Memorial and Funeral Services"
- Body paragraph + 4 bullet pillars (Obituary, Digital Memorials, Funeral Services, Insights)
- Right: `MissionVisual` — dark gradient card-grid mockup

### 3. StatsSection
- White bg with `border-t border-b border-neutral-100`
- `grid grid-cols-2 lg:grid-cols-4`
- 50K+ Obituaries Created · 2.5M+ Memorials Created · 190+ Countries Covered · 99.9% Uptime

### 4. ValuesSection
- White bg, `grid grid-cols-1 sm:grid-cols-2` (2×2)
- Compassion First (Heart) · Accuracy & Integrity (Shield) · Community Driven (Users) · Continuous Innovation (Zap)

### 5. JourneySection
- `bg-blue-50`, horizontal timeline with progress line
- Two milestones: 2026 (outline dot) → Today (filled brand-primary dot)

### 6. TeamSection
- White bg, two co-founder cards centered (`sm:flex-row`)
- Shariff Saim (blue-500 avatar) · Avinash Kumar (brand-primary avatar)

### 7. CTASection
- Same dark gradient as LandingPage / FeaturesPage
- "Create Memorial" + "Create Obituary" → `/signup`

## File
`frontend/src/pages/about/AboutPage.tsx`

## Tests
`frontend/src/__tests__/pages/about.test.tsx` — 18 tests

## Route
`/about` in `router.tsx`
