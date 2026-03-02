import request from 'supertest'
import app from '@/app'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { cloudinary } from '@/lib/cloudinary'

const mockGetUser = supabaseAdmin.auth.getUser as jest.Mock
const mockSign = cloudinary.utils.api_sign_request as jest.Mock

const VALID_USER = { id: 'test-user-id', email: 'test@matieo.com', user_metadata: { role: 'user' } }

describe('POST /api/cloudinary/sign', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/cloudinary/sign')
    expect(res.status).toBe(401)
  })

  it('returns signed upload params for authenticated user', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: VALID_USER }, error: null })
    mockSign.mockReturnValueOnce('mocked-signature')

    const res = await request(app)
      .post('/api/cloudinary/sign')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.data.signature).toBe('mocked-signature')
    expect(res.body.data.timestamp).toBeDefined()
    expect(res.body.data.folder).toContain('test-user-id')
  })
})
