# Dashboard Create Service Page

**Route**: `/dashboard/services/create`
**File**: `frontend/src/pages/app/DashboardCreateServicePage.tsx`
**Status**: Active
**Type**: Authenticated (dashboard)

## Purpose
Full-page form for organizations to create a new service listing.

## Features
- Icon upload (single image)
- Gallery upload (up to 6 images)
- Company information fields
- About company textarea (4000 char limit)
- Short description textarea (250 char limit)
- Save as Draft or Publish options

## Hooks
- `useCreateMyService` — POST mutation
- `usePublicServiceCategories` — category dropdown

## i18n Keys
- `dashboard.services.createTitle`, `dashboard.services.sectionCompany`, etc.
