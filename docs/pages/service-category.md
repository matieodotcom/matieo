# Service Category Page

**Route**: `/services/:slug`
**File**: `frontend/src/pages/public/ServiceCategoryPage.tsx`
**Status**: Active
**Type**: Public

## Purpose
Lists all service providers in a specific category. Accessed by clicking a category card from `/services`.

## Features
- Hero banner with category image and overlay
- Search providers by name
- 3-column responsive provider grid
- Each card links to the provider detail page

## Hooks
- `useServiceCategory(slug)` — fetches category + providers from `/api/services/categories/:slug`

## i18n Keys
- `services.category.*`
