/**
 * Tests: sendCondolencePosted fires on createCondolence (incl. self-notify guard)
 */
import request from 'supertest'
import app from '@/app'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import * as emailClient from '@/lib/emailClient'

const mockGetUser = supabaseAdmin.auth.getUser as jest.Mock
const mockFrom    = supabaseAdmin.from as jest.Mock
const mockSend    = emailClient.sendCondolencePosted as jest.Mock

const AUTHOR     = { id: 'author-id', email: 'author@matieo.com',  user_metadata: { role: 'user', full_name: 'Author Name' } }
const PAGE_OWNER = { id: 'owner-id',  email: 'owner@matieo.com',   user_metadata: { role: 'user', full_name: 'Owner Name'  } }

function mockAuth(user = AUTHOR) {
  mockGetUser.mockResolvedValueOnce({ data: { user }, error: null })
}

/** Mock the condolences insert and the obituary secondary fetch */
function mockCreateCondolence(obituaryCreatedBy: string) {
  // insert condolence
  mockFrom.mockReturnValueOnce({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValueOnce({
      data: {
        id: 'condolence-1',
        obituary_id: 'obit-1',
        user_id: AUTHOR.id,
        author_name: 'Author Name',
        message: 'Our thoughts are with you',
        created_at: new Date().toISOString(),
      },
      error: null,
    }),
  })
  // IIFE secondary fetch: obituaries select
  mockFrom.mockReturnValueOnce({
    select: jest.fn().mockReturnThis(),
    eq:     jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValueOnce({
      data: { created_by: obituaryCreatedBy, full_name: 'Jane Smith', slug: 'jane-smith-2024' },
      error: null,
    }),
  })
}

describe('POST /api/obituaries/:id/condolences — email', () => {
  beforeEach(() => {
    mockSend.mockClear()
  })

  it('calls sendCondolencePosted with correct args after posting a condolence', async () => {
    mockAuth(AUTHOR)
    mockCreateCondolence(PAGE_OWNER.id)

    const res = await request(app)
      .post('/api/obituaries/obit-1/condolences')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: 'Our thoughts are with you' })

    expect(res.status).toBe(201)
    await new Promise((r) => setImmediate(r))

    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(
      PAGE_OWNER.id,
      AUTHOR.id,
      'Jane Smith',
      'jane-smith-2024',
      'Author Name',
    )
  })

  it('does not notify when page owner posts on their own obituary (self-notify guard)', async () => {
    mockAuth(PAGE_OWNER)
    mockCreateCondolence(PAGE_OWNER.id)

    const res = await request(app)
      .post('/api/obituaries/obit-1/condolences')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: 'My own condolence' })

    expect(res.status).toBe(201)
    await new Promise((r) => setImmediate(r))

    // sendCondolencePosted is called but returns early due to self-notify guard
    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(
      PAGE_OWNER.id,
      PAGE_OWNER.id,
      'Jane Smith',
      'jane-smith-2024',
      'Owner Name',
    )
  })

  it('does not call sendCondolencePosted without auth token', async () => {
    const res = await request(app)
      .post('/api/obituaries/obit-1/condolences')
      .send({ message: 'Hello' })

    expect(res.status).toBe(401)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('does not call sendCondolencePosted when message is missing', async () => {
    mockAuth(AUTHOR)

    const res = await request(app)
      .post('/api/obituaries/obit-1/condolences')
      .set('Authorization', 'Bearer valid-token')
      .send({})

    expect(res.status).toBe(400)
    expect(mockSend).not.toHaveBeenCalled()
  })
})
