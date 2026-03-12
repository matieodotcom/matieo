import { Router } from 'express'
import type { RequestHandler } from 'express'
import { requireAdmin } from '@/middleware/auth.middleware'
import * as admin from '@/controllers/admin.controller'

const router = Router()

// All routes require admin role
router.get('/stats',                     requireAdmin as unknown as RequestHandler, admin.getStats as unknown as RequestHandler)
router.get('/users',                     requireAdmin as unknown as RequestHandler, admin.listUsers as unknown as RequestHandler)
router.patch('/users/:id/role',          requireAdmin as unknown as RequestHandler, admin.setUserRole as unknown as RequestHandler)
router.get('/memorials',                 requireAdmin as unknown as RequestHandler, admin.listMemorials as unknown as RequestHandler)
router.patch('/memorials/:id/status',    requireAdmin as unknown as RequestHandler, admin.setMemorialStatus as unknown as RequestHandler)
router.delete('/memorials/:id',          requireAdmin as unknown as RequestHandler, admin.deleteMemorial as unknown as RequestHandler)
router.get('/obituaries',                requireAdmin as unknown as RequestHandler, admin.listObituaries as unknown as RequestHandler)
router.patch('/obituaries/:id/status',   requireAdmin as unknown as RequestHandler, admin.setObituaryStatus as unknown as RequestHandler)
router.delete('/obituaries/:id',         requireAdmin as unknown as RequestHandler, admin.deleteObituary as unknown as RequestHandler)
router.get('/tributes',                  requireAdmin as unknown as RequestHandler, admin.listTributes as unknown as RequestHandler)
router.delete('/tributes/:id',           requireAdmin as unknown as RequestHandler, admin.deleteTribute as unknown as RequestHandler)
router.get('/condolences',               requireAdmin as unknown as RequestHandler, admin.listCondolences as unknown as RequestHandler)
router.delete('/condolences/:id',        requireAdmin as unknown as RequestHandler, admin.deleteCondolence as unknown as RequestHandler)
router.get('/waitlist',                  requireAdmin as unknown as RequestHandler, admin.listWaitlist as unknown as RequestHandler)

export default router
