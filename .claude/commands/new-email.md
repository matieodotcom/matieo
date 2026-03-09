# /new-email — Build a Transactional Email (MATIEO)

Build a new transactional email for: `$ARGUMENTS`

Parse argument as: `{email-name} [{trigger description}]`
Example: `/new-email memorial-published when a memorial goes from draft to published`

## Steps

1. **Check Resend setup** — use `mcp__resend__list-domains()` to confirm the sending domain is verified.

2. **Design the email**:
   - Subject line: clear, under 60 chars
   - Preview text: 80-120 chars
   - Body: plain HTML with inline styles (email clients don't support external CSS)
   - Brand colour: `#3B5BFF` (blue primary)
   - Font: system-safe stack — Arial, sans-serif (Montserrat not available in email clients)
   - Include unsubscribe link if marketing (not required for transactional)

3. **Create the email template** in `backend/src/emails/{email-name}.template.ts`:
   ```ts
   export function buildXxxEmail(data: XxxEmailData): { subject: string; html: string } { ... }
   ```

4. **Create the sending function** in `backend/src/emails/{email-name}.email.ts`:
   - Use `mcp__resend__send-email` for ad-hoc testing
   - In code: use the Resend SDK via `lib/resend.ts`
   - Always include `from: 'MATIEO <noreply@matieo.com>'`

5. **Trigger the email** — wire it into the relevant backend route or service (e.g. `onSuccess` of a Supabase mutation via a webhook or edge function).

6. **Test the email** — use `mcp__resend__send-email` to send a test to a real inbox and verify rendering.

7. **Update `docs/pages/{related-page}.md`** — document the email trigger in the page spec.

8. **Write unit tests** for the template function — test the HTML output contains expected content.

9. **Run tests** — must pass before commit.

10. **Commit** via `/done`.

## Rules
- NEVER send from an unverified domain
- NEVER expose Resend API key in frontend — backend only
- NEVER skip the inbox rendering test step
