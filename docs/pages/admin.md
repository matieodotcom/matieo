# Admin Panel

## Status: ✅ Complete
> Do not load spec unless editing admin pages.

## Routes

| Page | Route | File |
|------|-------|------|
| Overview (stats) | `/admin` | `pages/admin/AdminOverviewPage.tsx` |
| Users | `/admin/users` | `pages/admin/AdminUsersPage.tsx` |
| Memorials | `/admin/memorials` | `pages/admin/AdminMemorialsPage.tsx` |
| Obituaries | `/admin/obituaries` | `pages/admin/AdminObituariesPage.tsx` |
| Tributes | `/admin/tributes` | `pages/admin/AdminTributesPage.tsx` |
| Condolences | `/admin/condolences` | `pages/admin/AdminCondolencesPage.tsx` |
| Waitlist | `/admin/waitlist` | `pages/admin/AdminWaitlistPage.tsx` |

## Access Control

- `AdminGuard` (`components/layout/AdminGuard.tsx`) — checks `useAuthStore` + `useProfile`. Redirects unauthenticated to `/signin`, non-admins to `/dashboard`.
- `AdminLayout` (`components/layout/AdminLayout.tsx`) — collapsible sidebar with 7 nav links + dark mode toggle + user dropdown.

## Backend API

All routes at `/api/admin/*`. Require `requireAdmin` middleware (checks Bearer token + profile role = `admin`).

| Method | Path | Controller |
|--------|------|-----------|
| GET | `/api/admin/stats` | `getStats` — 6 stat counts in one response |
| GET | `/api/admin/users` | `listUsers` — paginated, search (`?q=`), role filter |
| PATCH | `/api/admin/users/:id/role` | `setUserRole` — roles: user/admin/researcher |
| GET | `/api/admin/memorials` | `listMemorials` — paginated, all statuses |
| PATCH | `/api/admin/memorials/:id/status` | `setMemorialStatus` — draft/published |
| DELETE | `/api/admin/memorials/:id` | `deleteMemorial` — permanent delete |
| GET | `/api/admin/obituaries` | `listObituaries` |
| PATCH | `/api/admin/obituaries/:id/status` | `setObituaryStatus` |
| DELETE | `/api/admin/obituaries/:id` | `deleteObituary` |
| GET | `/api/admin/tributes` | `listTributes` |
| DELETE | `/api/admin/tributes/:id` | `deleteTribute` |
| GET | `/api/admin/condolences` | `listCondolences` |
| DELETE | `/api/admin/condolences/:id` | `deleteCondolence` |
| GET | `/api/admin/waitlist` | `listWaitlist` — read-only |

## Frontend Hooks

All in `hooks/use-admin.ts`. Backed by TanStack Query + `apiFetch`.

- `useAdminStats()` — for Overview page stat cards
- `useAdminUsers(filters?)` + `useAdminSetUserRole()` — Users page
- `useAdminMemorials(filters?)` + `useAdminSetMemorialStatus()` + `useAdminDeleteMemorial()` — Memorials page
- `useAdminObituaries(filters?)` + `useAdminSetObituaryStatus()` + `useAdminDeleteObituary()` — Obituaries page
- `useAdminTributes(filters?)` + `useAdminDeleteTribute()` — Tributes page
- `useAdminCondolences(filters?)` + `useAdminDeleteCondolence()` — Condolences page
- `useAdminWaitlist()` — Waitlist page (read-only)

## Shared Components

- `Badge` (`components/ui/Badge.tsx`) — variants: default, success (published), warning (draft), info (researcher), danger (admin)

## Tests

Frontend: `frontend/src/__tests__/pages/admin-*.test.tsx` (7 files)
Backend: `backend/src/__tests__/admin.test.ts`
