## Status: ✅ Complete (Sign Up, Sign In, Forgot Password, Reset Password)

# Auth Pages Spec

## Routes
| Page | Route | Status |
|------|-------|--------|
| Sign Up | `/signup` | ✅ Complete |
| Sign In | `/signin` | ✅ Complete |
| Forgot Password | `/forgot-password` | ✅ Complete |
| Reset Password | `/reset-password` | ✅ Complete |

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

## Sign In (`/signin`) — ✅ Complete

### Layout
Split panel — no Navbar or Footer.
- Left `w-[45%]`: white form panel
- Right `flex-1`: `bg-neutral-50` product mockup panel (hidden on mobile)

### Left panel
1. Logo (concentric-circle mark + MATIEO in brand blue) → links to `/`
2. `<h1>` "Sign in"
3. Subtitle "Welcome back! Please enter your details."
4. React Hook Form with Zod:
   - Email Address (`id="email"`, Mail icon left)
   - Password (`id="password"`, Lock icon left + Eye/EyeOff toggle right)
5. "Forgot Password?" right-aligned link → `/forgot-password`
6. Submit: "Sign In" (primary button, full-width)
7. `<ErrorMessage>` for auth errors below submit
8. "Login with Google" (gray bg, Google G icon)
9. Divider "or"
10. "Create New Account" → `/signup` (secondary link styled as button)
11. Terms of Service + Privacy Policy
12. "© 2026 MATIEO" footer

### Hook: `useSignIn`
- Zod schema: `email (valid)`, `password (min 1)`
- Calls `supabase.auth.signInWithPassword({ email, password })`
- Success → `navigate('/app')`
- Error → `error` state → `<ErrorMessage>` below submit (no toast)

### Tests
File: `src/__tests__/pages/signin.test.tsx` — **16 tests passing**

## Forgot Password (`/forgot-password`) — ✅ Complete

### Layout
Centered card — full-page white, no split panel.
`min-h-screen flex items-center justify-center bg-white`
Inner card: `w-full max-w-sm mx-auto px-8 py-10 flex flex-col items-center gap-6`

### Screen 1 (emailSent === false)
1. Logo (concentric-circle mark + MATIEO in brand blue) → links to `/`
2. `<h1>` "Forgot Password?"
3. Subtitle "No worries, we'll send you reset instructions."
4. React Hook Form with Zod:
   - Email Address (`id="email"`, Mail icon left)
5. Submit: "Reset Password" (primary button, full-width)
6. `<ErrorMessage>` for auth errors inline (no toast)
7. "← Back to Sign in" link → `/signin`
8. "© 2026 MATIEO" footer

### Screen 2 (emailSent === true)
1. Logo
2. Green check icon: `w-16 h-16 rounded-full bg-green-100` + `CircleCheck` (size 32, `text-green-500`)
3. `<h1>` "Check your email"
4. "We sent a password reset link to" + `{submittedEmail}`
5. "Open email" primary button → `window.open('mailto:')`
6. "Didn't receive the email? Click to resend" → calls `resend()`
7. "← Back to Sign in" link → `/signin`
8. "© 2026 MATIEO" footer

### Hook: `useForgotPassword`
- Zod schema: `email (valid)`
- Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/forgot-password' })`
- Success → `emailSent = true`, `submittedEmail` stored (no toast — Screen 2 is the confirmation)
- Error → `error` state → `<ErrorMessage>` inline (no toast)
- `resend()` → calls `submitReset(submittedEmail)` directly (bypasses form validation)
- Returns: `{ form, onSubmit, isPending, error, emailSent, submittedEmail, resend }`

### Hook: `useForgotPassword` — note on redirectTo
`resetPasswordForEmail` `redirectTo` → `origin + '/reset-password'` (fixed, was `/forgot-password`)

### Tests
File: `src/__tests__/pages/forgot-password.test.tsx` — **14 tests passing**
File: `src/__tests__/hooks/use-auth.test.ts` — **4 new tests** (useForgotPassword describe block)

---

## Reset Password (`/reset-password`) — ✅ Complete

### Layout
Centered card — full-page white, no split panel (same pattern as ForgotPasswordPage).
`min-h-screen flex items-center justify-center bg-white`
Inner card: `w-full max-w-sm mx-auto px-8 py-10 flex flex-col items-center gap-6`

### Content
1. Logo (concentric-circle mark + MATIEO in brand blue) → links to `/`
2. `<h1>` "Set New Password"
3. Subtitle "Choose a strong password for your account."
4. React Hook Form with Zod:
   - New Password (`id="password"`, Lock icon left + Eye/EyeOff toggle right)
   - Confirm Password (`id="confirmPassword"`, Lock icon left + Eye/EyeOff toggle right)
5. Submit: "Update Password" (primary button, full-width, loading spinner)
6. `<ErrorMessage>` for auth errors inline (no toast)
7. "← Back to Sign in" link → `/signin`
8. "© 2026 MATIEO" footer

### Hook: `useResetPassword`
- Zod schema: `password (min 8)`, `confirmPassword (must match password)`
- Calls `supabase.auth.updateUser({ password })`
- Success → `toast.success('Password updated successfully')` + `navigate('/signin')`
- Error → `error` state → `<ErrorMessage>` below submit (no toast)
- Returns: `{ form, onSubmit, isPending, error }`

### Supabase flow
Email reset link → browser → `redirectTo#access_token=...&type=recovery`
→ Supabase JS processes hash, fires `onAuthStateChange(PASSWORD_RECOVERY, session)`
→ `useAuthListener` sets session → `ResetPasswordPage` shows form
→ `updateUser({ password })` → success → `/signin`

### Tests
File: `src/__tests__/pages/reset-password.test.tsx` — **15 tests passing**
File: `src/__tests__/hooks/use-auth.test.ts` — **4 new tests** (useResetPassword describe block)
