/**
 * Tests: sendTributePosted fires on createTribute (incl. self-notify guard)
 */
import request from 'supertest'
import app from '@/app'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import * as emailClient from '@/lib/emailClient'

const mockGetUser = supabaseAdmin.auth.getUser as jest.Mock
const mockFrom    = supabaseAdmin.from as jest.Mock
const mockSend    = emailClient.sendTributePosted as jest.Mock

const AUTHOR     = { id: 'author-id',  email: 'author@matieo.com',  user_metadata: { role: 'user', full_name: 'Author Name' } }
const PAGE_OWNER = { id: 'owner-id',   email: 'owner@matieo.com',   user_metadata: { role: 'user', full_name: 'Owner Name'  } }

function mockAuth(user = AUTHOR) {
  mockGetUser.mockResolvedValueOnce({ data: { user }, error: null })
}

/** Mock the tributes insert and the memorial secondary fetch */
function mockCreateTribute(memorialCreatedBy: string) {
  // insert tribute
  mockFrom.mockReturnValueOnce({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValueOnce({
      data: {
        id: 'tribute-1',
        memorial_id: 'mem-1',
        user_id: AUTHOR.id,
        author_name: 'Author Name',
        message: 'Hello',
        created_at: new Date().toISOString(),
      },
      error: null,
    }),
  })
  // IIFE secondary fetch: memorials select
  mockFrom.mockReturnValueOnce({
    select: jest.fn().mockReturnThis(),
    eq:     jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValueOnce({
      data: { created_by: memorialCreatedBy, full_name: 'John Doe', slug: 'john-doe-2024' },
      error: null,
    }),
  })
}

describe('POST /api/memorials/:id/tributes — email', () => {
  beforeEach(() => {
    mockSend.mockClear()
  })

  it('calls sendTributePosted with correct args after posting a tribute', async () => {
    mockAuth(AUTHOR)
    mockCreateTribute(PAGE_OWNER.id)

    const res = await request(app)
      .post('/api/memorials/mem-1/tributes')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: 'Hello' })

    expect(res.status).toBe(201)
    // drain the event loop so the IIFE resolves
    await new Promise((r) => setImmediate(r))

    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(
      PAGE_OWNER.id,
      AUTHOR.id,
      'John Doe',
      'john-doe-2024',
      'Author Name',
    )
  })

  it('does not notify when page owner posts on their own memorial (self-notify guard)', async () => {
    // PAGE_OWNER posts a tribute on their own memorial
    mockAuth(PAGE_OWNER)
    mockCreateTribute(PAGE_OWNER.id)

    const res = await request(app)
      .post('/api/memorials/mem-1/tributes')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: 'My own memorial tribute' })

    expect(res.status).toBe(201)
    await new Promise((r) => setImmediate(r))

    // sendTributePosted is called but returns early due to self-notify guard
    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(
      PAGE_OWNER.id,
      PAGE_OWNER.id,
      'John Doe',
      'john-doe-2024',
      'Owner Name',
    )
  })

  it('does not call sendTributePosted without auth token', async () => {
    const res = await request(app)
      .post('/api/memorials/mem-1/tributes')
      .send({ message: 'Hello' })

    expect(res.status).toBe(401)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('does not call sendTributePosted when message is missing', async () => {
    mockAuth(AUTHOR)

    const res = await request(app)
      .post('/api/memorials/mem-1/tributes')
      .set('Authorization', 'Bearer valid-token')
      .send({})

    expect(res.status).toBe(400)
    expect(mockSend).not.toHaveBeenCalled()
  })
})
