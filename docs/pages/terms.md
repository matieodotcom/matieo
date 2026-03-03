## Status: ✅ Complete

# Terms of Service Page — `/terms`

## Overview
Standalone legal document page. No Navbar or Footer — uses its own minimal chrome with a branded
top bar. Users reach this page from the SignUp consent text and the Footer legal bar.

## Layout
- **Top bar** — MATIEO logo (links `/`) + "Back to Sign Up" link (links `/signup`)
- **Main content** — `max-w-3xl` centred, `py-12`
- **Bottom bar** — "View Privacy Policy →" (links `/privacy`) + "Back to Sign Up" (links `/signup`)

## Sections
| # | Heading | Notes |
|---|---------|-------|
| 1 | Introduction | Two paragraphs |
| 2 | Use of Service | Three H3 subsections: 2.1 Eligibility, 2.2 Account Registration (4 bullets), 2.3 Acceptable Use (5 bullets) |
| 3 | Data and Privacy | Inline `<Link to="/privacy">` |
| 4 | Intellectual Property | Two paragraphs |
| 5 | Free Trial and Subscriptions | Two paragraphs (14-day trial, cancellation) |
| 6 | Limitation of Liability | One paragraph |
| 7 | Termination | One paragraph |
| 8 | Changes to Terms | One paragraph |
| 9 | Contact Us | Email: legal@matieo.com, Address: 123 Memorial Drive, Kuala Lumpur |

## Typography classes
- H1: `text-4xl font-bold text-neutral-900`
- H2: `text-2xl font-bold text-neutral-900 mt-12 mb-4`
- H3: `text-base font-semibold text-neutral-800 mt-6 mb-2`
- Body: `text-sm text-neutral-600 leading-relaxed mb-4`
- Lists: `list-disc pl-6 space-y-1 text-sm text-neutral-600 mb-4`

## Files
- `frontend/src/pages/legal/TermsPage.tsx`
- `frontend/src/__tests__/pages/terms.test.tsx` — 12 tests

## Connections
- `frontend/src/router.tsx` — `/terms` route added
- `frontend/src/components/layout/Footer.tsx` — `LEGAL_LINKS` array; Terms of Service → `/terms`
- `frontend/src/pages/auth/SignUpPage.tsx` — consent text `href="/terms"` (was already correct)
