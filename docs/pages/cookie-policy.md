## Status: ✅ Complete

# Cookie Policy Page — `/cookie-policy`

## Overview
Standalone legal document page using the shared Navbar. Mirrors the Privacy Policy and Terms page layout.
Users reach this page from the Terms page and Privacy Policy page bottom bars, and the Footer legal bar.

## Layout
- **Navbar** — shared `<Navbar />` component
- **Main content** — `max-w-3xl` centred, `py-12`
- **Bottom bar** — "View Privacy Policy →" (links `/privacy`) + "View Terms of Service →" (links `/terms`)

## Sections
| # | Heading | Notes |
|---|---------|-------|
| 1 | What Are Cookies | Two paragraphs |
| 2 | Types of Cookies We Use | Three H3 subsections: 2.1 Essential (3 bullets), 2.2 Analytics (3 bullets), 2.3 Functional (3 bullets) |
| 3 | Third-Party Cookies | Intro + 3 bullets (Supabase, Cloudinary, Google OAuth) + follow-up paragraph |
| 4 | Managing Your Cookies | Two paragraphs + 4 bullets (Chrome, Firefox, Safari, Edge) |
| 5 | Changes to This Policy | One paragraph |
| 6 | Contact Us | Email: legal@matieo.com, Address: 123 Memorial Drive, Kuala Lumpur |

## Files
- `frontend/src/pages/legal/CookiePage.tsx`
- `frontend/src/__tests__/pages/cookie.test.tsx` — 14 tests

## Connections
- `frontend/src/router.tsx` — `/cookie-policy` route added
- `frontend/src/pages/legal/PrivacyPage.tsx` — bottom bar "View Cookie Policy →" links here
- `frontend/src/pages/legal/TermsPage.tsx` — bottom bar "View Cookie Policy →" links here
