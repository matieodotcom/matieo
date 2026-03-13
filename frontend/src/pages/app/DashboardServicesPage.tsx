import { useState, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import {
  useMyServices,
  useCreateMyService,
  useUpdateMyService,
  useDeleteMyService,
  usePublicServiceCategories,
  type OrganisationService,
  type CreateServicePayload,
} from '@/hooks/use-services'
import { Badge } from '@/components/ui/Badge'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/AlertDialog'
import { toast } from '@/lib/toast'

// ── Service Form ──────────────────────────────────────────────────────────────

interface ServiceFormProps {
  initial?: OrganisationService | null
  onSave: (payload: CreateServicePayload) => void
  onCancel: () => void
  saving: boolean
  error: string | null
}

function ServiceForm({ initial, onSave, onCancel, saving, error }: ServiceFormProps) {
  const { t } = useTranslation()
  const { data: categoriesData } = usePublicServiceCategories()
  const categories = categoriesData?.data ?? []

  const [categoryId, setCategoryId] = useState(initial?.category_id ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [website, setWebsite] = useState(initial?.website ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [city, setCity] = useState(initial?.city ?? '')
  const [country, setCountry] = useState(initial?.country ?? '')
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      category_id: categoryId,
      name,
      description: description || undefined,
      phone: phone || undefined,
      email: email || undefined,
      website: website || undefined,
      address: address || undefined,
      city: city || undefined,
      country: country || undefined,
      is_active: isActive,
    })
  }

  const inputCls = 'w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary'
  const labelCls = 'block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {error && <ErrorMessage message={error} />}

      <div>
        <label htmlFor="svc-category" className={labelCls}>{t('dashboard.services.form.category')} *</label>
        <select
          id="svc-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className={inputCls}
        >
          <option value="">{t('dashboard.services.form.categoryPlaceholder')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="svc-name" className={labelCls}>{t('dashboard.services.form.name')} *</label>
        <input
          id="svc-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('dashboard.services.form.namePlaceholder')}
          required
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="svc-description" className={labelCls}>{t('dashboard.services.form.description')}</label>
        <textarea id="svc-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls + ' resize-none'} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="svc-phone" className={labelCls}>{t('dashboard.services.form.phone')}</label>
          <input id="svc-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="svc-email" className={labelCls}>{t('dashboard.services.form.email')}</label>
          <input id="svc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </div>
      </div>

      <div>
        <label htmlFor="svc-website" className={labelCls}>{t('dashboard.services.form.website')}</label>
        <input id="svc-website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className={inputCls} />
      </div>

      <div>
        <label htmlFor="svc-address" className={labelCls}>{t('dashboard.services.form.address')}</label>
        <input id="svc-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="svc-city" className={labelCls}>{t('dashboard.services.form.city')}</label>
          <input id="svc-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="svc-country" className={labelCls}>{t('dashboard.services.form.country')}</label>
          <input id="svc-country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} />
        </div>
      </div>

      <div>
        <label htmlFor="svc-active" className="flex items-center gap-2 cursor-pointer">
          <input
            id="svc-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
          />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('dashboard.services.form.isActive')}
          </span>
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          {t('dashboard.services.form.cancelButton')}
        </button>
        <button type="submit" disabled={saving}
          className="px-4 py-2 text-sm rounded-lg bg-brand-primary hover:bg-brand-primaryHover text-white font-medium transition-colors disabled:opacity-50">
          {saving ? '…' : t('dashboard.services.form.saveButton')}
        </button>
      </div>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardServicesPage() {
  const { t } = useTranslation()
  const { data: profile, isLoading: profileLoading } = useProfile()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<OrganisationService | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OrganisationService | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const { data: servicesData, isLoading, error } = useMyServices()
  const { mutate: create, isPending: creating } = useCreateMyService()
  const { mutate: update, isPending: updating } = useUpdateMyService()
  const { mutate: remove, isPending: deleting } = useDeleteMyService()

  // Guard: wait for profile, then redirect non-org
  if (profileLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (profile && profile.account_type !== 'organization') {
    return <Navigate to="/dashboard" replace />
  }

  const items = servicesData?.data ?? []

  const openAdd = useCallback(() => {
    setEditTarget(null)
    setFormError(null)
    setDialogOpen(true)
  }, [])

  const openEdit = useCallback((svc: OrganisationService) => {
    setEditTarget(svc)
    setFormError(null)
    setDialogOpen(true)
  }, [])

  const handleSave = (payload: CreateServicePayload) => {
    setFormError(null)
    if (editTarget) {
      update({ id: editTarget.id, ...payload }, {
        onSuccess: () => { setDialogOpen(false); toast(t('dashboard.services.editButton') + ' ✓') },
        onError: (err) => setFormError((err as Error).message || t('dashboard.services.loadError')),
      })
    } else {
      create(payload, {
        onSuccess: () => { setDialogOpen(false); toast(t('dashboard.services.addButton') + ' ✓') },
        onError: (err) => setFormError((err as Error).message || t('dashboard.services.loadError')),
      })
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    remove(deleteTarget.id, {
      onSuccess: () => { setDeleteTarget(null); toast('Removed') },
      onError: (err) => setFormError((err as Error).message),
    })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {t('dashboard.services.title')}
        </h1>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-brand-primary hover:bg-brand-primaryHover text-white font-medium transition-colors"
        >
          <Plus size={15} />
          {t('dashboard.services.addButton')}
        </button>
      </div>

      {error && <ErrorMessage message={t('dashboard.services.loadError')} />}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-neutral-400 text-sm mb-3">{t('dashboard.services.empty')}</p>
          <button
            type="button"
            onClick={openAdd}
            className="text-sm text-brand-primary hover:underline"
          >
            {t('dashboard.services.emptyAction')}
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            {t('dashboard.services.total', { count: items.length })}
          </p>
          <div className="overflow-x-auto rounded-xl border border-neutral-100 dark:border-neutral-800">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">{t('dashboard.services.columns.name')}</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">{t('dashboard.services.columns.category')}</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">{t('dashboard.services.columns.location')}</th>
                  <th className="px-4 py-3 text-center font-medium">{t('dashboard.services.columns.status')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('dashboard.services.columns.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                {items.map((svc) => {
                  const cat = svc.service_categories
                  const location = [svc.city, svc.country].filter(Boolean).join(', ')
                  return (
                    <tr key={svc.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">{svc.name}</td>
                      <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400 hidden sm:table-cell">
                        {cat?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400 hidden md:table-cell">
                        {location || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={svc.is_active ? 'success' : 'default'}>
                          {svc.is_active ? t('dashboard.services.statusActive') : t('dashboard.services.statusInactive')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" aria-label={t('dashboard.services.editButton')} onClick={() => openEdit(svc)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-brand-primary hover:bg-brand-primaryLight dark:hover:bg-brand-primary/20 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button type="button" aria-label={t('dashboard.services.deleteTitle')} onClick={() => setDeleteTarget(svc)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="dark:bg-neutral-900">
          <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            {editTarget
              ? t('dashboard.services.form.editTitle')
              : t('dashboard.services.form.addTitle')}
          </DialogTitle>
          <ServiceForm
            initial={editTarget}
            onSave={handleSave}
            onCancel={() => setDialogOpen(false)}
            saving={creating || updating}
            error={formError}
          />
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            {t('dashboard.services.deleteTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            {deleteTarget && t('dashboard.services.deleteConfirm', { name: deleteTarget.name })}
          </AlertDialogDescription>
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
