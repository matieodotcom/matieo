/**
 * backend/src/lib/emailClient.ts
 * Resend email client singleton + helpers.
 *
 * EMAIL_EVENTS is the single source of truth for every transactional email.
 * Before adding a new email, consult docs/email-trigger-map.md.
 */
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@matieo.com'
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'https://matieo.com'

// ── Email event registry ───────────────────────────────────────────────────────

export const EMAIL_EVENTS = {
  WAITLIST_CONFIRMATION: 'waitlist.confirmation',
  MEMORIAL_PUBLISHED:    'memorial.published',
  OBITUARY_PUBLISHED:    'obituary.published',
  TRIBUTE_POSTED:        'tribute.posted',
  CONDOLENCE_POSTED:     'condolence.posted',
} as const satisfies Record<string, string>

// ── Shared helpers ─────────────────────────────────────────────────────────────

/** Wraps inner body HTML in the standard MATIEO email shell */
export function buildEmailHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MATIEO</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Montserrat',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#3B5BFF;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">MATIEO</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Mortality Insights &amp; Memorial Platform</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background:#1a1a2e;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;line-height:1.6;">
                © ${new Date().getFullYear()} MATIEO. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

/** Look up a user's email address via the service-role admin API */
export async function getEmailForUser(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (error || !data.user?.email) return null
  return data.user.email
}

// ── Send functions ─────────────────────────────────────────────────────────────

export async function sendWaitlistConfirmation(name: string, email: string): Promise<void> {
  await resend.emails.send({
    from: `MATIEO <${FROM_EMAIL}>`,
    to: email,
    subject: "You're following MATIEO — we'll keep you updated!",
    html: buildEmailHtml(`
      <p style="margin:0 0 16px;font-size:16px;color:#1a1a2e;font-weight:600;">Hi ${name},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#4a5568;line-height:1.6;">
        Thank you for following MATIEO! You're now on our list to receive updates on:
      </p>
      <ul style="margin:0 0 24px;padding-left:20px;color:#4a5568;font-size:15px;line-height:1.8;">
        <li>New features and platform improvements</li>
        <li>Meaningful stories from our community</li>
        <li>Mortality insights and research highlights</li>
        <li>Early access to upcoming tools</li>
      </ul>
      <p style="margin:0 0 32px;font-size:15px;color:#4a5568;line-height:1.6;">
        We'll only reach out when we have something genuinely worth sharing.
      </p>
      <a href="${FRONTEND_URL}"
         style="display:inline-block;background:#3B5BFF;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        Visit MATIEO
      </a>
    `),
  })
}

export async function sendMemorialPublished(
  creatorId: string,
  memorialName: string,
  slug: string,
): Promise<void> {
  const email = await getEmailForUser(creatorId)
  if (!email) return

  const url = `${FRONTEND_URL}/memorial/${slug}`

  await resend.emails.send({
    from: `MATIEO <${FROM_EMAIL}>`,
    to: email,
    subject: `Your memorial for ${memorialName} is now live`,
    html: buildEmailHtml(`
      <p style="margin:0 0 16px;font-size:15px;color:#4a5568;line-height:1.6;">
        The memorial page for <strong>${memorialName}</strong> has been published and is now publicly visible.
      </p>
      <p style="margin:0 0 32px;font-size:15px;color:#4a5568;line-height:1.6;">
        Share the link below with family and friends so they can leave tributes and remember their loved one.
      </p>
      <a href="${url}"
         style="display:inline-block;background:#3B5BFF;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        View Memorial
      </a>
    `),
  })
}

export async function sendObituaryPublished(
  creatorId: string,
  obituaryName: string,
  slug: string,
): Promise<void> {
  const email = await getEmailForUser(creatorId)
  if (!email) return

  const url = `${FRONTEND_URL}/obituary/${slug}`

  await resend.emails.send({
    from: `MATIEO <${FROM_EMAIL}>`,
    to: email,
    subject: `Your obituary for ${obituaryName} is now live`,
    html: buildEmailHtml(`
      <p style="margin:0 0 16px;font-size:15px;color:#4a5568;line-height:1.6;">
        The obituary for <strong>${obituaryName}</strong> has been published and is now publicly visible.
      </p>
      <p style="margin:0 0 32px;font-size:15px;color:#4a5568;line-height:1.6;">
        Share the link below with family and friends so they can leave condolences.
      </p>
      <a href="${url}"
         style="display:inline-block;background:#3B5BFF;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        View Obituary
      </a>
    `),
  })
}

export async function sendTributePosted(
  pageOwnerId: string,
  tributeAuthorId: string,
  memorialName: string,
  slug: string,
  authorName: string,
): Promise<void> {
  if (pageOwnerId === tributeAuthorId) return

  const email = await getEmailForUser(pageOwnerId)
  if (!email) return

  const url = `${FRONTEND_URL}/memorial/${slug}`

  await resend.emails.send({
    from: `MATIEO <${FROM_EMAIL}>`,
    to: email,
    subject: `${authorName} left a tribute on ${memorialName}`,
    html: buildEmailHtml(`
      <p style="margin:0 0 16px;font-size:15px;color:#4a5568;line-height:1.6;">
        <strong>${authorName}</strong> has posted a tribute on the memorial page for <strong>${memorialName}</strong>.
      </p>
      <p style="margin:0 0 32px;font-size:15px;color:#4a5568;line-height:1.6;">
        Visit the page to read the tribute and respond to your community.
      </p>
      <a href="${url}"
         style="display:inline-block;background:#3B5BFF;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        View Memorial
      </a>
    `),
  })
}

export async function sendCondolencePosted(
  pageOwnerId: string,
  condolenceAuthorId: string,
  obituaryName: string,
  slug: string,
  authorName: string,
): Promise<void> {
  if (pageOwnerId === condolenceAuthorId) return

  const email = await getEmailForUser(pageOwnerId)
  if (!email) return

  const url = `${FRONTEND_URL}/obituary/${slug}`

  await resend.emails.send({
    from: `MATIEO <${FROM_EMAIL}>`,
    to: email,
    subject: `${authorName} left a condolence on ${obituaryName}`,
    html: buildEmailHtml(`
      <p style="margin:0 0 16px;font-size:15px;color:#4a5568;line-height:1.6;">
        <strong>${authorName}</strong> has posted a condolence on the obituary for <strong>${obituaryName}</strong>.
      </p>
      <p style="margin:0 0 32px;font-size:15px;color:#4a5568;line-height:1.6;">
        Visit the page to read the condolence and respond to your community.
      </p>
      <a href="${url}"
         style="display:inline-block;background:#3B5BFF;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        View Obituary
      </a>
    `),
  })
}
