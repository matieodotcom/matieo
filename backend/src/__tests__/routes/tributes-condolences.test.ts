import request from 'supertest'
import app from '@/app'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const mockGetUser = supabaseAdmin.auth.getUser as jest.Mock
const mockFrom = supabaseAdmin.from as jest.Mock

const POST_AUTHOR  = { id: 'author-id',     email: 'author@matieo.com',    user_metadata: { role: 'user' } }
const PAGE_OWNER   = { id: 'page-owner-id', email: 'pageowner@matieo.com', user_metadata: { role: 'user' } }
const STRANGER     = { id: 'stranger-id',   email: 'stranger@matieo.com',  user_metadata: { role: 'user' } }

function mockAuth(user = POST_AUTHOR) {
  mockGetUser.mockResolvedValueOnce({ data: { user }, error: null })
}

/** Build the two parallel select mocks (tribute/condolence + page) */
function mockSelectPair(postUserId: string, pageCreatedBy: string) {
  // tribute / condolence select
  mockFrom.mockReturnValueOnce({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValueOnce({ data: { user_id: postUserId }, error: null }),
  })
  // memorial / obituary select
  mockFrom.mockReturnValueOnce({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValueOnce({ data: { created_by: pageCreatedBy }, error: null }),
  })
}

function mockDelete() {
  mockFrom.mockReturnValueOnce({
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValueOnce({ error: null }),
  })
}

// ── DELETE /api/memorials/:id/tributes/:tributeId ───────────────────────────

describe('DELETE /api/memorials/:id/tributes/:tributeId', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).delete('/api/memorials/mem-1/tributes/tribute-1')
    expect(res.status).toBe(401)
  })

  it('returns 404 when tribute does not exist', async () => {
    mockAuth()
    // tribute not found
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({ data: null, error: { message: 'not found' } }),
    })
    // memorial select (fires in parallel — result ignored on 404 path)
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({ data: { created_by: PAGE_OWNER.id }, error: null }),
    })

    const res = await request(app)
      .delete('/api/memorials/mem-1/tributes/tribute-1')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Tribute not found')
  })

  it('returns 403 when user is neither the author nor the page owner', async () => {
    mockAuth(STRANGER)
    mockSelectPair(POST_AUTHOR.id, PAGE_OWNER.id)

    const res = await request(app)
      .delete('/api/memorials/mem-1/tributes/tribute-1')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Not authorised to delete this tribute')
  })

  it('deletes tribute and returns 200 when user is the post author', async () => {
    mockAuth(POST_AUTHOR)
    mockSelectPair(POST_AUTHOR.id, PAGE_OWNER.id)
    mockDelete()

    const res = await request(app)
      .delete('/api/memorials/mem-1/tributes/tribute-1')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('tribute-1')
  })

  it('deletes tribute and returns 200 when user is the memorial (page) owner', async () => {
    mockAuth(PAGE_OWNER)
    mockSelectPair(POST_AUTHOR.id, PAGE_OWNER.id)
    mockDelete()

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
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({ data: { created_by: PAGE_OWNER.id }, error: null }),
    })

    const res = await request(app)
      .delete('/api/obituaries/obit-1/condolences/cond-1')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Condolence not found')
  })

  it('returns 403 when user is neither the author nor the page owner', async () => {
    mockAuth(STRANGER)
    mockSelectPair(POST_AUTHOR.id, PAGE_OWNER.id)

    const res = await request(app)
      .delete('/api/obituaries/obit-1/condolences/cond-1')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Not authorised to delete this condolence')
  })

  it('deletes condolence and returns 200 when user is the post author', async () => {
    mockAuth(POST_AUTHOR)
    mockSelectPair(POST_AUTHOR.id, PAGE_OWNER.id)
    mockDelete()

    const res = await request(app)
      .delete('/api/obituaries/obit-1/condolences/cond-1')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('cond-1')
  })

  it('deletes condolence and returns 200 when user is the obituary (page) owner', async () => {
    mockAuth(PAGE_OWNER)
    mockSelectPair(POST_AUTHOR.id, PAGE_OWNER.id)
    mockDelete()

    const res = await request(app)
      .delete('/api/obituaries/obit-1/condolences/cond-1')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('cond-1')
  })
})
