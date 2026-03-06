# Page: My Memorials

**Route**: `/dashboard/memorials`
**Auth Required**: Yes — rendered inside `DashboardLayout`
**Status**: [x] Complete

## Status: ✅ Complete
> Do not load spec unless editing this page.

---

## Purpose
Authenticated user's list of memorials they have created. Supports search and pagination. Links to create new memorials and edit existing ones.

---

## Data Requirements

### Reads
| Endpoint | Params | Notes |
|----------|--------|-------|
| `GET /api/memorials/mine` | `q`, `page`, `limit=12` | Backend filters by `created_by = req.user.id` |

Hook: `useMyMemorials({ q, page })` in `hooks/use-my-memorials.ts`.

### Mutations
| Endpoint | Method | Notes |
|----------|--------|-------|
| `DELETE /api/memorials/:id/permanent` | DELETE | Hard-delete draft + Cloudinary cleanup. Drafts only — returns 403 for published. |
| `POST /api/memorials/:id/unpublish` | POST | Sets `status → draft`. Memorial disappears from public pages. Reversible via publish. |

Hook: `useDeleteMemorial()` in `hooks/use-delete-memorial.ts`.
Hook: `useUnpublishMemorial()` in `hooks/use-unpublish-memorial.ts`.

---

## Schema Changes Required
- [x] None — existing tables are sufficient

---

## Components
| Component | File | Purpose |
|-----------|------|---------|
| `MyMemorialsPage` | `pages/app/MyMemorialsPage.tsx` | List + search + pagination |
| `MemorialCard` | `components/memorial/MemorialCard.tsx` | Single memorial preview |
| `DashboardLayout` | `components/layout/DashboardLayout.tsx` | Shell |

---

## Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useMyMemorials` | `hooks/use-my-memorials.ts` | Fetch user's memorials with search + pagination |
| `useDeleteMemorial` | `hooks/use-delete-memorial.ts` | Permanently delete a draft memorial |
| `useUnpublishMemorial` | `hooks/use-unpublish-memorial.ts` | Move a published memorial back to draft |

---

## States to Handle
- [x] Loading skeleton (grid of skeleton cards)
- [x] Error state (inline ErrorMessage)
- [x] Empty state (no memorials created yet — hides search/create controls)
- [x] Empty search results (has memorials but none match query — shows search/create)
- [x] Populated list + pagination

---

## Edge Cases / Notes
- `showControls = total > 0 || !!q` — search input and "Create Memorial" button only shown when list has data or a search is active. Prevents confusing UI on truly empty state.
- "Create Memorial" button navigates to `/dashboard/memorials/create`.
- Pagination: uses URL `?page=` param. Query debounced 300ms, resets to page 1 on new search.
