import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import * as Dialog from '@radix-ui/react-dialog'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
  useDeleteNotification,
} from '@/hooks/use-notifications'
import type { NotificationRow } from '@/types/notification'

export function NotificationBell() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const userId = user?.id ?? null

  const { data } = useNotifications(userId)
  const { mutate: markRead }  = useMarkNotificationRead(userId)
  const { mutate: markAllRead } = useMarkAllRead(userId)
  const { mutate: deleteOne } = useDeleteNotification(userId)

  const notifications = data?.data ?? []
  const unreadCount   = notifications.filter((n) => !n.is_read).length

  if (!userId) return null

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* Bell trigger */}
      <Dialog.Trigger asChild>
        <button
          aria-label={t('notifications.heading')}
          className="relative rounded-full p-1.5 text-neutral-500 hover:text-neutral-700
            hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors
            focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center
                justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className="fixed inset-0 z-40 bg-black/30
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />

        {/* Slide-in panel from right */}
        <Dialog.Content
          className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white dark:bg-neutral-900
            shadow-2xl flex flex-col
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right
            duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <Dialog.Title className="text-base font-semibold text-neutral-900 dark:text-white">
              {t('notifications.heading')}
            </Dialog.Title>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="text-xs text-brand-primary hover:underline"
                >
                  {t('notifications.markAllRead')}
                </button>
              )}
              <Dialog.Close asChild>
                <button
                  aria-label={t('common.close')}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                >
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Notification list */}
          <ul className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
            {notifications.length === 0 ? (
              <li className="flex flex-col items-center justify-center h-full py-20 text-sm text-neutral-400">
                <Bell size={32} className="mb-3 opacity-20" />
                {t('notifications.empty')}
              </li>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={() => markRead(n.id)}
                  onDelete={() => deleteOne(n.id)}
                  onNavigate={() => setOpen(false)}
                />
              ))
            )}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function NotificationItem({
  notification: n,
  onMarkRead,
  onDelete,
  onNavigate,
}: {
  notification: NotificationRow
  onMarkRead:   () => void
  onDelete:     () => void
  onNavigate:   () => void
}) {
  const { t } = useTranslation()
  const href = n.resource_slug ? getHref(n.type, n.resource_slug) : null

  return (
    <li className={`flex gap-3 px-5 py-4 ${n.is_read ? '' : 'bg-blue-50/60 dark:bg-blue-950/20'}`}>
      {/* Unread dot */}
      <div className="mt-1.5 flex-shrink-0 w-2">
        {!n.is_read && (
          <span className="block w-2 h-2 rounded-full bg-brand-primary" aria-hidden="true" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {href ? (
          <Link
            to={href}
            className="text-sm font-medium text-neutral-900 dark:text-white hover:underline line-clamp-1"
            onClick={() => { if (!n.is_read) onMarkRead(); onNavigate() }}
          >
            {n.title}
          </Link>
        ) : (
          <p className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-1">{n.title}</p>
        )}
        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{n.message}</p>
        <p className="text-[10px] text-neutral-400 mt-1">{formatDate(n.created_at)}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {!n.is_read && (
          <button
            onClick={onMarkRead}
            aria-label={t('notifications.markRead')}
            className="text-[10px] text-brand-primary hover:underline whitespace-nowrap"
          >
            {t('notifications.markRead')}
          </button>
        )}
        <button
          onClick={onDelete}
          aria-label={t('notifications.delete')}
          className="text-neutral-300 hover:text-red-500 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </li>
  )
}

function getHref(type: NotificationRow['type'], slug: string): string {
  if (type === 'tribute_posted' || type === 'memorial_published') return `/memorial/${slug}`
  if (type === 'condolence_posted' || type === 'obituary_published') return `/obituary/${slug}`
  return '#'
}

function formatDate(iso: string): string {
  const d       = new Date(iso)
  const now     = new Date()
  const diffMins = Math.floor((now.getTime() - d.getTime()) / 60_000)
  if (diffMins < 1)  return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return d.toLocaleDateString()
}
