/**
 * backend/src/controllers/auth.controller.ts
 * Auth-related custom events (password reset confirmation, etc.)
 */
import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '@/types/memorial.types'
import { sendPasswordResetConfirmation } from '@/lib/emailClient'

export async function passwordResetConfirmation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id

    // Fire-and-forget — don't block the response on email delivery
    sendPasswordResetConfirmation(userId).catch((err: unknown) => {
      console.error('[emailClient] sendPasswordResetConfirmation failed:', err)
    })

    res.status(200).json({ data: { message: 'Confirmation email queued' }, error: null })
  } catch (err) {
    next(err)
  }
}
