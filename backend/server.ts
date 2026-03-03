/**
 * backend/server.ts — Entry point
 * Starts Express server on configured port.
 */
import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'development'}` })

import app from './src/app'

const PORT = parseInt(process.env.PORT ?? '3001', 10)

app.listen(PORT, () => {
  console.log(`✅ matieo-api running on port ${PORT} [${process.env.NODE_ENV}]`)
})
