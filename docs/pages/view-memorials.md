## Status: ✅ Complete

> Do not load spec unless editing this page.

# View Memorials Page — `/memorials`

## Overview
Public page showing all published memorials in a 3-column card grid.
No login required. Authenticated users see a "Create Memorial" button.
Supports server-side search by name and page-based pagination via URL query params.

## Auth
No auth guard. Page is accessible to all visitors.
`useAuthStore` read only to conditionally render the "Create Memorial" button — shown only when `user` is not null.

## URL params
| Param | Type | Default | Purpose |
|-------|------|---------|---------|
| `?q=` | string | `''` | Search query (debounced 300ms, ilike on `full_name`) |
| `?page=` | number | `1` | Current page (1-indexed) |

## Component tree
```
ViewMemorialsPage
├── <Navbar />
├── <main>
│   ├── Header row (h1 + subtitle + search input + Create Memorial link [auth only])
│   ├── <ErrorMessage /> (on error)
│   ├── Skeleton grid (6 × SkeletonCard, animate-pulse, while isPending)
│   ├── Empty state (Heart icon + message, when data=[] and !isPending)
│   └── Card grid (lg:grid-cols-3) + <Pagination />
└── <Footer />
```

## Hook
`useMemorials({ q, page, limit: 12 })` from `@/hooks/use-memorials`
- Calls `apiFetch<MemorialsResponse>('/api/memorials?q=&page=&limit=')` via `@/lib/apiClient`
- `queryKey: ['memorials', { q, page, limit }]`
- `staleTime: 30_000`, `placeholderData: prev` (no flash on page change)

## API endpoint
`GET /api/memorials?q=&page=&limit=` (Node backend, **public — no auth required**)
- Returns only `status = 'published'` memorials via `listPublished()` controller
- Returns `{ data: MemorialRow[], total: number, page: number, limit: number, error: null }`
- Searches `full_name` with `ilike`
- Paginates with `.range(offset, offset + limit - 1)`

## Card fields shown
| Field | Notes |
|-------|-------|
| Cover photo | `cover_url` → `<img>`, else initials placeholder |
| Name | `full_name` — links to `/memorial/{slug}` |
| Status badge | `draft` → amber, `published` → green |
| Date range | `date_of_birth · date_of_death` (formatted via `Intl.DateTimeFormat`) |
| Location | `location` — shown only if not null |

## Pagination
- 12 items per page (`LIMIT = 12`)
- `Pagination` component: Prev / numbered buttons / Next
- Hidden when `totalPages <= 1`

## Files
| File | Purpose |
|------|---------|
| `frontend/src/pages/app/ViewMemorialsPage.tsx` | Page component |
| `frontend/src/components/memorial/MemorialCard.tsx` | Reusable card |
| `frontend/src/hooks/use-memorials.ts` | Data fetching hook |
| `frontend/src/lib/apiClient.ts` | Authenticated fetch helper |
| `frontend/src/types/memorial.ts` | `MemorialRow`, `MemorialsResponse` types |
| `frontend/src/__tests__/pages/view-memorials.test.tsx` | 12 page tests |
| `frontend/src/__tests__/components/memorial-card.test.tsx` | 9 card tests |
| `frontend/src/__tests__/hooks/use-memorials.test.ts` | 6 hook tests |

## Tests: 27 total (208 passing overall as of 2026-03-03)
