import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@supabase/supabase-js'

// Mock hooks so we don't need a real API
vi.mock('@/hooks/use-notifications', () => ({
  useNotifications:          vi.fn(),
  useMarkNotificationRead:   vi.fn(),
  useMarkAllRead:            vi.fn(),
  useDeleteNotification:     vi.fn(),
}))

import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
  useDeleteNotification,
} from '@/hooks/use-notifications'

const MOCK_USER = {
  id: 'user-id',
  email: 'user@test.com',
  user_metadata: { full_name: 'Test User' },
} as unknown as User

const READ_NOTIFICATION = {
  id: 'notif-2', user_id: 'user-id', type: 'memorial_published' as const,
  title: 'Memorial published', message: 'Your memorial is live',
  resource_id: 'mem-1', resource_slug: 'john-doe-2024',
  is_read: true, read_at: new Date().toISOString(), created_at: new Date().toISOString(),
}

const UNREAD_NOTIFICATION = {
  id: 'notif-1', user_id: 'user-id', type: 'tribute_posted' as const,
  title: 'New tribute', message: 'Someone left a tribute on John Doe',
  resource_id: 'mem-1', resource_slug: 'john-doe-2024',
  is_read: false, read_at: null, created_at: new Date().toISOString(),
}

const mockMarkRead    = vi.fn()
const mockMarkAll     = vi.fn()
const mockDeleteOne   = vi.fn()

function setupMocks(notifications: typeof UNREAD_NOTIFICATION[]) {
  vi.mocked(useNotifications).mockReturnValue({
    data: { data: notifications, total: notifications.length, page: 1, limit: 20, error: null },
    isSuccess: true,
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useNotifications>)
  vi.mocked(useMarkNotificationRead).mockReturnValue({ mutate: mockMarkRead } as never)
  vi.mocked(useMarkAllRead).mockReturnValue({ mutate: mockMarkAll }          as never)
  vi.mocked(useDeleteNotification).mockReturnValue({ mutate: mockDeleteOne } as never)
}

function renderBell() {
  return renderWithProviders(<NotificationBell />)
}

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: MOCK_USER, session: {} as never, isLoading: false })
  })

  it('renders bell button with accessible label', () => {
    setupMocks([])
    renderBell()
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('shows unread badge when unread > 0', () => {
    setupMocks([UNREAD_NOTIFICATION])
    renderBell()
    // Badge rendered as aria-hidden span — check its text content
    const badge = document.querySelector('[aria-hidden="true"]')
    expect(badge).toBeInTheDocument()
    expect(badge?.textContent).toBe('1')
  })

  it('does not show badge when all notifications are read', () => {
    setupMocks([READ_NOTIFICATION])
    renderBell()
    // No aria-hidden badge span should exist
    const badge = document.querySelector('span[aria-hidden="true"]')
    expect(badge).toBeNull()
  })

  it('opens panel on bell click and shows notification title', async () => {
    const user = userEvent.setup()
    setupMocks([UNREAD_NOTIFICATION])
    renderBell()

    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(screen.getByText('New tribute')).toBeInTheDocument()
  })

  it('shows empty state when no notifications', async () => {
    const user = userEvent.setup()
    setupMocks([])
    renderBell()

    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(screen.getByText('No notifications yet')).toBeInTheDocument()
  })

  it('shows "Mark all as read" button only when unread count > 0', async () => {
    const user = userEvent.setup()
    setupMocks([UNREAD_NOTIFICATION])
    renderBell()

    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(screen.getByText('Mark all as read')).toBeInTheDocument()
  })

  it('does not show "Mark all as read" when all are read', async () => {
    const user = userEvent.setup()
    setupMocks([READ_NOTIFICATION])
    renderBell()

    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(screen.queryByText('Mark all as read')).toBeNull()
  })

  it('calls markAllRead mutate on "Mark all as read" click', async () => {
    const user = userEvent.setup()
    setupMocks([UNREAD_NOTIFICATION])
    renderBell()

    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    await user.click(screen.getByText('Mark all as read'))
    expect(mockMarkAll).toHaveBeenCalledTimes(1)
  })

  it('calls markRead mutate when "Mark as read" item button clicked', async () => {
    const user = userEvent.setup()
    setupMocks([UNREAD_NOTIFICATION])
    renderBell()

    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    await user.click(screen.getByRole('button', { name: 'Mark as read' }))
    expect(mockMarkRead).toHaveBeenCalledWith('notif-1')
  })

  it('calls deleteOne mutate when delete button clicked', async () => {
    const user = userEvent.setup()
    setupMocks([UNREAD_NOTIFICATION])
    renderBell()

    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    await user.click(screen.getByRole('button', { name: 'Delete notification' }))
    expect(mockDeleteOne).toHaveBeenCalledWith('notif-1')
  })

  it('renders null when user is not authenticated', () => {
    useAuthStore.setState({ user: null, session: null, isLoading: false })
    setupMocks([])
    const { container } = renderBell()
    expect(container.firstChild).toBeNull()
  })
})
