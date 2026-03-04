/**
 * backend/src/lib/emailClient.ts
 * Resend email client singleton + helpers.
 */
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@matieo.com'

export async function sendWaitlistConfirmation(name: string, email: string): Promise<void> {
  await resend.emails.send({
    from: `MATIEO <${FROM_EMAIL}>`,
    to: email,
    subject: "You're following MATIEO — we'll keep you updated!",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to MATIEO</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Montserrat',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#3B5BFF;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">MATIEO</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Mortality Insights &amp; Memorial Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
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
              <a href="https://matieo.com"
                 style="display:inline-block;background:#3B5BFF;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
                Visit MATIEO
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#1a1a2e;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;line-height:1.6;">
                © ${new Date().getFullYear()} MATIEO. All rights reserved.<br />
                You received this email because you subscribed at matieo.com.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })
}
