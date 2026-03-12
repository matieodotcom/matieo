/**
 * backend/src/app.ts — Express app setup
 * Registers middleware and routes.
 */
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import healthRouter from './routes/health.routes'
import memorialsRouter from './routes/memorials.routes'
import obituariesRouter from './routes/obituaries.routes'
import cloudinaryRouter from './routes/cloudinary.routes'
import waitlistRouter from './routes/waitlist.routes'
import notificationsRouter from './routes/notifications.routes'
import authRouter from './routes/auth.routes'
import adminRouter from './routes/admin.routes'
import { errorHandler } from './middleware/error.middleware'

const app = express()

// Trust one proxy hop so req.ip resolves the real client IP behind load balancers/Nginx
app.set('trust proxy', 1)

// ── Security middleware ──────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

// ── Rate limiting ────────────────────────────────────────────────────────────
// Skip entirely in development — pollers + hot reloads burn through limits fast.
// Production default: 500 req / 15 min per IP (env vars override both).
if (process.env.NODE_ENV !== 'development') {
  app.use(rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900_000),
    max:      Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 500),
    standardHeaders: true,
    legacyHeaders:   false,
  }))
}

// ── Routes ───────────────────────────────────────────────────────────────────
app.use(healthRouter)
app.use('/api/memorials', memorialsRouter)
app.use('/api/obituaries', obituariesRouter)
app.use('/api/cloudinary', cloudinaryRouter)
app.use('/api/waitlist', waitlistRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)

// ── Error handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler)

export default app
