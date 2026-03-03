import { useState, useEffect } from 'react'
import { Link, useSearchParams, Navigate } from 'react-router-dom'
import { Search, Plus, Heart } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MemorialCard } from '@/components/memorial/MemorialCard'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useMemorials } from '@/hooks/use-memorials'
import { useAuthStore } from '@/store/authStore'

const LIMIT = 12

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 animate-pulse overflow-hidden">
      <div className="h-52 bg-neutral-100" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-neutral-100 rounded w-3/4" />
        <div className="h-3 bg-neutral-100 rounded w-1/2" />
        <div className="h-3 bg-neutral-100 rounded w-2/5" />
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
        className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
              : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </nav>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ViewMemorialsPage() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')

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

  const { data, isPending, error } = useMemorials({ q, page, limit: LIMIT })
  const memorials = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / LIMIT)

  // Auth guard — wait for auth to resolve before redirecting
  if (!isLoading && !user) {
    return <Navigate to="/signin" replace />
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-10">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Memorials</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Honor and remember loved ones with digital memorials
            </p>
          </div>

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
                className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-52 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                aria-label="Search memorials"
              />
            </div>

            {/* Create */}
            <Link
              to="/app/memorials/create"
              className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus size={15} />
              Create Memorial
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <ErrorMessage message={error.message} />
        )}

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
            <Heart size={48} className="mx-auto text-neutral-200 mb-4" />
            {q ? (
              <>
                <p className="text-neutral-500 font-medium">No memorials match "{q}"</p>
                <p className="text-sm text-neutral-400 mt-1">Try a different search term.</p>
              </>
            ) : (
              <>
                <p className="text-neutral-500 font-medium">No memorials yet</p>
                <p className="text-sm text-neutral-400 mt-1">
                  Create your first memorial to get started.
                </p>
                <Link
                  to="/app/memorials/create"
                  className="inline-flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors mt-6"
                >
                  <Plus size={15} />
                  Create Memorial
                </Link>
              </>
            )}
          </div>
        )}

        {/* Card grid */}
        {!isPending && !error && memorials.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {memorials.map((memorial) => (
                <MemorialCard key={memorial.id} memorial={memorial} />
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
