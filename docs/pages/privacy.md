## Status: ✅ Complete

# Privacy Policy Page — `/privacy`

## Overview
Standalone legal document page using the shared Navbar. Mirrors the Terms page layout.
Users reach this page from the Terms page bottom bar, the Footer legal bar, and the Terms
section 3 inline link.

## Layout
- **Navbar** — shared `<Navbar />` component
- **Main content** — `max-w-3xl` centred, `py-12`
- **Bottom bar** — "View Terms of Service →" (links `/terms`)

## Sections
| # | Heading | Notes |
|---|---------|-------|
| 1 | Introduction | Two paragraphs |
| 2 | Information We Collect | Three H3 subsections: 2.1 Information You Provide (4 bullets), 2.2 Information Collected Automatically (4 bullets), 2.3 Information from Third Parties |
| 3 | How We Use Your Information | Intro + 6 bullets |
| 4 | How We Share Your Information | Two paragraphs |
| 5 | Cookies | One paragraph |
| 6 | Data Retention | One paragraph |
| 7 | Your Rights | One paragraph |
| 8 | Changes to This Policy | One paragraph |
| 9 | Contact Us | Email: legal@matieo.com, Address: 123 Memorial Drive, Kuala Lumpur |

## Files
- `frontend/src/pages/legal/PrivacyPage.tsx`
- `frontend/src/__tests__/pages/privacy.test.tsx` — 12 tests

## Connections
- `frontend/src/router.tsx` — `/privacy` route added
- `frontend/src/components/layout/Footer.tsx` — Privacy Policy → `/privacy`
- `frontend/src/pages/legal/TermsPage.tsx` — bottom bar "View Privacy Policy →" links here
- `frontend/src/pages/auth/SignUpPage.tsx` — (future) privacy link if added
