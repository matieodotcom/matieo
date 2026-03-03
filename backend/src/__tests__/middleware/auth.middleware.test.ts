import request from 'supertest'
import app from '@/app'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const mockGetUser = supabaseAdmin.auth.getUser as jest.Mock
const mockFrom = supabaseAdmin.from as jest.Mock

// Use POST /api/memorials — still requires auth (unlike GET /)
describe('requireAuth middleware', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(app).post('/api/memorials').send({ full_name: 'Test' })
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/Missing or invalid/)
  })

  it('returns 401 when token is not Bearer format', async () => {
    const res = await request(app)
      .post('/api/memorials')
      .set('Authorization', 'Basic some-token')
      .send({ full_name: 'Test' })
    expect(res.status).toBe(401)
  })

  it('returns 401 when supabase returns an error', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid JWT', name: 'AuthApiError', status: 401 },
    })
    const res = await request(app)
      .post('/api/memorials')
      .set('Authorization', 'Bearer bad-token')
      .send({ full_name: 'Test' })
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/Invalid or expired/)
  })

  it('calls next when token is valid', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'test-user-id', email: 'test@matieo.com', user_metadata: { role: 'user' } } },
      error: null,
    })
    // slug uniqueness check
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValueOnce({ data: null, error: null }),
    })
    // insert
    mockFrom.mockReturnValueOnce({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({
        data: { id: 'new-id', full_name: 'Test Memorial' },
        error: null,
      }),
    })

    const res = await request(app)
      .post('/api/memorials')
      .set('Authorization', 'Bearer valid-token')
      .send({ full_name: 'Test Memorial' })
    // Auth passed — controller ran and returned 201
    expect(res.status).toBe(201)
  })
})
