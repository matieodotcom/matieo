import { useAdminWaitlist } from '@/hooks/use-admin'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminWaitlistPage() {
  const { data, isLoading, error } = useAdminWaitlist()

  const items = data?.data.items ?? []
  const total = data?.data.total ?? 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Waitlist</h1>

      {error && <ErrorMessage message="Failed to load waitlist." />}

      <div className="overflow-x-auto rounded-2xl border border-neutral-100 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">Joined</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 3 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded bg-neutral-200 dark:bg-neutral-700" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-neutral-400">No waitlist entries found.</td>
              </tr>
            ) : (
              items.map((w) => (
                <tr key={w.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3 text-neutral-900 dark:text-neutral-100">{w.email}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{w.name ?? '—'}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{formatDate(w.subscribed_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <p className="mt-3 text-sm text-neutral-500">{total} entries total</p>
      )}
    </div>
  )
}
