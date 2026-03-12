import { useState, useCallback } from 'react'
import { useAdminUsers, useAdminSetUserRole } from '@/hooks/use-admin'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

const ROLE_OPTIONS = [
  { value: '',           label: 'All roles' },
  { value: 'user',       label: 'User' },
  { value: 'admin',      label: 'Admin' },
  { value: 'researcher', label: 'Researcher' },
]

const ROLE_CHANGE_OPTIONS = [
  { value: 'user',       label: 'User' },
  { value: 'admin',      label: 'Admin' },
  { value: 'researcher', label: 'Researcher' },
]

function roleBadgeVariant(role: string) {
  if (role === 'admin') return 'danger' as const
  if (role === 'researcher') return 'info' as const
  return 'default' as const
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const LIMIT = 20

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [roleError, setRoleError] = useState<string | null>(null)

  const { data, isLoading, error } = useAdminUsers({ page, search: search || undefined, role: roleFilter || undefined })
  const { mutate: setRole } = useAdminSetUserRole()

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }, [])

  const handleRoleFilter = useCallback((v: string) => {
    setRoleFilter(v)
    setPage(1)
  }, [])

  const handleRoleChange = (id: string, role: string) => {
    setRoleError(null)
    setRole({ id, role }, {
      onError: () => setRoleError('Failed to update role. Please try again.'),
    })
  }

  const items  = data?.data.items ?? []
  const total  = data?.data.total ?? 0
  const pages  = Math.ceil(total / LIMIT)

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Users</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          id="user-search"
          type="search"
          placeholder="Search name or email…"
          value={search}
          onChange={handleSearch}
          className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary"
        />
        <div className="w-full sm:w-44">
          <Select
            id="role-filter"
            value={roleFilter}
            onValueChange={handleRoleFilter}
            options={ROLE_OPTIONS}
            placeholder="All roles"
          />
        </div>
      </div>

      {roleError && <ErrorMessage message={roleError} />}
      {error   && <ErrorMessage message="Failed to load users." />}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-100 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">Account Type</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">Joined</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">Change Role</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded bg-neutral-200 dark:bg-neutral-700" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-neutral-400">No users found.</td>
              </tr>
            ) : (
              items.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">{u.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{u.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={roleBadgeVariant(u.role)}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 capitalize">{u.account_type}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="w-36">
                      <Select
                        value={u.role}
                        onValueChange={(role) => handleRoleChange(u.id, role)}
                        options={ROLE_CHANGE_OPTIONS}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
          <span>{total} users total</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1.5">
              {page} / {pages}
            </span>
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
