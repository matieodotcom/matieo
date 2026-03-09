import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, Plus, ScrollText } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ObituaryCard } from '@/components/obituary/ObituaryCard'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useObitaries } from '@/hooks/use-obituaries'
import { useAuthStore } from '@/store/authStore'

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
        <div className="h-3 bg-neutral-100 dark:bg-neutral-700 rounded w-1/4" />
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

export default function ObituaryPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')

  const q = searchParams.get('q') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))

  // Debounce search
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

  const { data, isPending, error } = useObitaries({ q, page, limit: LIMIT })
  const obituaries = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / LIMIT)

  function handleCreateObituary() {
    if (!user) {
      navigate('/signin')
      return
    }
    navigate('/dashboard/obituary/create')
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 font-sans">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Obituaries</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Create and share obituaries to honor your loved ones
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
              {/* Search bar */}
              <div className="relative w-full sm:w-56">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                />
                <input
                  id="obituary-search"
                  type="search"
                  placeholder="Search obituaries..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  aria-label="Search obituaries"
                />
              </div>

              <button
                onClick={handleCreateObituary}
                className="flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
              >
                <Plus size={15} />
                Create Obituary
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <ErrorMessage message={error.message} />}

          {/* Loading skeleton */}
          {isPending && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isPending && !error && obituaries.length === 0 && (
            <div className="text-center py-24">
              <ScrollText size={48} className="mx-auto text-neutral-200 dark:text-neutral-700 mb-4" />
              {q ? (
                <>
                  <p className="text-neutral-500 dark:text-neutral-400 font-medium">No obituaries match "{q}"</p>
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Try a different search term.</p>
                </>
              ) : (
                <>
                  <p className="text-neutral-500 dark:text-neutral-400 font-medium">No obituaries published yet</p>
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                    Be the first to honour a loved one with an obituary.
                  </p>
                  <button
                    onClick={handleCreateObituary}
                    className="inline-flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors mt-6"
                  >
                    <Plus size={15} />
                    Create Obituary
                  </button>
                </>
              )}
            </div>
          )}

          {/* Card grid */}
          {!isPending && !error && obituaries.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {obituaries.map((obituary) => (
                  <ObituaryCard
                    key={obituary.id}
                    obituary={obituary}
                    showStatus={false}
                    showPublisher
                  />
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
