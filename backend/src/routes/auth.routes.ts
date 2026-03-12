import { Router } from 'express'
import type { RequestHandler } from 'express'
import { requireAuth } from '@/middleware/auth.middleware'
import { passwordResetConfirmation } from '@/controllers/auth.controller'

const router = Router()

// Protected — valid Supabase session required
router.post(
  '/password-reset-confirmation',
  requireAuth as unknown as RequestHandler,
  passwordResetConfirmation as unknown as RequestHandler,
)

export default router
