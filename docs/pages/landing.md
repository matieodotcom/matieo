# Landing Page — `/`

## Status: ✅ Complete

> Do not load spec unless editing this page.

---

## Route
`/` — public, no auth required, no sidebar

## File
`frontend/src/pages/landing/LandingPage.tsx`

## Layout components
- `components/layout/Navbar.tsx` — sticky top, white bg, logo + 6 nav links + Sign in/Sign up
- `components/layout/Footer.tsx` — dark (#101828/brand-secondary) bg, 3 link columns + social icons

## Figma reference
File: `j6RIhPAVnr7HK8TTujCGX4` | Node: `718:3076` (matieo.proto.com, pre-login)

---

## Sections (top → bottom)

### 1. Navbar (sticky)
- Logo: blue circle `M` + "MATIEO" wordmark
- Links: Memorials, Obituary, Insights, Features, Pricing, About
- Auth: "Sign in" text → `/signin` | "Sign up" blue button → `/signup`

### 2. Hero
- Bg: `bg-gradient-to-br from-blue-50 via-blue-50 to-brand-primaryLight/40` + decorative blobs
- Badge: green pulse dot + "Trusted by 30,000+ Families"
- H1: "Honoring Lives, Preserving Memories" (`text-brand-primary`, `text-5xl font-normal`)
- Description: 18px stone-600
- CTAs: "Create Memorial" (blue primary → `/signup`) + "Create Obituary" (outline → `/signup`)
- Social proof: "24/7 Support" | "100% Secure"
- Right: CSS product mockup (browser chrome + sidebar + memorial cards)

### 3. Features
- Bg: white
- H2: "Everything You Need in One Platform"
- 3×2 grid: Obituary, Digital Memorials, Funeral Services, Insights, Privacy & Security, Community Support
- Card: bordered, icon in bordered square, h3, description

### 4. How It Works
- Bg: `bg-blue-50`
- H2: "How It Works"
- 3 circular thumbnail cards with play buttons (Memorials, Obituary, Insights)
- Video placeholders (no actual videos yet — play button is UI-only)

### 5. Trusted by Thousands (Stats)
- Bg: white
- H2: "Trusted by Thousands"
- 4 bordered stat cards: 500K+ Obituaries Created, 2.5M+ Digital Memorials, 1B+ Insights, 99.9% User Satisfaction
- Stat numbers in `text-brand-primary`

### 6. Testimonials
- Bg: `bg-blue-50`
- H2: "What Our Users Say"
- 3×2 grid of testimonial articles: 5 stars + quote + author (initials avatar)
- Rating summary: "4.9 out of 5 stars from 12,000+ reviews"

### 7. Get Started Today (CTA Banner)
- Bg: `bg-gradient-to-r from-brand-secondary to-brand-primary`
- Decorative white/blue circles
- H2: "Get Started Today"
- CTAs: "Create Obituary" (white → `/signup`) + "Create Memorial" (outline white → `/signup`)
- Trust signals: No hidden fees · Cancel anytime · Get support

### 8. Not Ready To Sign Up Yet? (Waitlist)
- Bg: `bg-blue-50`
- H2: "Not Ready To Sign Up Yet?"
- Form: name input + email input + "Follow Us" button
- **Auth-aware:** hidden when `user !== null` or while `isLoading` (avoids flash)
- **Wired to backend:** POST `/api/waitlist` via `useWaitlist` hook (TanStack mutation)
- Success: replaced by confirmation message (isSuccess state)
- Error: inline `<ErrorMessage>` below form (409 "Already subscribed" shown inline)
- Spinner/disabled state while isPending
- Confirmation email sent via Resend on successful subscription

### 9. Footer
- Bg: `bg-brand-secondary` (#1A1A2E)
- Logo + description + 4 social icon links (Facebook, Twitter, Instagram, LinkedIn)
- Columns: Product, Company, Resources (4 links each)
- Bottom bar: © 2026 + Privacy Policy, Terms of Service, Cookie Policy

---

## Tests
- `src/__tests__/components/navbar.test.tsx` — 6 tests
- `src/__tests__/components/footer.test.tsx` — 5 tests
- `src/__tests__/pages/landing.test.tsx` — 24 tests

## Known limitations
- Play buttons in "How It Works" are UI-only (no video modal yet)
- Product mockup in hero is a CSS approximation (no actual screenshot)
- No mobile/responsive breakpoints — desktop-first (1920px design)
