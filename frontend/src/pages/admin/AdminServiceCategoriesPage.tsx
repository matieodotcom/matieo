import { useState, useCallback, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, GripVertical, ImageIcon } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  useAdminServiceCategories,
  useAdminCreateServiceCategory,
  useAdminUpdateServiceCategory,
  useAdminDeleteServiceCategory,
  useAdminReorderServiceCategories,
  type AdminServiceCategory,
  type CreateServiceCategoryPayload,
} from '@/hooks/use-admin'
import { Badge } from '@/components/ui/Badge'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { PhotoUpload, type PhotoValue } from '@/components/ui/PhotoUpload'
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

const LIMIT = 20

// ── Category Form ─────────────────────────────────────────────────────────────

interface CategoryFormProps {
  initial?: AdminServiceCategory | null
  onSave: (payload: CreateServiceCategoryPayload) => void
  onCancel: () => void
  saving: boolean
  error: string | null
}

function CategoryForm({ initial, onSave, onCancel, saving, error }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)
  const [image, setImage] = useState<PhotoValue | null>(
    initial?.image_cloudinary_public_id && initial?.image_url
      ? { public_id: initial.image_cloudinary_public_id, url: initial.image_url }
      : null
  )
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; description?: string; image?: string }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: { name?: string; description?: string; image?: string } = {}
    if (!name.trim()) errs.name = 'Name is required.'
    if (!description.trim()) errs.description = 'Description is required.'
    if (!image) errs.image = 'A category image is required.'
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})
    onSave({
      name: name.trim(),
      description: description.trim(),
      is_active: isActive,
      image_cloudinary_public_id: image!.public_id,
      image_url: image!.url,
    })
  }

  const base = 'w-full rounded-lg border bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2'
  const inputCls = (hasError?: boolean) =>
    `${base} ${hasError ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400' : 'border-neutral-200 dark:border-neutral-700 focus:ring-brand-primary/40 focus:border-brand-primary'}`
  const labelCls = 'block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && <ErrorMessage message={error} />}

      <div>
        <label htmlFor="cat-name" className={labelCls}>Name *</label>
        <input
          id="cat-name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: undefined })) }}
          placeholder="e.g. Florists"
          className={inputCls(!!fieldErrors.name)}
        />
        {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
      </div>

      <div>
        <label htmlFor="cat-description" className={labelCls}>Description *</label>
        <textarea
          id="cat-description"
          value={description}
          onChange={(e) => { setDescription(e.target.value); setFieldErrors((p) => ({ ...p, description: undefined })) }}
          rows={2}
          className={inputCls(!!fieldErrors.description) + ' resize-none'}
        />
        {fieldErrors.description && <p className="mt-1 text-xs text-red-500">{fieldErrors.description}</p>}
      </div>

      <div>
        <PhotoUpload
          label="Category Image *"
          hint="Displayed on the public services page. Recommended: 800×600px."
          value={image}
          onChange={(v) => { setImage(v); setFieldErrors((p) => ({ ...p, image: undefined })) }}
        />
        {fieldErrors.image && <p className="mt-1 text-xs text-red-500">{fieldErrors.image}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="cat-active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
        />
        <label htmlFor="cat-active" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
          Active
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm rounded-lg bg-brand-primary hover:bg-brand-primaryHover text-white font-medium transition-colors disabled:opacity-50"
        >
          {saving ? '…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

// ── Sortable row ──────────────────────────────────────────────────────────────

interface SortableRowProps {
  cat: AdminServiceCategory
  onEdit: (cat: AdminServiceCategory) => void
  onDelete: (cat: AdminServiceCategory) => void
}

function SortableRow({ cat, onEdit, onDelete }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
    >
      <td className="px-3 py-3 w-8">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500 dark:hover:text-neutral-400 touch-none"
        >
          <GripVertical size={16} />
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            {cat.image_url ? (
              <img src={cat.image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon size={14} className="text-neutral-400" />
            )}
          </div>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">{cat.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400 font-mono text-xs hidden md:table-cell">{cat.slug}</td>
      <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400 max-w-xs truncate hidden lg:table-cell">{cat.description ?? '—'}</td>
      <td className="px-4 py-3 text-center">
        <Badge variant={cat.is_active ? 'success' : 'default'}>
          {cat.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            aria-label="Edit"
            onClick={() => onEdit(cat)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-brand-primary hover:bg-brand-primaryLight dark:hover:bg-brand-primary/20 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            aria-label="Delete"
            onClick={() => onDelete(cat)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminServiceCategoriesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminServiceCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminServiceCategory | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Local ordered list (synced from server, mutated optimistically on drag)
  const [orderedItems, setOrderedItems] = useState<AdminServiceCategory[]>([])

  const { data, isLoading, error } = useAdminServiceCategories({ page, q: search || undefined })
  const { mutate: create, isPending: creating } = useAdminCreateServiceCategory()
  const { mutate: update, isPending: updating } = useAdminUpdateServiceCategory()
  const { mutate: remove, isPending: deleting } = useAdminDeleteServiceCategory()
  const { mutate: reorder } = useAdminReorderServiceCategories()

  const serverItems = data?.data.items ?? []
  const total = data?.data.total ?? 0
  const pages = Math.ceil(total / LIMIT)

  // Sync server → local order when data changes (but not while user is dragging)
  useEffect(() => {
    setOrderedItems(serverItems)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setOrderedItems((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === active.id)
      const newIndex = prev.findIndex((c) => c.id === over.id)
      const next = arrayMove(prev, oldIndex, newIndex)
      // Persist new order: assign sort_order = index + 1
      reorder(next.map((c, i) => ({ id: c.id, sort_order: i + 1 })))
      return next
    })
  }, [reorder])

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }, [])

  const openAdd = () => { setEditTarget(null); setFormError(null); setDialogOpen(true) }
  const openEdit = (cat: AdminServiceCategory) => { setEditTarget(cat); setFormError(null); setDialogOpen(true) }

  const handleSave = (payload: CreateServiceCategoryPayload) => {
    setFormError(null)
    if (editTarget) {
      update({ id: editTarget.id, ...payload }, {
        onSuccess: () => { setDialogOpen(false); toast('Saved ✓') },
        onError: (err) => setFormError((err as Error).message || 'Failed to update category.'),
      })
    } else {
      create(payload, {
        onSuccess: () => { setDialogOpen(false); toast('Category added ✓') },
        onError: (err) => setFormError((err as Error).message || 'Failed to create category.'),
      })
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setDeleteError(null)
    remove(deleteTarget.id, {
      onSuccess: () => { setDeleteTarget(null); toast('Deleted') },
      onError: (err) => {
        const msg = (err as Error).message || 'Failed to delete category.'
        if (msg.toLowerCase().includes('active service listings')) {
          setDeleteError('Cannot delete — this category has active service listings.')
        } else {
          setDeleteError(msg)
        }
      },
    })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Service Categories
        </h1>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-brand-primary hover:bg-brand-primaryHover text-white font-medium transition-colors"
        >
          <Plus size={15} />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72 mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        <input
          id="cat-search"
          type="search"
          value={search}
          onChange={handleSearch}
          placeholder="Search by name…"
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary"
        />
      </div>

      {error && <ErrorMessage message="Failed to load categories." />}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : orderedItems.length === 0 ? (
        <div className="py-20 text-center text-neutral-400 text-sm">
          No service categories yet.
        </div>
      ) : (
        <>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-2">
            Drag rows to reorder display order.
          </p>
          <div className="overflow-x-auto rounded-xl border border-neutral-100 dark:border-neutral-800">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-3 w-8" />
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Slug</th>
                  <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Description</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={orderedItems.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                    {orderedItems.map((cat) => (
                      <SortableRow
                        key={cat.id}
                        cat={cat}
                        onEdit={openEdit}
                        onDelete={(c) => { setDeleteError(null); setDeleteTarget(c) }}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </DndContext>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-neutral-600 dark:text-neutral-400">
              <span>{total} categories</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  Previous
                </button>
                <span className="px-3 py-1.5">{page} / {pages}</span>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="dark:bg-neutral-900">
          <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            {editTarget ? 'Edit Service Category' : 'Add Service Category'}
          </DialogTitle>
          <CategoryForm
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
            Delete Category
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            {deleteTarget && `Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          </AlertDialogDescription>
          {deleteError && <p className="text-sm text-red-600 mb-3">{deleteError}</p>}
          <div className="flex justify-end gap-2">
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? '…' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
