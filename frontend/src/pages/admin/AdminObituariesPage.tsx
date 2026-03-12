import { useState } from 'react'
import { useAdminObituaries, useAdminSetObituaryStatus, useAdminDeleteObituary } from '@/hooks/use-admin'
import { Badge } from '@/components/ui/Badge'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/AlertDialog'
import { Trash2 } from 'lucide-react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const LIMIT = 20

export default function AdminObituariesPage() {
  const [page, setPage] = useState(1)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const { data, isLoading, error } = useAdminObituaries({ page })
  const { mutate: setStatus } = useAdminSetObituaryStatus()
  const { mutate: deleteObituary } = useAdminDeleteObituary()

  const items = data?.data.items ?? []
  const total = data?.data.total ?? 0
  const pages = Math.ceil(total / LIMIT)

  const toggleStatus = (id: string, current: string) => {
    setMutationError(null)
    setStatus(
      { id, status: current === 'published' ? 'draft' : 'published' },
      { onError: () => setMutationError('Failed to update status.') },
    )
  }

  const handleDelete = (id: string) => {
    setMutationError(null)
    deleteObituary(id, { onError: () => setMutationError('Failed to delete obituary.') })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Obituaries</h1>

      {mutationError && <ErrorMessage message={mutationError} />}
      {error && <ErrorMessage message="Failed to load obituaries." />}

      <div className="overflow-x-auto rounded-2xl border border-neutral-100 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">Full Name</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">Slug</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">Created</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded bg-neutral-200 dark:bg-neutral-700" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-neutral-400">No obituaries found.</td>
              </tr>
            ) : (
              items.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">{o.full_name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={o.status === 'published' ? 'success' : 'warning'}>
                      {o.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400 font-mono text-xs">{o.slug ?? '—'}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(o.id, o.status)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                      >
                        {o.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            aria-label={`Delete obituary for ${o.full_name}`}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete Obituary</AlertDialogTitle>
                          <AlertDialogDescription className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                            Are you sure you want to permanently delete <strong>{o.full_name}</strong>'s obituary? This action cannot be undone.
                          </AlertDialogDescription>
                          <div className="mt-5 flex justify-end gap-3">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(o.id)}>Delete</AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
          <span>{total} obituaries total</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1.5">{page} / {pages}</span>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
