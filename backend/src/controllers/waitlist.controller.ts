/**
 * backend/src/controllers/waitlist.controller.ts
 * Handles waitlist subscription — public endpoint, no auth required.
 */
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendWaitlistConfirmation } from '@/lib/emailClient'

const subscribeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
})

export async function subscribe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = subscribeSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({
        data: null,
        error: parsed.error.issues[0]?.message ?? 'Invalid request',
      })
      return
    }

    const { name, email } = parsed.data

    const { error } = await supabaseAdmin
      .from('waitlist_subscribers')
      .insert({ name, email })

    if (error) {
      // Postgres unique-constraint violation
      if (error.code === '23505') {
        res.status(409).json({ data: null, error: 'Already subscribed' })
        return
      }
      throw error
    }

    // Fire-and-forget — don't block the response on email delivery
    sendWaitlistConfirmation(name, email).catch((err: unknown) => {
      console.error('[emailClient] sendWaitlistConfirmation failed:', err)
    })

    res.status(201).json({ data: { message: 'Subscribed' }, error: null })
  } catch (err) {
    next(err)
  }
}
