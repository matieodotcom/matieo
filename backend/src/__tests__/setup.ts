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
  getMortalityPrediction: jest.fn(),
  analyzeMemorialBiography: jest.fn(),
  isMLServiceHealthy: jest.fn(),
}))

jest.mock('@/lib/notificationsClient', () => ({
  NOTIFICATION_TYPES: {
    TRIBUTE_POSTED:     'tribute_posted',
    CONDOLENCE_POSTED:  'condolence_posted',
    MEMORIAL_PUBLISHED: 'memorial_published',
    OBITUARY_PUBLISHED: 'obituary_published',
  },
  createNotification: jest.fn().mockImplementation(() => Promise.resolve()),
}))

jest.mock('@/lib/emailClient', () => ({
  resend: {},
  sendWaitlistConfirmation:       jest.fn().mockImplementation(() => Promise.resolve()),
  sendPasswordResetConfirmation:  jest.fn().mockImplementation(() => Promise.resolve()),
  sendMemorialPublished:          jest.fn().mockImplementation(() => Promise.resolve()),
  sendObituaryPublished:          jest.fn().mockImplementation(() => Promise.resolve()),
  sendTributePosted:              jest.fn().mockImplementation(() => Promise.resolve()),
  sendCondolencePosted:           jest.fn().mockImplementation(() => Promise.resolve()),
}))
