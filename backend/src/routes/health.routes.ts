/**
 * backend/src/routes/health.routes.ts
 * Health check endpoint — used by Render to verify service is running.
 * Returns 200 immediately. No auth, no DB call — must never fail.
 */
import { Router, Request, Response } from 'express'

const router = Router()

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'matieo-api',
    env: process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
  })
})

export default router
