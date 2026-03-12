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
- Auth-conditional header
  - Logged out: full `<Navbar />` with all nav options
  - Logged in: minimal header — Back button (navigate(-1) / fallback `/`) left, avatar → `/dashboard` right
  - Auth loading: empty placeholder (no layout shift)
- Cover photo or gradient
- Profile photo with lightbox on click
- Gallery photos with lightbox + prev/next arrows + counter
- Quote (blockquote)
- Photo Gallery section (above Biography)
- Biography section
- Tributes section (post tribute textarea — functional, not disabled)
- **Action bar** (below profile zone, above body) — `border-neutral-200` divider line with:
  - Left: Heart (like) button + live `like_count` · Eye icon + live `view_count` — wired to backend engagement endpoints
    - Heart fills (`fill="currentColor"`, `text-rose-500`) when `user_liked === true`
    - Click → `useLikeMemorial` toggle mutation; unauthenticated click opens `<SignInModal>`
    - View tracked on mount via `useTrackMemorialView` (fire-and-forget, IP-deduplicated)
  - Right: solid `bg-brand-primary` Share button — `navigator.share` with clipboard fallback + `toast.success`
- Engagement hooks: `useTrackMemorialView`, `useLikeMemorial` in `hooks/use-memorial-engagement.ts`
- Engagement API routes: `POST /api/memorials/:id/view` (public) · `POST /api/memorials/:id/like` (auth)
