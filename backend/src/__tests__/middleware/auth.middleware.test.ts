import request from 'supertest'
import app from '@/app'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const mockGetUser = supabaseAdmin.auth.getUser as jest.Mock
const mockFrom = supabaseAdmin.from as jest.Mock

describe('requireAuth middleware', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/api/memorials')
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/Missing or invalid/)
  })

  it('returns 401 when token is not Bearer format', async () => {
    const res = await request(app)
      .get('/api/memorials')
      .set('Authorization', 'Basic some-token')
    expect(res.status).toBe(401)
  })

  it('returns 401 when supabase returns an error', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid JWT', name: 'AuthApiError', status: 401 },
    })
    const res = await request(app)
      .get('/api/memorials')
      .set('Authorization', 'Bearer bad-token')
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/Invalid or expired/)
  })

  it('calls next when token is valid', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'test-user-id', email: 'test@matieo.com', user_metadata: { role: 'user' } } },
      error: null,
    })
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValueOnce({ data: [], error: null }),
    })

    const res = await request(app)
      .get('/api/memorials')
      .set('Authorization', 'Bearer valid-token')
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
  })
})
