/**
 * backend/src/app.ts — Express app setup
 * Registers middleware and routes.
 */
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import healthRouter from './routes/health.routes'
// import memorialsRouter from './routes/memorials.routes'
// import insightsRouter from './routes/insights.routes'
// import cloudinaryRouter from './routes/cloudinary.routes'

const app = express()

// ── Security middleware ──────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

// ── Routes ───────────────────────────────────────────────────────────────────
app.use(healthRouter)
// app.use('/api/memorials', memorialsRouter)
// app.use('/api/insights', insightsRouter)
// app.use('/api/cloudinary', cloudinaryRouter)

export default app
