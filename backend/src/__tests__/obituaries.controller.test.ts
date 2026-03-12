/**
 * Tests for obituaries controller — slug generation, status handling, and private field stripping.
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
    is: jest.fn(),
    ilike: jest.fn(),
    order: jest.fn(),
    range: jest.fn(),
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
  }
  // Make every method return `this` by default so chains work
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

// ── Auth middleware mock ───────────────────────────────────────────────────────

jest.mock('@/middleware/auth.middleware', () => ({
  requireAuth: (req: { user: unknown }, _res: unknown, next: () => void) => {
    req.user = { id: 'user-123', email: 'test@matieo.com', role: 'user' }
    next()
  },
  requireAdmin: (req: { user: unknown }, _res: unknown, next: () => void) => {
    req.user = { id: 'admin-123', email: 'admin@matieo.com', role: 'admin' }
    next()
  },
}))

// Import app AFTER mocks are set up
import app from '@/app'

beforeEach(() => {
  currentChain = makeChain()
  const { supabaseAdmin } = jest.requireMock('@/lib/supabaseAdmin')
  supabaseAdmin.from.mockReturnValue(currentChain)
  mockSingle.mockReset()
  mockMaybeSingle.mockReset()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/obituaries — create', () => {
  it('creates obituary with auto-generated slug when no custom_slug', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null }) // slug uniqueness check
    mockSingle.mockResolvedValue({
      data: { id: 'obit-1', slug: 'john-doe-2024', full_name: 'John Doe', status: 'draft' },
      error: null,
    })

    const res = await request(app)
      .post('/api/obituaries')
      .set('Authorization', 'Bearer fake-token')
      .send({ full_name: 'John Doe', date_of_death: '2024-01-10' })

    expect(res.status).toBe(201)
    expect(res.body.data).toBeDefined()
  })

  it('accepts custom_slug when unique', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
    mockSingle.mockResolvedValue({
      data: { id: 'obit-2', slug: 'my-custom-slug', full_name: 'Jane Doe', status: 'draft' },
      error: null,
    })

    const res = await request(app)
      .post('/api/obituaries')
      .set('Authorization', 'Bearer fake-token')
      .send({ full_name: 'Jane Doe', custom_slug: 'my-custom-slug' })

    expect(res.status).toBe(201)
  })

  it('returns 422 when custom_slug is already taken', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'existing' }, error: null })

    const res = await request(app)
      .post('/api/obituaries')
      .set('Authorization', 'Bearer fake-token')
      .send({ full_name: 'Jane Doe', custom_slug: 'taken-slug' })

    expect(res.status).toBe(422)
    expect(res.body.error).toMatch(/already taken/)
  })

  it('returns 400 when full_name is missing', async () => {
    const res = await request(app)
      .post('/api/obituaries')
      .set('Authorization', 'Bearer fake-token')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/full_name/)
  })

  it('creates a draft when status is draft', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
    mockSingle.mockResolvedValue({
      data: { id: 'obit-3', slug: 'draft-obit', status: 'draft', full_name: 'Draft Person' },
      error: null,
    })

    const res = await request(app)
      .post('/api/obituaries')
      .set('Authorization', 'Bearer fake-token')
      .send({ full_name: 'Draft Person', status: 'draft' })

    expect(res.status).toBe(201)
    expect(res.body.data.status).toBe('draft')
  })
})

describe('GET /api/obituaries — listPublished strips private fields', () => {
  it('omits cause_of_passing from public list', async () => {
    // Simulate supabase returning data with a count
    const chainWithCount = makeChain()
    chainWithCount.range = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'obit-1',
          full_name: 'John Doe',
          status: 'published',
          cause_of_passing: 'Heart disease',
          cause_of_passing_consented: true,
          death_cert_url: 'https://example.com/cert.pdf',
        },
      ],
      count: 1,
      error: null,
    })
    Object.values(chainWithCount).forEach((fn) => {
      if (typeof fn === 'function' && fn !== chainWithCount.range) {
        (fn as jest.Mock).mockReturnValue(chainWithCount)
      }
    })

    const { supabaseAdmin } = jest.requireMock('@/lib/supabaseAdmin')
    supabaseAdmin.from.mockReturnValueOnce(chainWithCount)

    const res = await request(app).get('/api/obituaries')

    expect(res.status).toBe(200)
    expect(res.body.data[0].cause_of_passing).toBeNull()
    expect(res.body.data[0].death_cert_url).toBeNull()
  })
})

describe('PATCH /api/obituaries/:id — update', () => {
  it('updates an obituary successfully', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: 'obit-1', full_name: 'Updated Name' },
      error: null,
    })

    const res = await request(app)
      .patch('/api/obituaries/obit-1')
      .set('Authorization', 'Bearer fake-token')
      .send({ full_name: 'Updated Name' })

    expect(res.status).toBe(200)
    expect(res.body.data).toBeDefined()
  })

  it('returns 404 when obituary not found', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })

    const res = await request(app)
      .patch('/api/obituaries/nonexistent')
      .set('Authorization', 'Bearer fake-token')
      .send({ full_name: 'Ghost' })

    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/obituaries/:id/permanent — permanentDelete', () => {
  it('returns 403 when trying to permanently delete a published obituary', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { id: 'obit-pub', status: 'published' },
      error: null,
    })

    const res = await request(app)
      .delete('/api/obituaries/obit-pub/permanent')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/draft/)
  })
})
