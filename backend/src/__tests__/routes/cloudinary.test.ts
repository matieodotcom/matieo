import request from 'supertest'
import app from '@/app'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { cloudinary } from '@/lib/cloudinary'

const mockGetUser = supabaseAdmin.auth.getUser as jest.Mock
const mockSign = cloudinary.utils.api_sign_request as jest.Mock
const mockDestroy = cloudinary.uploader.destroy as jest.Mock

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

describe('DELETE /api/cloudinary/asset', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .delete('/api/cloudinary/asset')
      .send({ public_id: 'matieo/user1/abc123' })
    expect(res.status).toBe(401)
  })

  it('returns 400 when public_id is missing', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: VALID_USER }, error: null })

    const res = await request(app)
      .delete('/api/cloudinary/asset')
      .set('Authorization', 'Bearer valid-token')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('public_id is required')
  })

  it('calls cloudinary.uploader.destroy and returns deleted: true', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: VALID_USER }, error: null })
    mockDestroy.mockResolvedValueOnce({ result: 'ok' })

    const res = await request(app)
      .delete('/api/cloudinary/asset')
      .set('Authorization', 'Bearer valid-token')
      .send({ public_id: 'matieo/test-user-id/abc123' })

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual({ deleted: true })
    expect(res.body.error).toBeNull()
    expect(mockDestroy).toHaveBeenCalledWith('matieo/test-user-id/abc123')
  })
})
