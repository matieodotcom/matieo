/**
 * Tests for admin controller — stats, user management, content moderation.
 * Supabase is mocked to avoid hitting real DB.
 */
import request from 'supertest'

// ── Supabase mock ─────────────────────────────────────────────────────────────

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
    if (fn !== mockSingle && fn !== mockMaybeSingle) {
      fn.mockReturnThis()
    }
  })
  return obj
}

let currentChain = makeChain()

jest.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: jest.fn(() => currentChain),
  },
}))

// ── Auth middleware mock — admin by default ───────────────────────────────────

const mockRequireAdmin = jest.fn(
  (req: { user: unknown }, _res: unknown, next: () => void) => {
    req.user = { id: 'admin-123', email: 'admin@matieo.com', role: 'admin' }
    next()
  },
)

jest.mock('@/middleware/auth.middleware', () => ({
  requireAuth: (req: { user: unknown }, _res: unknown, next: () => void) => {
    req.user = { id: 'admin-123', email: 'admin@matieo.com', role: 'admin' }
    next()
  },
  requireAdmin: mockRequireAdmin,
}))

// Import app AFTER mocks
import app from '@/app'

beforeEach(() => {
  currentChain = makeChain()
  const { supabaseAdmin } = jest.requireMock('@/lib/supabaseAdmin') as {
    supabaseAdmin: { from: jest.Mock }
  }
  supabaseAdmin.from.mockReturnValue(currentChain)
  mockSingle.mockReset()
  mockMaybeSingle.mockReset()

  // Reset requireAdmin to admin passthrough
  mockRequireAdmin.mockImplementation(
    (req: { user: unknown }, _res: unknown, next: () => void) => {
      req.user = { id: 'admin-123', email: 'admin@matieo.com', role: 'admin' }
      next()
    },
  )
})

// ── Stats ─────────────────────────────────────────────────────────────────────

describe('GET /api/admin/stats', () => {
  it('returns stats with correct shape', async () => {
    // Each Promise.all call creates a fresh chain via supabaseAdmin.from()
    // The select() with head:true resolves the chain — mock it to return count
    currentChain.select.mockImplementation(() => {
      return {
        ...currentChain,
        eq: jest.fn().mockReturnValue({
          count: 3,
          data: null,
          error: null,
          then: (resolve: (v: { count: number; data: null; error: null }) => void) =>
            resolve({ count: 3, data: null, error: null }),
        }),
        count: 5,
        data: null,
        error: null,
        then: (resolve: (v: { count: number; data: null; error: null }) => void) =>
          resolve({ count: 5, data: null, error: null }),
      }
    })

    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('users')
    expect(res.body.data).toHaveProperty('memorials')
    expect(res.body.data).toHaveProperty('obituaries')
    expect(res.body.data).toHaveProperty('tributes')
    expect(res.body.data).toHaveProperty('condolences')
    expect(res.body.data).toHaveProperty('waitlist')
    expect(res.body.data.users).toHaveProperty('total')
    expect(res.body.data.users).toHaveProperty('admins')
    expect(res.body.data.users).toHaveProperty('researchers')
  })

  it('returns 403 when user is not admin', async () => {
    mockRequireAdmin.mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (_req: any, res: any, _next: any) => {
        res.status(403).json({ data: null, error: 'Forbidden' })
      },
    )

    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Forbidden')
  })
})

// ── Users ─────────────────────────────────────────────────────────────────────

describe('GET /api/admin/users', () => {
  it('returns paginated user list', async () => {
    currentChain.range.mockResolvedValue({
      data: [{ id: 'u1', full_name: 'Test User', email: 'test@test.com', role: 'user' }],
      error: null,
      count: 1,
    })

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('items')
    expect(res.body.data).toHaveProperty('total')
    expect(res.body.data).toHaveProperty('page')
    expect(res.body.data).toHaveProperty('limit')
    expect(Array.isArray(res.body.data.items)).toBe(true)
  })
})

describe('PATCH /api/admin/users/:id/role', () => {
  it('updates role when valid', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'u1', role: 'researcher' },
      error: null,
    })

    const res = await request(app)
      .patch('/api/admin/users/u1/role')
      .set('Authorization', 'Bearer fake-token')
      .send({ role: 'researcher' })

    expect(res.status).toBe(200)
    expect(res.body.data.role).toBe('researcher')
  })

  it('returns 400 on invalid role', async () => {
    const res = await request(app)
      .patch('/api/admin/users/u1/role')
      .set('Authorization', 'Bearer fake-token')
      .send({ role: 'superadmin' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Invalid role/)
  })
})

// ── Memorials ─────────────────────────────────────────────────────────────────

describe('GET /api/admin/memorials', () => {
  it('returns all memorials regardless of status', async () => {
    currentChain.range.mockResolvedValue({
      data: [
        { id: 'm1', status: 'published' },
        { id: 'm2', status: 'draft' },
      ],
      error: null,
      count: 2,
    })

    const res = await request(app)
      .get('/api/admin/memorials')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toHaveLength(2)
    expect(res.body.data.total).toBe(2)
  })
})

describe('PATCH /api/admin/memorials/:id/status', () => {
  it('returns 400 on invalid status', async () => {
    const res = await request(app)
      .patch('/api/admin/memorials/m1/status')
      .set('Authorization', 'Bearer fake-token')
      .send({ status: 'archived' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Invalid status/)
  })
})

describe('DELETE /api/admin/memorials/:id', () => {
  it('returns 204 on successful delete', async () => {
    currentChain.eq.mockResolvedValue({ error: null })

    const res = await request(app)
      .delete('/api/admin/memorials/m1')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(204)
  })
})

// ── Waitlist ──────────────────────────────────────────────────────────────────

describe('GET /api/admin/waitlist', () => {
  it('returns paginated waitlist', async () => {
    currentChain.range.mockResolvedValue({
      data: [{ id: 'w1', email: 'wait@test.com' }],
      error: null,
      count: 1,
    })

    const res = await request(app)
      .get('/api/admin/waitlist')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toHaveLength(1)
    expect(res.body.data.total).toBe(1)
  })
})

// ── Obituaries ────────────────────────────────────────────────────────────────

describe('GET /api/admin/obituaries', () => {
  it('returns all obituaries', async () => {
    currentChain.range.mockResolvedValue({
      data: [{ id: 'o1', status: 'published' }],
      error: null,
      count: 1,
    })

    const res = await request(app)
      .get('/api/admin/obituaries')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toHaveLength(1)
  })
})

// ── Tributes ──────────────────────────────────────────────────────────────────

describe('GET /api/admin/tributes', () => {
  it('returns all tributes', async () => {
    currentChain.range.mockResolvedValue({
      data: [{ id: 't1', content: 'Great person' }],
      error: null,
      count: 1,
    })

    const res = await request(app)
      .get('/api/admin/tributes')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toHaveLength(1)
  })
})

// ── Condolences ───────────────────────────────────────────────────────────────

describe('GET /api/admin/condolences', () => {
  it('returns all condolences', async () => {
    currentChain.range.mockResolvedValue({
      data: [{ id: 'c1', message: 'Sorry for your loss' }],
      error: null,
      count: 1,
    })

    const res = await request(app)
      .get('/api/admin/condolences')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toHaveLength(1)
  })
})
