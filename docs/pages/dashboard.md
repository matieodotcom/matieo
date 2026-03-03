# Page: Dashboard

**Route**: `/dashboard` (index) + `/dashboard/insights` + `/dashboard/obituary` + `/dashboard/services`
**Auth Required**: Yes — handled by `DashboardLayout` auth guard
**Status**: [x] Complete (home); [ ] Placeholder (insights, obituary, services)

## Status: ✅ Complete
> Do not load spec unless editing this page.

---

## Purpose
Authenticated user home. Shows a welcome message and quick-action cards. Nested child routes (Insights, Obituary, Services) are currently placeholders rendered inside the same `DashboardLayout`.

---

## Layout
`DashboardLayout` — collapsible sidebar + top navbar. See §Design `DashboardLayout structure` in `docs/CLAUDE.ref.md`.

## Data Requirements

### Reads
None — dashboard home uses only data already in `authStore` (`user.user_metadata.full_name`).

### Writes
None.

---

## Schema Changes Required
- [x] None — existing tables are sufficient

---

## Components
| Component | File | Purpose |
|-----------|------|---------|
| `DashboardLayout` | `components/layout/DashboardLayout.tsx` | Sidebar + top navbar shell, auth guard |
| `DashboardPage` | `pages/app/DashboardPage.tsx` | Welcome + quick-action cards |

---

## Quick-action cards
| Card | Icon | Link |
|------|------|------|
| Create Memorial | `Plus` | `/dashboard/memorials/create` |
| Browse Memorials | `Heart` | `/memorials` |
| Insights | `BarChart2` | `/dashboard/insights` |
| Services | `Briefcase` | `/dashboard/services` |

---

## Sidebar links (DashboardLayout)
| Label | Route | Icon |
|-------|-------|------|
| Insights | `/dashboard/insights` | `BarChart2` |
| Memorials | `/dashboard/memorials` | `Heart` |
| Obituary | `/dashboard/obituary` | `ScrollText` |
| Services | `/dashboard/services` | `Briefcase` |

---

## Edge Cases / Notes
- Welcome message uses `user.user_metadata?.full_name` — first word only, falls back to "there".
- Dark mode toggle is in sidebar bottom. Uses `useThemeStore`.
- `/app` and `/app/dashboard` are NOT valid routes — the root route is `/dashboard`.
