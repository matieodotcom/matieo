# Page: Public Memorial

**Route**: `/memorial/:slug`
**Auth Required**: No — fully public
**Status**: ✅ Complete

## Status: ✅ Complete
> Do not load spec unless editing this page.

---

## Purpose
Public-facing memorial page for a published memorial. Matches preview page layout. Anyone can view without an account.

---

## Data Requirements

### Reads
| Endpoint | Params | Notes |
|----------|--------|-------|
| `GET /api/memorials/by-slug/:slug` | — | Returns published memorial + `memorial_photos(*)`. 404 if not found or draft. |

Hook: `usePublicMemorial(slug)` in `hooks/use-public-memorial.ts`.

---

## States
- **Loading** — animated skeleton (cover, profile circle, text lines, gallery/bio cards)
- **404** — "Memorial not found" with link back to `/memorials`
- **Error** — "Something went wrong" generic message
- **Loaded** — full layout matching preview page

## Features
- Cover photo or gradient
- Profile photo with lightbox on click
- Gallery photos with lightbox + prev/next arrows + counter
- Quote (blockquote)
- Photo Gallery section (above Biography)
- Biography section
- Tributes section (post tribute textarea — functional, not disabled)
