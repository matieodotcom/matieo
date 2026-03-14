# Dashboard Edit Service Page

**Route**: `/dashboard/services/:id/edit`
**File**: `frontend/src/pages/app/DashboardEditServicePage.tsx`
**Status**: Active
**Type**: Authenticated (dashboard)

## Purpose
Full-page form for editing an existing service listing. Pre-fills all fields from existing data.

## Features
- Same form layout as Create Service
- Pre-fills all fields including uploaded images
- Redirects to /dashboard/services if service not found or not owned

## Hooks
- `useMyService(id)` — fetches single service for pre-fill
- `useUpdateMyService` — PATCH mutation

## i18n Keys
- `dashboard.services.editTitle`, `dashboard.services.saveChanges`, etc.
