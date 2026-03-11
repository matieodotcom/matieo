/**
 * Tests: createNotification fires on tribute/condolence/memorial/obituary events
 * Verifies the self-notify guard (owner posting on own page → no notification)
 */
import request from 'supertest'
import app from '@/app'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import * as notificationsClient from '@/lib/notificationsClient'

const mockGetUser  = supabaseAdmin.auth.getUser as jest.Mock
const mockFrom     = supabaseAdmin.from as jest.Mock
const mockCreateNotification = notificationsClient.createNotification as jest.Mock

const AUTHOR     = { id: 'author-id',  email: 'author@test.com',  user_metadata: { role: 'user', full_name: 'Author Name' } }
const PAGE_OWNER = { id: 'owner-id',   email: 'owner@test.com',   user_metadata: { role: 'user', full_name: 'Owner Name'  } }

function mockAuth(user = AUTHOR) {
  mockGetUser.mockResolvedValueOnce({ data: { user }, error: null })
}

function mockTributeInsert(memorialCreatedBy: string) {
  // 1st from: insert tribute
  mockFrom.mockReturnValueOnce({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValueOnce({
      data: {
        id: 'tribute-1', memorial_id: 'mem-1',
        user_id: AUTHOR.id, author_name: 'Author Name', message: 'Hello',
        created_at: new Date().toISOString(),
      },
      error: null,
    }),
  })
  // 2nd from: IIFE memorial fetch
  mockFrom.mockReturnValueOnce({
    select: jest.fn().mockReturnThis(),
    eq:     jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValueOnce({
      data: { created_by: memorialCreatedBy, full_name: 'John Doe', slug: 'john-doe-2024' },
      error: null,
    }),
  })
}

function mockCondolenceInsert(obituaryCreatedBy: string) {
  // 1st from: insert condolence
  mockFrom.mockReturnValueOnce({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValueOnce({
      data: {
        id: 'condolence-1', obituary_id: 'obit-1',
        user_id: AUTHOR.id, author_name: 'Author Name', message: 'Condolences',
        created_at: new Date().toISOString(),
      },
      error: null,
    }),
  })
  // 2nd from: IIFE obituary fetch
  mockFrom.mockReturnValueOnce({
    select: jest.fn().mockReturnThis(),
    eq:     jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValueOnce({
      data: { created_by: obituaryCreatedBy, full_name: 'Jane Doe', slug: 'jane-doe-2024' },
      error: null,
    }),
  })
}

function mockPublishMemorial() {
  mockFrom.mockReturnValueOnce({
    update: jest.fn().mockReturnThis(),
    eq:     jest.fn().mockReturnThis(),
    is:     jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValueOnce({
      data: {
        id: 'mem-1', created_by: PAGE_OWNER.id,
        full_name: 'John Doe', slug: 'john-doe-2024', status: 'published',
      },
      error: null,
    }),
  })
}

function mockPublishObituary() {
  mockFrom.mockReturnValueOnce({
    update: jest.fn().mockReturnThis(),
    eq:     jest.fn().mockReturnThis(),
    is:     jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValueOnce({
      data: {
        id: 'obit-1', created_by: PAGE_OWNER.id,
        full_name: 'Jane Doe', slug: 'jane-doe-2024', status: 'published',
      },
      error: null,
    }),
  })
}

describe('Notifications — insert on events', () => {
  beforeEach(() => {
    mockCreateNotification.mockClear()
  })

  // ── Tributes ────────────────────────────────────────────────────────────────

  it('creates notification when AUTHOR posts tribute on PAGE_OWNER memorial', async () => {
    mockAuth(AUTHOR)
    mockTributeInsert(PAGE_OWNER.id)

    const res = await request(app)
      .post('/api/memorials/mem-1/tributes')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: 'Hello' })

    expect(res.status).toBe(201)
    await new Promise((r) => setImmediate(r))

    expect(mockCreateNotification).toHaveBeenCalledTimes(1)
    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId:       PAGE_OWNER.id,
        type:         'tribute_posted',
        resourceSlug: 'john-doe-2024',
      }),
    )
  })

  it('does NOT create notification when PAGE_OWNER posts tribute on own memorial (self-notify guard)', async () => {
    mockAuth(PAGE_OWNER)
    mockTributeInsert(PAGE_OWNER.id)

    const res = await request(app)
      .post('/api/memorials/mem-1/tributes')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: 'My own tribute' })

    expect(res.status).toBe(201)
    await new Promise((r) => setImmediate(r))

    expect(mockCreateNotification).not.toHaveBeenCalled()
  })

  // ── Condolences ─────────────────────────────────────────────────────────────

  it('creates notification when AUTHOR posts condolence on PAGE_OWNER obituary', async () => {
    mockAuth(AUTHOR)
    mockCondolenceInsert(PAGE_OWNER.id)

    const res = await request(app)
      .post('/api/obituaries/obit-1/condolences')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: 'Condolences' })

    expect(res.status).toBe(201)
    await new Promise((r) => setImmediate(r))

    expect(mockCreateNotification).toHaveBeenCalledTimes(1)
    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: PAGE_OWNER.id,
        type:   'condolence_posted',
        resourceSlug: 'jane-doe-2024',
      }),
    )
  })

  it('does NOT create notification when PAGE_OWNER posts condolence on own obituary', async () => {
    mockAuth(PAGE_OWNER)
    mockCondolenceInsert(PAGE_OWNER.id)

    const res = await request(app)
      .post('/api/obituaries/obit-1/condolences')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: 'Own condolence' })

    expect(res.status).toBe(201)
    await new Promise((r) => setImmediate(r))

    expect(mockCreateNotification).not.toHaveBeenCalled()
  })

  // ── Memorial publish ─────────────────────────────────────────────────────────

  it('creates notification when memorial is published', async () => {
    mockAuth(PAGE_OWNER)
    mockPublishMemorial()

    const res = await request(app)
      .post('/api/memorials/mem-1/publish')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    await new Promise((r) => setImmediate(r))

    expect(mockCreateNotification).toHaveBeenCalledTimes(1)
    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: PAGE_OWNER.id,
        type:   'memorial_published',
      }),
    )
  })

  // ── Obituary publish ─────────────────────────────────────────────────────────

  it('creates notification when obituary is published', async () => {
    mockAuth(PAGE_OWNER)
    mockPublishObituary()

    const res = await request(app)
      .post('/api/obituaries/obit-1/publish')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    await new Promise((r) => setImmediate(r))

    expect(mockCreateNotification).toHaveBeenCalledTimes(1)
    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: PAGE_OWNER.id,
        type:   'obituary_published',
      }),
    )
  })
})
