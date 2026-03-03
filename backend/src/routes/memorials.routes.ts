import { Router } from 'express'
import type { RequestHandler } from 'express'
import { requireAuth } from '@/middleware/auth.middleware'
import * as memorials from '@/controllers/memorials.controller'

const router = Router()

// Public — anyone can browse published memorials
router.get('/', memorials.listPublished as unknown as RequestHandler)

// Authenticated — requires valid Bearer token
router.post('/', requireAuth as unknown as RequestHandler, memorials.create as unknown as RequestHandler)
// /mine must come before /:id so Express doesn't treat "mine" as an id
router.get('/mine', requireAuth as unknown as RequestHandler, memorials.list as unknown as RequestHandler)
router.get('/:id', requireAuth as unknown as RequestHandler, memorials.getById as unknown as RequestHandler)
router.patch('/:id', requireAuth as unknown as RequestHandler, memorials.update as unknown as RequestHandler)
router.delete('/:id', requireAuth as unknown as RequestHandler, memorials.softDelete as unknown as RequestHandler)
router.post('/:id/publish', requireAuth as unknown as RequestHandler, memorials.publish as unknown as RequestHandler)

export default router
