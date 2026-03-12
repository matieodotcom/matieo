import { useAdminStats } from '@/hooks/use-admin'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

function StatCard({
  label,
  total,
  sub,
}: {
  label: string
  total: number
  sub?: { label: string; value: number }[]
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-neutral-100">{total.toLocaleString()}</p>
      {sub && sub.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {sub.map((s) => (
            <span key={s.label} className="text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">{s.value}</span> {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 animate-pulse">
      <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
      <div className="mt-2 h-8 w-16 rounded bg-neutral-200 dark:bg-neutral-700" />
      <div className="mt-3 flex gap-3">
        <div className="h-3 w-20 rounded bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-3 w-20 rounded bg-neutral-100 dark:bg-neutral-800" />
      </div>
    </div>
  )
}

export default function AdminOverviewPage() {
  const { data, isLoading, error } = useAdminStats()

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Overview</h1>

      {error && <ErrorMessage message="Failed to load stats. Please refresh." />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : data ? (
          <>
            <StatCard
              label="Users"
              total={data.data.users.total}
              sub={[
                { label: 'admins', value: data.data.users.admins },
                { label: 'researchers', value: data.data.users.researchers },
              ]}
            />
            <StatCard
              label="Memorials"
              total={data.data.memorials.total}
              sub={[
                { label: 'published', value: data.data.memorials.published },
                { label: 'draft', value: data.data.memorials.draft },
              ]}
            />
            <StatCard
              label="Obituaries"
              total={data.data.obituaries.total}
              sub={[
                { label: 'published', value: data.data.obituaries.published },
                { label: 'draft', value: data.data.obituaries.draft },
              ]}
            />
            <StatCard label="Tributes"    total={data.data.tributes.total} />
            <StatCard label="Condolences" total={data.data.condolences.total} />
            <StatCard label="Waitlist"    total={data.data.waitlist.total} />
          </>
        ) : null}
      </div>
    </div>
  )
}
