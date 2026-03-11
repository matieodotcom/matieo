/**
 * Tests: sendObituaryPublished fires on publish
 */
import request from 'supertest'
import app from '@/app'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import * as emailClient from '@/lib/emailClient'

const mockGetUser = supabaseAdmin.auth.getUser as jest.Mock
const mockFrom    = supabaseAdmin.from as jest.Mock
const mockSend    = emailClient.sendObituaryPublished as jest.Mock

const VALID_USER = { id: 'creator-id', email: 'creator@matieo.com', user_metadata: { role: 'user' } }

function mockAuth() {
  mockGetUser.mockResolvedValueOnce({ data: { user: VALID_USER }, error: null })
}

function mockPublishDB(overrides = {}) {
  const obituary = {
    id: 'obit-1',
    created_by: VALID_USER.id,
    full_name: 'Jane Smith',
    slug: 'jane-smith-2024',
    status: 'published',
    ...overrides,
  }
  mockFrom.mockReturnValueOnce({
    update:      jest.fn().mockReturnThis(),
    eq:          jest.fn().mockReturnThis(),
    is:          jest.fn().mockReturnThis(),
    select:      jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValueOnce({ data: obituary, error: null }),
  })
  return obituary
}

describe('POST /api/obituaries/:id/publish — email', () => {
  beforeEach(() => {
    mockSend.mockClear()
  })

  it('calls sendObituaryPublished with correct args after publishing', async () => {
    mockAuth()
    const obituary = mockPublishDB()

    const res = await request(app)
      .post(`/api/obituaries/${obituary.id}/publish`)
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(
      obituary.created_by,
      obituary.full_name,
      obituary.slug,
    )
  })

  it('does not call sendObituaryPublished when obituary is not found', async () => {
    mockAuth()
    mockFrom.mockReturnValueOnce({
      update:      jest.fn().mockReturnThis(),
      eq:          jest.fn().mockReturnThis(),
      is:          jest.fn().mockReturnThis(),
      select:      jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValueOnce({ data: null, error: null }),
    })

    const res = await request(app)
      .post('/api/obituaries/nonexistent/publish')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(404)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('does not call sendObituaryPublished without auth token', async () => {
    const res = await request(app).post('/api/obituaries/obit-1/publish')
    expect(res.status).toBe(401)
    expect(mockSend).not.toHaveBeenCalled()
  })
})
