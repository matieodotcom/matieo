import { Router } from 'express'
import type { RequestHandler } from 'express'
import { requireAuth } from '@/middleware/auth.middleware'
import * as services from '@/controllers/services.controller'

const router = Router()

router.get('/categories',  services.listPublicCategories as unknown as RequestHandler)
router.get('/my',          requireAuth as unknown as RequestHandler, services.listMyServices as unknown as RequestHandler)
router.post('/my',         requireAuth as unknown as RequestHandler, services.createMyService as unknown as RequestHandler)
router.patch('/my/:id',    requireAuth as unknown as RequestHandler, services.updateMyService as unknown as RequestHandler)
router.delete('/my/:id',   requireAuth as unknown as RequestHandler, services.deleteMyService as unknown as RequestHandler)

export default router
