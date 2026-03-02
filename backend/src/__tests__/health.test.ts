import request from 'supertest'
import app from '@/app'

describe('GET /health', () => {
  it('returns 200 with ok status', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.service).toBe('matieo-api')
    expect(res.body.timestamp).toBeDefined()
  })
})
