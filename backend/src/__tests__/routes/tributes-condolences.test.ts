import request from 'supertest'
import app from '@/app'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const mockGetUser = supabaseAdmin.auth.getUser as jest.Mock
const mockFrom = supabaseAdmin.from as jest.Mock

const OWNER = { id: 'owner-id', email: 'owner@matieo.com', user_metadata: { role: 'user' } }
const OTHER = { id: 'other-id', email: 'other@matieo.com', user_metadata: { role: 'user' } }

function mockAuth(user = OWNER) {
  mockGetUser.mockResolvedValueOnce({ data: { user }, error: null })
}

// ── DELETE /api/memorials/:id/tributes/:tributeId ───────────────────────────

describe('DELETE /api/memorials/:id/tributes/:tributeId', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).delete('/api/memorials/mem-1/tributes/tribute-1')
    expect(res.status).toBe(401)
  })

  it('returns 404 when tribute does not exist', async () => {
    mockAuth()
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({ data: null, error: { message: 'not found' } }),
    })

    const res = await request(app)
      .delete('/api/memorials/mem-1/tributes/tribute-1')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Tribute not found')
  })

  it('returns 403 when user is not the author', async () => {
    mockAuth(OTHER)
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({ data: { user_id: OWNER.id }, error: null }),
    })

    const res = await request(app)
      .delete('/api/memorials/mem-1/tributes/tribute-1')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Not authorised to delete this tribute')
  })

  it('deletes tribute and returns 200 for the owner', async () => {
    mockAuth(OWNER)
    // First call: select to verify ownership
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({ data: { user_id: OWNER.id }, error: null }),
    })
    // Second call: delete
    mockFrom.mockReturnValueOnce({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValueOnce({ error: null }),
    })

    const res = await request(app)
      .delete('/api/memorials/mem-1/tributes/tribute-1')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('tribute-1')
  })
})

// ── DELETE /api/obituaries/:id/condolences/:condolenceId ───────────────────

describe('DELETE /api/obituaries/:id/condolences/:condolenceId', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).delete('/api/obituaries/obit-1/condolences/cond-1')
    expect(res.status).toBe(401)
  })

  it('returns 404 when condolence does not exist', async () => {
    mockAuth()
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({ data: null, error: { message: 'not found' } }),
    })

    const res = await request(app)
      .delete('/api/obituaries/obit-1/condolences/cond-1')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Condolence not found')
  })

  it('returns 403 when user is not the author', async () => {
    mockAuth(OTHER)
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({ data: { user_id: OWNER.id }, error: null }),
    })

    const res = await request(app)
      .delete('/api/obituaries/obit-1/condolences/cond-1')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Not authorised to delete this condolence')
  })

  it('deletes condolence and returns 200 for the owner', async () => {
    mockAuth(OWNER)
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({ data: { user_id: OWNER.id }, error: null }),
    })
    mockFrom.mockReturnValueOnce({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValueOnce({ error: null }),
    })

    const res = await request(app)
      .delete('/api/obituaries/obit-1/condolences/cond-1')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('cond-1')
  })
})
