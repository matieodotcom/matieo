import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, Plus, Heart } from 'lucide-react'
import { MemorialCard } from '@/components/memorial/MemorialCard'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useMyMemorials } from '@/hooks/use-my-memorials'
import { useDeleteMemorial } from '@/hooks/use-delete-memorial'
import { useUnpublishMemorial } from '@/hooks/use-unpublish-memorial'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/AlertDialog'

const LIMIT = 12

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 animate-pulse overflow-hidden">
      <div className="h-52 bg-neutral-100 dark:bg-neutral-700" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-neutral-100 dark:bg-neutral-700 rounded w-3/4" />
        <div className="h-3 bg-neutral-100 dark:bg-neutral-700 rounded w-1/2" />
        <div className="h-3 bg-neutral-100 dark:bg-neutral-700 rounded w-2/5" />
      </div>
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number
  totalPages: number
  onPage: (n: number) => void
}

function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onPage(n)}
          aria-current={n === page ? 'page' : undefined}
          className={`w-9 h-9 text-sm rounded-lg border transition-colors ${
            n === page
              ? 'bg-brand-primary border-brand-primary text-white font-medium'
              : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </nav>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MyMemorialsPage() {
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [pendingUnpublishId, setPendingUnpublishId] = useState<string | null>(null)

  const q = searchParams.get('q') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))

  // Debounce: write ?q= to URL after 300ms idle; reset page on new search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (searchInput.trim()) {
            next.set('q', searchInput.trim())
          } else {
            next.delete('q')
          }
          next.delete('page')
          return next
        },
        { replace: true },
      )
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput, setSearchParams])

  const setPage = (n: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('page', String(n))
        return next
      },
      { replace: true },
    )
  }

  const { data, isPending, error } = useMyMemorials({ q, page, limit: LIMIT })
  const { mutate: deleteDraft, isPending: isDeleting, error: deleteError } = useDeleteMemorial()
  const { mutate: unpublishMemorial, isPending: isUnpublishing, error: unpublishError } = useUnpublishMemorial()
  const memorials = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / LIMIT)
  const showControls = total > 0 || !!q

  function handleConfirmDelete() {
    if (!pendingDeleteId) return
    deleteDraft(pendingDeleteId, {
      onSuccess: () => setPendingDeleteId(null),
    })
  }

  function handleConfirmUnpublish() {
    if (!pendingUnpublishId) return
    unpublishMemorial(pendingUnpublishId, {
      onSuccess: () => setPendingUnpublishId(null),
    })
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">My Memorials</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage and view all memorials you have created
          </p>
        </div>

        {showControls && (
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
              <input
                id="memorial-search"
                type="search"
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg w-52 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                aria-label="Search memorials"
              />
            </div>

            <button
              onClick={() => navigate('/dashboard/memorials/create')}
              className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus size={15} />
              Create Memorial
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && <ErrorMessage message={error.message} />}

      {/* Loading skeleton */}
      {isPending && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isPending && !error && memorials.length === 0 && (
        <div className="text-center py-20">
          <Heart size={48} className="mx-auto text-neutral-200 dark:text-neutral-700 mb-4" />
          {q ? (
            <>
              <p className="text-neutral-500 dark:text-neutral-400 font-medium">No memorials match "{q}"</p>
              <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Try a different search term.</p>
            </>
          ) : (
            <>
              <p className="text-neutral-500 dark:text-neutral-400 font-medium">You haven't created any memorials yet</p>
              <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                Create your first memorial to honour a loved one.
              </p>
              <button
                onClick={() => navigate('/dashboard/memorials/create')}
                className="inline-flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors mt-6"
              >
                <Plus size={15} />
                Create Memorial
              </button>
            </>
          )}
        </div>
      )}

      {/* Card grid */}
      {!isPending && !error && memorials.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memorials.map((memorial) => (
              <MemorialCard
                key={memorial.id}
                memorial={memorial}
                onDelete={setPendingDeleteId}
                onUnpublish={setPendingUnpublishId}
              />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => { if (!open) setPendingDeleteId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Delete this draft?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            This will permanently delete the draft and all its photos. This cannot be undone.
          </AlertDialogDescription>
          {deleteError && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400 mb-4">
              {deleteError.message}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium
                bg-red-600 hover:bg-red-700 text-white transition-colors
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unpublish confirmation dialog */}
      <AlertDialog
        open={!!pendingUnpublishId}
        onOpenChange={(open) => { if (!open) setPendingUnpublishId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Unpublish this memorial?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            The memorial will no longer be publicly accessible. It will be saved as a draft and you can republish it at any time.
          </AlertDialogDescription>
          {unpublishError && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400 mb-4">
              {unpublishError.message}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <AlertDialogCancel disabled={isUnpublishing}>Cancel</AlertDialogCancel>
            <button
              onClick={handleConfirmUnpublish}
              disabled={isUnpublishing}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium
                bg-brand-primary hover:bg-brand-primaryHover text-white transition-colors
                focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUnpublishing ? 'Unpublishing…' : 'Unpublish'}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
