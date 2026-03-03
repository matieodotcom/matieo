/**
 * Backend shared mock factories.
 * Add factories here as DB models are built.
 */

export function mockMemorial(overrides = {}) {
  return {
    id: 'memorial-id-123',
    created_by: 'test-user-id',
    full_name: 'John Doe',
    date_of_birth: '1945-03-15',
    date_of_death: '2024-01-10',
    age_at_death: 78,
    gender: 'male',
    race_ethnicity: 'Caucasian',
    status: 'draft',
    slug: 'john-doe-2024',
    location: null,
    cover_url: null,
    biography: null,
    tribute_message: null,
    deleted_at: null,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    ...overrides,
  }
}

export function mockProfile(overrides = {}) {
  return {
    id: 'test-user-id',
    full_name: 'Test User',
    email: 'test@matieo.com',
    avatar_url: null,
    role: 'user',
    dark_mode: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}
