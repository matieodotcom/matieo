/**
 * Tests for admin service-categories CRUD endpoints.
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

import app from '@/app'

beforeEach(() => {
  currentChain = makeChain()
  const { supabaseAdmin } = jest.requireMock('@/lib/supabaseAdmin') as {
    supabaseAdmin: { from: jest.Mock }
  }
  supabaseAdmin.from.mockReturnValue(currentChain)
  mockSingle.mockReset()
  mockMaybeSingle.mockReset()
  mockRequireAdmin.mockImplementation(
    (req: { user: unknown }, _res: unknown, next: () => void) => {
      req.user = { id: 'admin-123', email: 'admin@matieo.com', role: 'admin' }
      next()
    },
  )
})

// ── GET /api/admin/service-categories ─────────────────────────────────────────

describe('GET /api/admin/service-categories', () => {
  it('returns paginated list of categories', async () => {
    const mockCategories = [
      { id: 'cat-1', name: 'Florists', slug: 'florists', is_active: true, sort_order: 1, created_at: '2026-01-01' },
    ]
    currentChain.range.mockResolvedValue({ data: mockCategories, error: null, count: 1 })

    const res = await request(app)
      .get('/api/admin/service-categories')
      .set('Authorization', 'Bearer admin-token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toHaveLength(1)
    expect(res.body.data.total).toBe(1)
  })

  it('returns 500 on DB error', async () => {
    currentChain.range.mockResolvedValue({ data: null, error: { message: 'DB error' }, count: null })

    const res = await request(app)
      .get('/api/admin/service-categories')
      .set('Authorization', 'Bearer admin-token')

    expect(res.status).toBe(500)
  })
})

// ── POST /api/admin/service-categories ───────────────────────────────────────

describe('POST /api/admin/service-categories', () => {
  it('creates a category and returns 201', async () => {
    const newCat = { id: 'cat-2', name: 'New Category', slug: 'new-category', is_active: true, sort_order: 0 }
    mockSingle.mockResolvedValue({ data: newCat, error: null })

    const res = await request(app)
      .post('/api/admin/service-categories')
      .set('Authorization', 'Bearer admin-token')
      .send({ name: 'New Category', description: 'A description', image_url: 'https://example.com/img.jpg', image_cloudinary_public_id: 'abc123' })

    expect(res.status).toBe(201)
    expect(res.body.data.name).toBe('New Category')
  })

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/admin/service-categories')
      .set('Authorization', 'Bearer admin-token')
      .send({ description: 'No name here', image_url: 'https://example.com/img.jpg' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/name/i)
  })

  it('returns 400 when description is missing', async () => {
    const res = await request(app)
      .post('/api/admin/service-categories')
      .set('Authorization', 'Bearer admin-token')
      .send({ name: 'New Category', image_url: 'https://example.com/img.jpg' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/description/i)
  })

  it('returns 400 when image is missing', async () => {
    const res = await request(app)
      .post('/api/admin/service-categories')
      .set('Authorization', 'Bearer admin-token')
      .send({ name: 'New Category', description: 'A description' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/image/i)
  })
})

// ── PATCH /api/admin/service-categories/:id ───────────────────────────────────

describe('PATCH /api/admin/service-categories/:id', () => {
  it('updates a category', async () => {
    const updated = { id: 'cat-1', name: 'Updated Name', slug: 'florists', is_active: true, sort_order: 1 }
    mockSingle.mockResolvedValue({ data: updated, error: null })

    const res = await request(app)
      .patch('/api/admin/service-categories/cat-1')
      .set('Authorization', 'Bearer admin-token')
      .send({ name: 'Updated Name' })

    expect(res.status).toBe(200)
    expect(res.body.data.name).toBe('Updated Name')
  })

  it('returns 400 when name is blank', async () => {
    const res = await request(app)
      .patch('/api/admin/service-categories/cat-1')
      .set('Authorization', 'Bearer admin-token')
      .send({ name: '   ' })

    expect(res.status).toBe(400)
  })
})

// ── DELETE /api/admin/service-categories/:id ─────────────────────────────────

describe('DELETE /api/admin/service-categories/:id', () => {
  it('deletes a category with no active services → 204', async () => {
    const { supabaseAdmin } = jest.requireMock('@/lib/supabaseAdmin') as {
      supabaseAdmin: { from: jest.Mock }
    }
    // Chain 1: .select('*',{count,head}).eq(category_id).eq(is_active)
    // Last call is second .eq() — must resolve
    const countChain = makeChain()
    countChain.eq
      .mockReturnValueOnce(countChain)  // first .eq returns chain
      .mockResolvedValueOnce({ data: null, error: null, count: 0 }) // second .eq resolves

    // Chain 2: .delete().eq(id)
    const deleteChain = makeChain()
    deleteChain.eq.mockResolvedValue({ error: null })

    supabaseAdmin.from
      .mockReturnValueOnce(countChain)
      .mockReturnValueOnce(deleteChain)

    const res = await request(app)
      .delete('/api/admin/service-categories/cat-1')
      .set('Authorization', 'Bearer admin-token')

    expect(res.status).toBe(204)
  })

  it('returns 409 when category has active services', async () => {
    const { supabaseAdmin } = jest.requireMock('@/lib/supabaseAdmin') as {
      supabaseAdmin: { from: jest.Mock }
    }
    // .select('*',{count,head}).eq(category_id).eq(is_active) — second eq resolves with count=3
    const countChain = makeChain()
    countChain.eq
      .mockReturnValueOnce(countChain)
      .mockResolvedValueOnce({ data: null, error: null, count: 3 })
    supabaseAdmin.from.mockReturnValueOnce(countChain)

    const res = await request(app)
      .delete('/api/admin/service-categories/cat-1')
      .set('Authorization', 'Bearer admin-token')

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/active service listings/i)
  })
})

// ── PUT /api/admin/service-categories/reorder ─────────────────────────────────

describe('PUT /api/admin/service-categories/reorder', () => {
  it('updates sort_order for each item → 200', async () => {
    // Each item triggers .update().eq() — eq resolves
    const chain1 = makeChain()
    chain1.eq.mockResolvedValue({ error: null })
    const chain2 = makeChain()
    chain2.eq.mockResolvedValue({ error: null })

    const { supabaseAdmin } = jest.requireMock('@/lib/supabaseAdmin') as {
      supabaseAdmin: { from: jest.Mock }
    }
    supabaseAdmin.from
      .mockReturnValueOnce(chain1)
      .mockReturnValueOnce(chain2)

    const res = await request(app)
      .put('/api/admin/service-categories/reorder')
      .set('Authorization', 'Bearer admin-token')
      .send({ items: [{ id: 'cat-1', sort_order: 1 }, { id: 'cat-2', sort_order: 2 }] })

    expect(res.status).toBe(200)
    expect(res.body.error).toBeNull()
  })

  it('returns 400 when items is missing', async () => {
    const res = await request(app)
      .put('/api/admin/service-categories/reorder')
      .set('Authorization', 'Bearer admin-token')
      .send({})

    expect(res.status).toBe(400)
  })
})
