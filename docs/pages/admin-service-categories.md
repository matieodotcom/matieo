# Admin Service Categories

## Status: ✅ Complete
> Do not load spec unless editing this page.

**Route:** `/admin/service-categories`
**File:** `frontend/src/pages/admin/AdminServiceCategoriesPage.tsx`
**Guard:** `AdminGuard` → `AdminLayout`
**Hook:** `useAdminServiceCategories`, `useAdminCreateServiceCategory`, `useAdminUpdateServiceCategory`, `useAdminDeleteServiceCategory` (all in `hooks/use-admin.ts`)

## Features
- Table listing all service categories: name, slug, description, sort_order, is_active badge, edit/delete actions
- Search by name (q param)
- Pagination (20 per page)
- Add Category button → Radix Dialog with form
- Edit button → same Dialog pre-filled
- Delete button → Radix AlertDialog; returns 409 if category has active listings
- Loading skeletons, empty state, error state

## API
- `GET /api/admin/service-categories?q=&page=` → paginated list
- `POST /api/admin/service-categories` → create (name required; slug auto-derived)
- `PATCH /api/admin/service-categories/:id` → update fields
- `DELETE /api/admin/service-categories/:id` → 204 or 409 if active services exist

## Locale keys
`admin.serviceCategories.*` — all 6 locale files
