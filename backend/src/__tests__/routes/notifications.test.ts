/**
 * Tests: GET/PATCH/DELETE /api/notifications routes
 */
import request from 'supertest'
import app from '@/app'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const mockGetUser = supabaseAdmin.auth.getUser as jest.Mock
const mockFrom    = supabaseAdmin.from as jest.Mock

const USER = { id: 'user-id', email: 'user@matieo.com', user_metadata: { role: 'user', full_name: 'Test User' } }

const SAMPLE_NOTIFICATION = {
  id:            'notif-1',
  user_id:       USER.id,
  type:          'tribute_posted',
  title:         'New tribute',
  message:       'Someone left a tribute',
  resource_id:   'mem-1',
  resource_slug: 'john-doe-2024',
  is_read:       false,
  read_at:       null,
  created_at:    new Date().toISOString(),
}

function mockAuth(user = USER) {
  mockGetUser.mockResolvedValueOnce({ data: { user }, error: null })
}

describe('GET /api/notifications', () => {
  beforeEach(() => { mockFrom.mockClear() })

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/notifications')
    expect(res.status).toBe(401)
  })

  it('returns paginated list for authenticated user', async () => {
    mockAuth()
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq:     jest.fn().mockReturnThis(),
      order:  jest.fn().mockReturnThis(),
      range:  jest.fn().mockResolvedValueOnce({ data: [SAMPLE_NOTIFICATION], error: null, count: 1 }),
    })

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].id).toBe('notif-1')
    expect(res.body.total).toBe(1)
    expect(res.body.error).toBeNull()
  })

  it('returns empty list when no notifications', async () => {
    mockAuth()
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq:     jest.fn().mockReturnThis(),
      order:  jest.fn().mockReturnThis(),
      range:  jest.fn().mockResolvedValueOnce({ data: [], error: null, count: 0 }),
    })

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(0)
    expect(res.body.total).toBe(0)
  })
})

describe('PATCH /api/notifications/:id/read', () => {
  beforeEach(() => { mockFrom.mockClear() })

  it('returns 401 without auth', async () => {
    const res = await request(app).patch('/api/notifications/notif-1/read')
    expect(res.status).toBe(401)
  })

  it('marks a notification as read', async () => {
    mockAuth()
    mockFrom.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValueOnce({ error: null }),
        }),
      }),
    })

    const res = await request(app)
      .patch('/api/notifications/notif-1/read')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('notif-1')
    expect(res.body.error).toBeNull()
  })
})

describe('PATCH /api/notifications/read-all', () => {
  beforeEach(() => { mockFrom.mockClear() })

  it('returns 401 without auth', async () => {
    const res = await request(app).patch('/api/notifications/read-all')
    expect(res.status).toBe(401)
  })

  it('marks all notifications as read', async () => {
    mockAuth()
    mockFrom.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValueOnce({ error: null }),
        }),
      }),
    })

    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data.updated).toBe(true)
    expect(res.body.error).toBeNull()
  })
})

describe('DELETE /api/notifications/:id', () => {
  beforeEach(() => { mockFrom.mockClear() })

  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/notifications/notif-1')
    expect(res.status).toBe(401)
  })

  it('deletes a notification', async () => {
    mockAuth()
    mockFrom.mockReturnValueOnce({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValueOnce({ error: null }),
        }),
      }),
    })

    const res = await request(app)
      .delete('/api/notifications/notif-1')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('notif-1')
    expect(res.body.error).toBeNull()
  })
})
