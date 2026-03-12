/**
 * Tests: POST /api/auth/password-reset-confirmation
 */
import request from 'supertest'
import app from '@/app'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import * as emailClient from '@/lib/emailClient'

const mockGetUser = supabaseAdmin.auth.getUser as jest.Mock
const mockSend    = emailClient.sendPasswordResetConfirmation as jest.Mock

const VALID_USER = { id: 'user-123', email: 'user@matieo.com', user_metadata: { role: 'user' } }

function mockAuth() {
  mockGetUser.mockResolvedValueOnce({ data: { user: VALID_USER }, error: null })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockSend.mockResolvedValue(undefined)
})

describe('POST /api/auth/password-reset-confirmation', () => {
  it('returns 200 and calls sendPasswordResetConfirmation with userId', async () => {
    mockAuth()

    const res = await request(app)
      .post('/api/auth/password-reset-confirmation')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data.message).toBe('Confirmation email queued')
    expect(res.body.error).toBeNull()

    // Fire-and-forget — wait a tick for the async call
    await new Promise((r) => setImmediate(r))
    expect(mockSend).toHaveBeenCalledWith(VALID_USER.id)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/auth/password-reset-confirmation')

    expect(res.status).toBe(401)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('returns 401 with invalid token', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Invalid token' } })

    const res = await request(app)
      .post('/api/auth/password-reset-confirmation')
      .set('Authorization', 'Bearer bad-token')

    expect(res.status).toBe(401)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('does not fail the response if sendPasswordResetConfirmation rejects', async () => {
    mockAuth()
    mockSend.mockRejectedValueOnce(new Error('Resend unavailable'))

    const res = await request(app)
      .post('/api/auth/password-reset-confirmation')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
  })
})
