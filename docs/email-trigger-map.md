# Email Trigger Map

Before implementing a new feature, check this file.
If the feature creates a user-visible event, add a row and implement the send function in `emailClient.ts`.

---

## Supabase-managed auth emails

These are sent automatically by Supabase Auth. **Do not intercept or duplicate with Resend.**
Templates live in `supabase/templates/` and use Go template variables (`{{ .ConfirmationURL }}`, `{{ .SiteURL }}`).
Branding must be maintained manually in each file (Montserrat, `#3B5BFF`, `#1A1A2E`) — `buildEmailHtml` cannot be used here.

| Event constant | Trigger | Recipient | Template file |
|---|---|---|---|
| `auth.signup.confirmation` | `supabase.auth.signUp()` | New user | `supabase/templates/confirm-signup.html` |
| `auth.email.change` | `supabase.auth.updateUser({ email })` | User updating email | `supabase/templates/email-change.html` |
| `auth.password.reset` | `supabase.auth.resetPasswordForEmail()` | User requesting reset | `supabase/templates/reset-password.html` |

> **Note:** The copyright year in Supabase templates is hardcoded (e.g. `© 2026`) because Go templates have no date helpers. Update manually each year.

---

## Custom Resend emails

Sent via `backend/src/lib/emailClient.ts`. Use `buildEmailHtml` + `getEmailForUser` helpers.

| Event constant | Trigger | Recipient | Send function |
|---|---|---|---|
| `waitlist.confirmation` | User joins waitlist | Submitter (email passed directly) | `sendWaitlistConfirmation` |
| `auth.password.reset.confirmation` | Password reset completed (`POST /api/auth/password-reset-confirmation`) | User who reset | `sendPasswordResetConfirmation` |
| `memorial.published` | Memorial status → published | Creator | `sendMemorialPublished` |
| `obituary.published` | Obituary status → published | Creator | `sendObituaryPublished` |
| `tribute.posted` | New tribute posted | Page owner (skip if self) | `sendTributePosted` |
| `condolence.posted` | New condolence posted | Page owner (skip if self) | `sendCondolencePosted` |

---

## Adding a new Resend email

1. Add constant to `EMAIL_EVENTS` in `backend/src/lib/emailClient.ts`
2. Write `sendXxx()` function in same file using `buildEmailHtml` + `getEmailForUser`
3. Wire fire-and-forget (or IIFE for secondary fetches) after `res.json()` in the relevant controller
4. Write test asserting the function is called (and self-notify guard if applicable)
5. Add row to the table above

## Adding a new Supabase auth email

1. Add constant to `EMAIL_EVENTS` (marked `// supabase-managed`)
2. Create `supabase/templates/{name}.html` matching the existing template shell
3. Register the template path in the Supabase dashboard (Auth → Email Templates)
4. Add row to the Supabase-managed table above
