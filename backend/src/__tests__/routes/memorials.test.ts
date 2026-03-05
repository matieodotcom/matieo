import request from 'supertest'
import app from '@/app'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { cloudinary } from '@/lib/cloudinary'
import { mockMemorial } from '@/__tests__/utils'

const mockGetUser = supabaseAdmin.auth.getUser as jest.Mock
const mockFrom = supabaseAdmin.from as jest.Mock
const mockDestroy = cloudinary.uploader.destroy as jest.Mock

const VALID_USER = { id: 'test-user-id', email: 'test@matieo.com', user_metadata: { role: 'user' } }

function mockAuth() {
  mockGetUser.mockResolvedValueOnce({ data: { user: VALID_USER }, error: null })
}

describe('GET /api/memorials', () => {
  it('returns list of published memorials without auth', async () => {
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValueOnce({
        data: [mockMemorial({ status: 'published' })],
        error: null,
        count: 1,
      }),
    })

    const res = await request(app).get('/api/memorials')

    expect(res.status).toBe(200)
    expect(res.body.data[0].full_name).toBe('John Doe')
  })

  it('returns total, page, and limit in response', async () => {
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValueOnce({
        data: [mockMemorial({ status: 'published' })],
        error: null,
        count: 5,
      }),
    })

    const res = await request(app).get('/api/memorials')

    expect(res.status).toBe(200)
    expect(res.body.total).toBe(5)
    expect(res.body.page).toBe(1)
    expect(res.body.limit).toBe(12)
  })

  it('filters by search query using ilike on full_name', async () => {
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockResolvedValueOnce({
        data: [mockMemorial({ status: 'published' })],
        error: null,
        count: 1,
      }),
    })

    const res = await request(app).get('/api/memorials?q=john')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
  })

  it('returns correct slice for page 2', async () => {
    const m1 = mockMemorial({ id: 'id-1', full_name: 'Memorial Two', status: 'published' })
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValueOnce({ data: [m1], error: null, count: 3 }),
    })

    const res = await request(app).get('/api/memorials?page=2&limit=2')

    expect(res.status).toBe(200)
    expect(res.body.page).toBe(2)
    expect(res.body.limit).toBe(2)
    expect(res.body.total).toBe(3)
  })
})

describe('GET /api/memorials/mine', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/memorials/mine')
    expect(res.status).toBe(401)
  })

  it('returns only the authenticated user\'s memorials', async () => {
    mockAuth()
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValueOnce({
        data: [mockMemorial({ status: 'draft' }), mockMemorial({ id: 'id-2', status: 'published' })],
        error: null,
        count: 2,
      }),
    })

    const res = await request(app)
      .get('/api/memorials/mine')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.total).toBe(2)
  })

  it('supports search query param', async () => {
    mockAuth()
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockResolvedValueOnce({
        data: [mockMemorial()],
        error: null,
        count: 1,
      }),
    })

    const res = await request(app)
      .get('/api/memorials/mine?q=john')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
  })
})

describe('POST /api/memorials', () => {
  it('creates a memorial and returns 201', async () => {
    mockAuth()
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
      single: jest.fn().mockResolvedValueOnce({ data: mockMemorial(), error: null }),
    })

    const res = await request(app)
      .post('/api/memorials')
      .set('Authorization', 'Bearer valid-token')
      .send({ full_name: 'John Doe', date_of_death: '2024-01-10' })

    expect(res.status).toBe(201)
    expect(res.body.data.full_name).toBe('John Doe')
  })

  it('returns 400 when full_name is missing', async () => {
    mockAuth()
    const res = await request(app)
      .post('/api/memorials')
      .set('Authorization', 'Bearer valid-token')
      .send({})
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/full_name/)
  })
})

describe('GET /api/memorials/:id', () => {
  it('returns 404 when memorial not found', async () => {
    mockAuth()
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValueOnce({ data: null, error: null }),
    })

    const res = await request(app)
      .get('/api/memorials/nonexistent-id')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(404)
  })

  it('returns memorial when found', async () => {
    mockAuth()
    const memorial = mockMemorial()
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValueOnce({ data: memorial, error: null }),
    })

    const res = await request(app)
      .get(`/api/memorials/${memorial.id}`)
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(memorial.id)
  })
})

describe('POST /api/memorials/:id/publish', () => {
  it('publishes a memorial', async () => {
    mockAuth()
    const published = mockMemorial({ status: 'published' })
    mockFrom.mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValueOnce({ data: published, error: null }),
    })

    const res = await request(app)
      .post(`/api/memorials/${published.id}/publish`)
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('published')
  })
})

describe('DELETE /api/memorials/:id', () => {
  it('soft deletes a memorial', async () => {
    mockAuth()
    mockFrom.mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValueOnce({ data: { id: 'memorial-id-123' }, error: null }),
    })

    const res = await request(app)
      .delete('/api/memorials/memorial-id-123')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('memorial-id-123')
  })
})

describe('DELETE /api/memorials/:id/permanent', () => {
  const draftMemorial = {
    id: 'memorial-id-123',
    status: 'draft',
    cover_cloudinary_public_id: 'cover-id',
    profile_cloudinary_public_id: 'profile-id',
  }

  function mockFetchMemorial(data: object | null, error: object | null = null) {
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValueOnce({ data, error }),
    })
  }

  function mockFetchPhotos(photos: object[]) {
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValueOnce({ data: photos, error: null }),
    })
  }

  function mockHardDelete() {
    const innerEq = jest.fn().mockResolvedValueOnce({ error: null })
    mockFrom.mockReturnValueOnce({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnValue({ eq: innerEq }),
    })
  }

  it('returns 401 without auth token', async () => {
    const res = await request(app).delete('/api/memorials/memorial-id-123/permanent')
    expect(res.status).toBe(401)
  })

  it('returns 404 when memorial not found', async () => {
    mockAuth()
    mockFetchMemorial(null)

    const res = await request(app)
      .delete('/api/memorials/nonexistent/permanent')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(404)
    expect(res.body.error).toMatch(/not found/i)
  })

  it('returns 403 when memorial is published', async () => {
    mockAuth()
    mockFetchMemorial({ ...draftMemorial, status: 'published' })

    const res = await request(app)
      .delete('/api/memorials/memorial-id-123/permanent')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/only draft/i)
  })

  it('calls cloudinary.uploader.destroy for cover, profile, and gallery photos', async () => {
    mockAuth()
    mockFetchMemorial(draftMemorial)
    mockFetchPhotos([{ cloudinary_public_id: 'gallery-id-1' }])
    mockHardDelete()
    mockDestroy.mockResolvedValue({ result: 'ok' })

    await request(app)
      .delete('/api/memorials/memorial-id-123/permanent')
      .set('Authorization', 'Bearer valid-token')

    expect(mockDestroy).toHaveBeenCalledWith('cover-id')
    expect(mockDestroy).toHaveBeenCalledWith('profile-id')
    expect(mockDestroy).toHaveBeenCalledWith('gallery-id-1')
  })

  it('hard-deletes the memorial and returns 200 with id', async () => {
    mockAuth()
    mockFetchMemorial(draftMemorial)
    mockFetchPhotos([])
    mockHardDelete()
    mockDestroy.mockResolvedValue({ result: 'ok' })

    const res = await request(app)
      .delete('/api/memorials/memorial-id-123/permanent')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('memorial-id-123')
  })

  it('proceeds with DB delete even if Cloudinary destroy rejects', async () => {
    mockAuth()
    mockFetchMemorial(draftMemorial)
    mockFetchPhotos([])
    mockHardDelete()
    mockDestroy.mockRejectedValue(new Error('Cloudinary down'))

    const res = await request(app)
      .delete('/api/memorials/memorial-id-123/permanent')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('memorial-id-123')
  })
})
