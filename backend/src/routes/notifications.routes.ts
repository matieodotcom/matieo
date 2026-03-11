import { Router } from 'express'
import type { RequestHandler } from 'express'
import { requireAuth } from '@/middleware/auth.middleware'
import * as notifications from '@/controllers/notifications.controller'

const router = Router()

// All routes require authentication
router.get('/', requireAuth as unknown as RequestHandler, notifications.list as unknown as RequestHandler)

// /read-all must come BEFORE /:id to avoid Express treating "read-all" as an id
router.patch('/read-all', requireAuth as unknown as RequestHandler, notifications.markAllRead as unknown as RequestHandler)

router.patch('/:id/read', requireAuth as unknown as RequestHandler, notifications.markRead as unknown as RequestHandler)
router.delete('/:id', requireAuth as unknown as RequestHandler, notifications.deleteOne as unknown as RequestHandler)

export default router
