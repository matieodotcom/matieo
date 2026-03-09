## Status: ✅ Complete
> Do not load spec unless editing this page.

# Page: My Obituaries

## Route
`/dashboard/obituary`

## Purpose
Dashboard page for managing user's own obituaries. Search, paginate, delete drafts, unpublish published obituaries.

## Components
- Page heading: "My Obituaries", subtitle: "Manage and view all obituaries you have created"
- Search bar (debounced, writes `?q=` to URL) — visible only when total > 0 or search active
- `+ Create Obituary` button → navigates to `/dashboard/obituary/create`
- `ObituaryCard` grid (3-col responsive) with `onDelete` and `onUnpublish` handlers
- Pagination (URL-based)
- Loading skeleton (6 animated cards)
- Empty state: ScrollText icon + prompt + "Create Obituary" CTA button
- AlertDialog for delete draft confirmation
- AlertDialog for unpublish confirmation

## Data
- Hook: `useMyObitaries({ q, page, limit: 12 })`
- API: `GET /api/obituaries/mine`
- Query key: `['my-obituaries', { q, page, limit }]`
- Delete hook: `useDeleteObituary()` → `DELETE /api/obituaries/:id/permanent` (drafts only)
- Unpublish hook: `useUnpublishObituary()` → `POST /api/obituaries/:id/unpublish`

## Auth
Requires authentication (wrapped in DashboardLayout which guards with `Navigate to="/signin"`).
