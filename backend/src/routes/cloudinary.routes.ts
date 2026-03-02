import { Router } from 'express'
import type { RequestHandler } from 'express'
import { requireAuth } from '@/middleware/auth.middleware'
import { signUpload } from '@/controllers/cloudinary.controller'

const router = Router()

router.post(
  '/sign',
  requireAuth as unknown as RequestHandler,
  signUpload as unknown as RequestHandler,
)

export default router
