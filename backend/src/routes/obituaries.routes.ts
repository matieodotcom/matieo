import { Router } from 'express'
import type { RequestHandler } from 'express'
import { requireAuth } from '@/middleware/auth.middleware'
import * as obituaries from '@/controllers/obituaries.controller'
import * as condolences from '@/controllers/condolences.controller'

const router = Router()

// Public — anyone can browse published obituaries
router.get('/', obituaries.listPublished as unknown as RequestHandler)
router.get('/by-slug/:slug', obituaries.getBySlug as unknown as RequestHandler)

// Authenticated — requires valid Bearer token
router.post('/', requireAuth as unknown as RequestHandler, obituaries.create as unknown as RequestHandler)
// /mine must come before /:id so Express doesn't treat "mine" as an id
router.get('/mine', requireAuth as unknown as RequestHandler, obituaries.list as unknown as RequestHandler)

// Condolences — must be before /:id catch-all
router.get('/:id/condolences', condolences.listCondolences as unknown as RequestHandler)
router.post('/:id/condolences', requireAuth as unknown as RequestHandler, condolences.createCondolence as unknown as RequestHandler)

router.get('/:id', requireAuth as unknown as RequestHandler, obituaries.getById as unknown as RequestHandler)
router.patch('/:id', requireAuth as unknown as RequestHandler, obituaries.update as unknown as RequestHandler)
router.delete('/:id', requireAuth as unknown as RequestHandler, obituaries.softDelete as unknown as RequestHandler)
router.delete('/:id/permanent', requireAuth as unknown as RequestHandler, obituaries.permanentDelete as unknown as RequestHandler)
router.post('/:id/publish', requireAuth as unknown as RequestHandler, obituaries.publish as unknown as RequestHandler)
router.post('/:id/unpublish', requireAuth as unknown as RequestHandler, obituaries.unpublish as unknown as RequestHandler)

export default router
