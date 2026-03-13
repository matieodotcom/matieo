/**
 * Tests for services endpoints — public categories + org CRUD.
 */
import request from 'supertest'

const mockSingle = jest.fn()
const mockMaybeSingle = jest.fn()

function makeChain() {
  const obj: Record<string, jest.Mock> = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    neq: jest.fn(),
    is: jest.fn(),
    in: jest.fn(),
    or: jest.fn(),
    ilike: jest.fn(),
    gte: jest.fn(),
    lte: jest.fn(),
    order: jest.fn(),
    range: jest.fn(),
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
  }
  Object.values(obj).forEach((fn) => {
    if (fn !== mockSingle && fn !== mockMaybeSingle) fn.mockReturnThis()
  })
  return obj
}

let currentChain = makeChain()

jest.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: jest.fn(() => currentChain),
  },
}))

jest.mock('@/middleware/auth.middleware', () => ({
  requireAuth: (req: { user: unknown }, _res: unknown, next: () => void) => {
    req.user = { id: 'org-user-123', email: 'org@example.com', role: 'user' }
    next()
  },
  requireAdmin: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

import app from '@/app'

function getFromMock() {
  const { supabaseAdmin } = jest.requireMock('@/lib/supabaseAdmin') as {
    supabaseAdmin: { from: jest.Mock }
  }
  return supabaseAdmin.from
}

beforeEach(() => {
  currentChain = makeChain()
  getFromMock().mockReturnValue(currentChain)
  mockSingle.mockReset()
  mockMaybeSingle.mockReset()
})

// ── GET /api/services/categories (public) ─────────────────────────────────────

describe('GET /api/services/categories', () => {
  it('returns active categories with service_count', async () => {
    const catChain = makeChain()
    // chain: .select().eq().order().order() — second .order() resolves
    catChain.order
      .mockReturnValueOnce(catChain)  // first .order() → chain
      .mockResolvedValueOnce({
        data: [{ id: 'cat-1', name: 'Florists', slug: 'florists', sort_order: 1 }],
        error: null,
      })

    const countChain = makeChain()
    // chain: .select().eq().in() — .in() resolves
    countChain.in.mockResolvedValue({
      data: [{ category_id: 'cat-1' }, { category_id: 'cat-1' }],
      error: null,
    })

    getFromMock().mockImplementation((table: string) => {
      if (table === 'service_categories') return catChain
      if (table === 'organization_services') return countChain
      return currentChain
    })

    const res = await request(app).get('/api/services/categories')

    expect(res.status).toBe(200)
    expect(res.body.data[0].service_count).toBe(2)
  })
})

// ── GET /api/services/my ──────────────────────────────────────────────────────

describe('GET /api/services/my', () => {
  it('returns org user listings', async () => {
    // profiles chain: .select().eq().single()
    const profileChain = makeChain()
    mockSingle.mockResolvedValueOnce({ data: { account_type: 'organization' }, error: null })

    // organization_services chain: .select().eq().order()
    const servicesChain = makeChain()
    servicesChain.order.mockResolvedValue({
      data: [{ id: 'svc-1', name: 'My Florist', category_id: 'cat-1' }],
      error: null,
    })

    getFromMock().mockImplementation((table: string) => {
      if (table === 'profiles') return profileChain
      if (table === 'organization_services') return servicesChain
      return currentChain
    })

    const res = await request(app)
      .get('/api/services/my')
      .set('Authorization', 'Bearer org-token')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
  })

  it('returns 403 for non-org user', async () => {
    const profileChain = makeChain()
    mockSingle.mockResolvedValueOnce({ data: { account_type: 'individual' }, error: null })

    getFromMock().mockImplementation((table: string) => {
      if (table === 'profiles') return profileChain
      return currentChain
    })

    const res = await request(app)
      .get('/api/services/my')
      .set('Authorization', 'Bearer user-token')

    expect(res.status).toBe(403)
  })
})

// ── POST /api/services/my ─────────────────────────────────────────────────────

describe('POST /api/services/my', () => {
  it('creates a service listing', async () => {
    const profileChain = makeChain()
    mockSingle
      .mockResolvedValueOnce({ data: { account_type: 'organization' }, error: null })
      .mockResolvedValueOnce({ data: { id: 'svc-2', name: 'New Service', category_id: 'cat-1' }, error: null })

    const insertChain = makeChain()

    getFromMock().mockImplementation((table: string) => {
      if (table === 'profiles') return profileChain
      if (table === 'organization_services') return insertChain
      return currentChain
    })

    const res = await request(app)
      .post('/api/services/my')
      .set('Authorization', 'Bearer org-token')
      .send({ name: 'New Service', category_id: 'cat-1' })

    expect(res.status).toBe(201)
    expect(res.body.data.name).toBe('New Service')
  })

  it('returns 400 when name is missing', async () => {
    const profileChain = makeChain()
    mockSingle.mockResolvedValueOnce({ data: { account_type: 'organization' }, error: null })

    getFromMock().mockImplementation((table: string) => {
      if (table === 'profiles') return profileChain
      return currentChain
    })

    const res = await request(app)
      .post('/api/services/my')
      .set('Authorization', 'Bearer org-token')
      .send({ category_id: 'cat-1' })

    expect(res.status).toBe(400)
  })
})

// ── DELETE /api/services/my/:id ───────────────────────────────────────────────

describe('DELETE /api/services/my/:id', () => {
  it('deletes own service → 204', async () => {
    // fetch chain: .select().eq().single()
    const fetchChain = makeChain()
    mockSingle.mockResolvedValueOnce({
      data: { organization_id: 'org-user-123' },
      error: null,
    })

    // delete chain: .delete().eq()
    const deleteChain = makeChain()
    deleteChain.eq.mockResolvedValue({ error: null })

    let callCount = 0
    getFromMock().mockImplementation(() => {
      callCount++
      if (callCount === 1) return fetchChain
      return deleteChain
    })

    const res = await request(app)
      .delete('/api/services/my/svc-1')
      .set('Authorization', 'Bearer org-token')

    expect(res.status).toBe(204)
  })

  it('returns 403 when deleting another user listing', async () => {
    const fetchChain = makeChain()
    mockSingle.mockResolvedValueOnce({
      data: { organization_id: 'different-user-999' },
      error: null,
    })

    getFromMock().mockImplementation(() => fetchChain)

    const res = await request(app)
      .delete('/api/services/my/svc-other')
      .set('Authorization', 'Bearer org-token')

    expect(res.status).toBe(403)
  })
})
