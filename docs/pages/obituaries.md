## Status: ✅ Complete
> Do not load spec unless editing this page.

# Page: Obituaries (Public)

## Routes
- `/obituary` — Public list of published obituaries
- `/obituary/:slug` — Individual published obituary view

## Purpose
Public-facing obituary browsing and individual obituary display. Allows anyone to browse published obituaries, search by name, and view full obituary details.

## `/obituary` — Public List

### Components
- `<Navbar>` + `<Footer>` (public layout)
- Page heading: "Obituaries", subtitle: "Create and share obituaries to honor your loved ones"
- Search bar (debounced, writes `?q=` to URL)
- `+ Create Obituary` button → redirects to `/signin` if not authenticated, `/dashboard/obituary/create` if authenticated
- 3-column card grid: `ObituaryCard` with `showStatus={false}`, `showPublisher`
- Pagination (URL-based, `?page=`)
- Loading skeleton (6×9 animated cards)
- Empty state: ScrollText icon + "No obituaries published yet"

### Data
- Hook: `useObitaries({ q, page, limit: 12 })`
- API: `GET /api/obituaries?q=&page=&limit=12`
- Query key: `['obituaries', { q, page, limit }]`

### Auth
- Page is public (no auth required to view)
- "Create Obituary" button requires auth — redirects to `/signin` if no user

---

## `/obituary/:slug` — Individual Obituary (PublicObituaryPage)

### Components
- Auth-conditional header: `<Navbar>` when logged out, minimal back+avatar when logged in
- Cover photo (or gradient fallback)
- Profile photo square (rounded-2xl) with name, date range, location, age
- Section cards:
  - Obituary (biography)
  - Funeral / Prayer Service (if funeral_details set)
  - Burial (if burial_details set)
  - Survived By (family_members list)
  - Contact Person (name, relationship, phone, email)
- "Back to Obituaries" link
- `<Footer>`
- 404 state: "Obituary not found" with back link

### Data
- Hook: local `usePublicObituary(slug)` query in component
- API: `GET /api/obituaries/by-slug/:slug`
- cause_of_passing, death_cert fields are NEVER shown (stripped by backend controller)

### Privacy rules
- `cause_of_passing` — NEVER displayed
- `cause_of_passing_consented` — NEVER displayed
- `death_cert_url` — NEVER displayed
- `death_cert_cloudinary_public_id` — NEVER displayed
