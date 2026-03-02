## Status: ✅ Complete (Sign Up) | ⬜ Not started (Sign In, Forgot Password)

# Auth Pages Spec

## Routes
| Page | Route | Status |
|------|-------|--------|
| Sign Up | `/signup` | ✅ Complete |
| Sign In | `/signin` | ⬜ Not started |
| Forgot Password | `/forgot-password` | ⬜ Not started |

---

## Sign Up (`/signup`)

### Layout
Split panel — no Navbar or Footer.
- Left `w-[45%]`: white form panel
- Right `flex-1`: `bg-neutral-50` benefits panel (hidden on mobile)

### Left panel
1. Logo (M circle + MATIEO wordmark) → links to `/`
2. `<h1>` "Create your account"
3. "Already have an account?" + Link to `/signin`
4. Google Sign Up button (`border border-neutral-200`, Google SVG inline)
5. Divider "or continue with email"
6. React Hook Form with Zod:
   - Full Name (`id="fullName"`, User icon)
   - Email (`id="email"`, Mail icon)
   - Password (`id="password"`, Lock icon + Eye/EyeOff toggle)
7. Submit: "Create Account" (primary button, full-width, loading spinner state)
8. `<ErrorMessage>` for auth errors (inline, no toast)
9. **emailSent state**: replaces form with CheckCircle + "Verify your email" + email shown + "Resend email" button

### Right panel
3 value propositions:
- Preserve every memory (UserCheck icon)
- Insights that matter (BarChart2 icon)
- Private and secure (Shield icon)

### Hook: `useSignUp`
- Zod schema: `fullName (min 2)`, `email (valid)`, `password (min 8)`
- On success: `toast.success("Check your inbox! …{email}")` + `emailSent = true`
- On error: `error` state → `<ErrorMessage>` below submit
- `emailSent = true` → success state replaces form

### Hook: `useGoogleAuth`
- `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: origin + '/' } })`
- Error → `error` state (displayed via `combinedError` with useSignUp error)

### Validation
- All Zod errors shown inline below each field
- Auth errors shown below submit button
- Never toast on validation errors

### Accessibility
- All inputs have `id` + `htmlFor` pairs
- Password toggle has `aria-label="Show password"` / `aria-label="Hide password"`
- Error messages have `role="alert"`
- Logo link has visible text

### Tests
File: `src/__tests__/pages/signup.test.tsx` — **15 tests passing**
- renders without crashing
- renders Google Sign Up button
- renders full name, email, password fields with labels
- renders link to /signin
- shows password toggle button with accessible label
- toggles password visibility
- Zod: empty submit → field errors (no supabase call)
- Zod: invalid email → error message
- Zod: short password → error message
- successful submit → emailSent state shown
- successful submit → toast.success called
- auth error on submit → inline error shown (no toast)
- emailSent state: shows verify email heading + email

---

## Sign In (`/signin`)
> ⬜ Not yet built. Will follow same split-panel layout (left 45% form / right 55% bg-neutral-50).

## Forgot Password (`/forgot-password`)
> ⬜ Not yet built. Centered card, full-page white, logo top-center.
