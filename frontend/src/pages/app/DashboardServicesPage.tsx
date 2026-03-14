import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Building2, MoreVertical } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProfile } from '@/hooks/use-profile'
import {
  useMyServices,
  useDeleteMyService,
  type OrganisationService,
} from '@/hooks/use-services'
import { Badge } from '@/components/ui/Badge'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/AlertDialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu'
import { toast } from '@/lib/toast'

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 animate-pulse overflow-hidden">
      <div className="h-48 bg-neutral-100 dark:bg-neutral-700" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-neutral-100 dark:bg-neutral-700 rounded w-3/4" />
        <div className="h-3 bg-neutral-100 dark:bg-neutral-700 rounded w-1/2" />
        <div className="h-3 bg-neutral-100 dark:bg-neutral-700 rounded w-2/5" />
      </div>
    </div>
  )
}

// ── Service card ──────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: OrganisationService
  onEdit: (svc: OrganisationService) => void
  onDelete: (svc: OrganisationService) => void
}

function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const { t } = useTranslation()
  const image = service.gallery_urls?.[0] ?? service.icon_url ?? null
  const categorySlug = service.service_categories?.slug
  const location = [service.city, service.country].filter(Boolean).join(', ')

  // Draft → edit page; published → public listing (fallback to edit if no slug)
  const href = service.is_draft
    ? `/dashboard/services/${service.id}/edit`
    : categorySlug
      ? `/services/${categorySlug}/${service.id}`
      : `/dashboard/services/${service.id}/edit`

  const statusLabel = service.is_draft
    ? t('dashboard.services.isDraft')
    : service.is_active
      ? t('dashboard.services.statusActive')
      : t('dashboard.services.statusInactive')
  const statusVariant: 'warning' | 'success' | 'default' = service.is_draft
    ? 'warning'
    : service.is_active
      ? 'success'
      : 'default'

  return (
    <article className="relative bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Image */}
      {image ? (
        <img src={image} alt={service.name} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
          <Building2 size={40} className="text-neutral-300 dark:text-neutral-600" strokeWidth={1.5} />
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        {/* Name (full-card click overlay) + status badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            to={href}
            className="font-semibold text-neutral-900 dark:text-neutral-100 leading-snug after:absolute after:inset-0 after:rounded-xl"
          >
            {service.name}
          </Link>
          <div className="relative z-10 flex items-center gap-1.5 shrink-0">
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Service options"
                  className="flex items-center justify-center h-8 w-8 rounded-lg text-neutral-400
                    hover:text-neutral-600 dark:hover:text-neutral-300
                    hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors
                    focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <MoreVertical size={15} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {service.is_draft ? (
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400 focus:text-red-600"
                    onSelect={() => onDelete(service)}
                  >
                    <Trash2 size={14} className="mr-2 shrink-0" />
                    {t('dashboard.services.deleteTitle')}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={() => onEdit(service)}>
                    <Pencil size={14} className="mr-2 shrink-0" />
                    {t('dashboard.services.editButton')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Category */}
        {service.service_categories?.name && (
          <p className="text-xs text-brand-primary font-medium mb-1">
            {service.service_categories.name}
          </p>
        )}

        {/* Location */}
        {location && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{location}</p>
        )}

        {/* Description */}
        {service.description && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 line-clamp-2">
            {service.description}
          </p>
        )}
      </div>
    </article>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardServicesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: profile, isLoading: profileLoading } = useProfile()

  const [deleteTarget, setDeleteTarget] = useState<OrganisationService | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data: servicesData, isLoading, error } = useMyServices()
  const { mutate: remove, isPending: deleting } = useDeleteMyService()

  if (profileLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (profile && profile.account_type !== 'organization') {
    return <Navigate to="/dashboard" replace />
  }

  const items = servicesData?.data ?? []

  const handleDelete = () => {
    if (!deleteTarget) return
    setDeleteError(null)
    remove(deleteTarget.id, {
      onSuccess: () => { setDeleteTarget(null); toast.success('Removed') },
      onError: (err) => setDeleteError((err as Error).message),
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {t('dashboard.services.title')}
          </h1>
          {items.length > 0 && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {t('dashboard.services.total', { count: items.length })}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard/services/create')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-brand-primary hover:bg-brand-primaryHover text-white font-medium transition-colors"
        >
          <Plus size={15} />
          {t('dashboard.services.addButton')}
        </button>
      </div>

      {error && <ErrorMessage message={t('dashboard.services.loadError')} />}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && items.length === 0 && (
        <div className="py-20 text-center">
          <Building2 size={48} className="mx-auto text-neutral-200 dark:text-neutral-700 mb-4" strokeWidth={1.5} />
          <p className="text-neutral-500 dark:text-neutral-400 font-medium mb-1">
            {t('dashboard.services.empty')}
          </p>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-6">
            {t('dashboard.services.emptyAction')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard/services/create')}
            className="inline-flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={15} />
            {t('dashboard.services.addButton')}
          </button>
        </div>
      )}

      {/* Card grid */}
      {!isLoading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((svc) => (
            <ServiceCard
              key={svc.id}
              service={svc}
              onEdit={(s) => navigate(`/dashboard/services/${s.id}/edit`)}
              onDelete={(s) => { setDeleteTarget(s); setDeleteError(null) }}
            />
          ))}
        </div>
      )}

      {/* Delete AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            {t('dashboard.services.deleteTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            {deleteTarget && t('dashboard.services.deleteConfirm', { name: deleteTarget.name })}
          </AlertDialogDescription>
          {deleteError && <ErrorMessage message={deleteError} />}
          <div className="flex justify-end gap-2">
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              {t('admin.common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? '…' : t('admin.common.delete')}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
