# Dashboard Services

## Status: ✅ Complete
> Do not load spec unless editing this page.

**Route:** `/dashboard/services`
**File:** `frontend/src/pages/app/DashboardServicesPage.tsx`
**Guard:** `DashboardLayout` (requires auth); page-level guard redirects non-org users to `/dashboard`
**Hooks:** `useMyServices`, `useCreateMyService`, `useUpdateMyService`, `useDeleteMyService`, `usePublicServiceCategories` (all in `hooks/use-services.ts`)

## Features
- Only accessible to `account_type === 'organization'` users; others are redirected to `/dashboard`
- Table: service name, category badge, city/country, active status, edit/delete actions
- Add Service button → Radix Dialog with full form
- Edit button → same Dialog pre-filled
- Delete → Radix AlertDialog confirmation
- Loading skeleton, empty state with add CTA, error state

## Form fields
Category (select from active service_categories), Name (required), Description, Phone, Email, Website, Address, City, Country, Is Active

## API
- `GET /api/services/my` → list own listings (requireAuth + org check)
- `POST /api/services/my` → create (requireAuth + org check)
- `PATCH /api/services/my/:id` → update (ownership verified)
- `DELETE /api/services/my/:id` → 204 (ownership verified)

## Locale keys
`dashboard.services.*` — all 6 locale files
