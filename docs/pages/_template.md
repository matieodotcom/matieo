# Page: [Page Name]

**Route**: `/route-path`
**Auth Required**: Yes / No
**Status**: [ ] Not started / [ ] In progress / [x] Complete

---

## Purpose
What does this page do? Who uses it?

## Figma Link
[Link to Figma frame or component]

---

## Data Requirements

### Reads
| Table | Fields | Filter |
|-------|--------|--------|
| `memorials` | `id, full_name, status` | `created_by = auth.uid()` |

### Writes
| Table | Action | Trigger |
|-------|--------|---------|
| `memorials` | INSERT | User submits form |

---

## Schema Changes Required
- [ ] None — existing tables are sufficient
- [ ] New table: `table_name` — reason
- [ ] New columns on `table_name`: `column_name type` — reason
- [ ] Migration file: `supabase/migrations/YYYYMMDD_description.sql`

---

## Components
| Component | File | Purpose |
|-----------|------|---------|
| `MemorialCard` | `components/memorial/MemorialCard.jsx` | Display memorial preview |

---

## Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useMemorials` | `hooks/useMemorials.js` | Fetch and mutate memorials |

---

## Backend Routes (if needed)
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/memorials` | — |
| `POST` | `/api/memorials` | — |

---

## States to Handle
- [ ] Loading skeleton
- [ ] Error state
- [ ] Empty state (no data)
- [ ] Success state

---

## Edge Cases / Notes
- Any special logic, permissions, or tricky UI behavior
