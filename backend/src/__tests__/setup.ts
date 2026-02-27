/**
 * Backend global test setup — mocks all external services.
 * Tests are written per-feature as each route/controller/middleware is built.
 */
import { jest } from '@jest/globals'

jest.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
  },
}))

jest.mock('@/lib/cloudinary', () => ({
  cloudinary: {
    uploader: { upload: jest.fn(), destroy: jest.fn() },
    utils: { api_sign_request: jest.fn() },
  },
}))

jest.mock('@/lib/mlClient', () => ({
  getMortalityPrediction: jest.fn().mockResolvedValue(null),
  analyzeMemorialBiography: jest.fn().mockResolvedValue({
    themes: [], sentiment: 'unknown', sentiment_score: 0, key_phrases: [], suggested_tags: [],
  }),
  isMLServiceHealthy: jest.fn().mockResolvedValue(false),
}))
