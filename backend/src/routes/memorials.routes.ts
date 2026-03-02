import { Router } from 'express'
import type { RequestHandler } from 'express'
import { requireAuth } from '@/middleware/auth.middleware'
import * as memorials from '@/controllers/memorials.controller'

const router = Router()

router.use(requireAuth as unknown as RequestHandler)
router.get('/', memorials.list as unknown as RequestHandler)
router.post('/', memorials.create as unknown as RequestHandler)
router.get('/:id', memorials.getById as unknown as RequestHandler)
router.patch('/:id', memorials.update as unknown as RequestHandler)
router.delete('/:id', memorials.softDelete as unknown as RequestHandler)
router.post('/:id/publish', memorials.publish as unknown as RequestHandler)

export default router
