import { Router } from 'express'
import type { RequestHandler } from 'express'
import { subscribe } from '@/controllers/waitlist.controller'

const router = Router()

// Public — no auth required
router.post('/', subscribe as unknown as RequestHandler)

export default router
