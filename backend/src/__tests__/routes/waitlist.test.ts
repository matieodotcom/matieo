import request from 'supertest'
import app from '@/app'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendWaitlistConfirmation } from '@/lib/emailClient'

const mockFrom = supabaseAdmin.from as jest.Mock
const mockSendEmail = sendWaitlistConfirmation as jest.Mock

function mockInsertSuccess() {
  mockFrom.mockReturnValueOnce({
    insert: jest.fn().mockResolvedValueOnce({ error: null }),
  })
}

function mockInsertDuplicate() {
  mockFrom.mockReturnValueOnce({
    insert: jest.fn().mockResolvedValueOnce({
      error: { code: '23505', message: 'duplicate key value' },
    }),
  })
}

function mockInsertDbError() {
  mockFrom.mockReturnValueOnce({
    insert: jest.fn().mockResolvedValueOnce({
      error: { code: 'PGRST000', message: 'DB error' },
    }),
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockSendEmail.mockResolvedValue(undefined)
})

describe('POST /api/waitlist', () => {
  it('returns 201 and calls sendWaitlistConfirmation on valid body', async () => {
    mockInsertSuccess()

    const res = await request(app)
      .post('/api/waitlist')
      .send({ name: 'Jane Doe', email: 'jane@example.com' })

    expect(res.status).toBe(201)
    expect(res.body.data.message).toBe('Subscribed')
    expect(res.body.error).toBeNull()

    // Fire-and-forget — wait a tick for the async call
    await new Promise((r) => setImmediate(r))
    expect(mockSendEmail).toHaveBeenCalledWith('Jane Doe', 'jane@example.com')
  })

  it('returns 409 when email is already subscribed', async () => {
    mockInsertDuplicate()

    const res = await request(app)
      .post('/api/waitlist')
      .send({ name: 'Jane Doe', email: 'jane@example.com' })

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('Already subscribed')
    expect(res.body.data).toBeNull()
  })

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/waitlist')
      .send({ name: 'Jane Doe' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBeTruthy()
    expect(res.body.data).toBeNull()
  })

  it('returns 400 when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/waitlist')
      .send({ name: 'Jane Doe', email: 'not-an-email' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/invalid email/i)
  })

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/waitlist')
      .send({ email: 'jane@example.com' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBeTruthy()
  })

  it('returns 400 when name is empty string', async () => {
    const res = await request(app)
      .post('/api/waitlist')
      .send({ name: '', email: 'jane@example.com' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBeTruthy()
  })

  it('calls next(err) on unexpected DB error', async () => {
    mockInsertDbError()

    const res = await request(app)
      .post('/api/waitlist')
      .send({ name: 'Jane Doe', email: 'jane@example.com' })

    expect(res.status).toBe(500)
  })
})
