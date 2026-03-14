import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Eye } from 'lucide-react'
import type { ServicePreviewValues } from '@/pages/app/ServicePreviewPage'
import { PhotoUpload, GalleryUpload, type PhotoValue } from '@/components/ui/PhotoUpload'
import { Select as SelectField } from '@/components/ui/Select'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import {
  useMyService,
  useCreateMyService,
  useUpdateMyService,
  usePublicServiceCategories,
} from '@/hooks/use-services'
import { toast } from '@/lib/toast'

const ABOUT_MAX = 4000
const SHORT_MAX = 250

// ── Layout primitives (matching CreateObituaryPage) ───────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
      <h2 className="mb-5 text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
      {children}
    </section>
  )
}

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
      {children}
      {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
    </label>
  )
}

const inputClass =
  'w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors'
const inputErrorClass =
  'w-full rounded-lg border border-red-400 bg-white dark:bg-neutral-900 px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400/40 transition-colors'
const textareaClass = `${inputClass} resize-none`
const textareaErrorClass = `${inputErrorClass} resize-none`

// ── Page (handles both /create and /:id/edit) ─────────────────────────────────

export default function DashboardServiceFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  // Data for edit mode
  const { data: existingService, isLoading: loadingService } = useMyService(id ?? '')
  const { data: catsData } = usePublicServiceCategories()
  const categories = catsData?.data ?? []

  const { mutate: create, isPending: creating } = useCreateMyService()
  const { mutate: update, isPending: updating } = useUpdateMyService()
  const isPending = creating || updating

  // Upload state
  const [icon, setIcon] = useState<PhotoValue | null>(null)
  const [gallery, setGallery] = useState<PhotoValue[]>([])

  // Form fields
  const [name, setName] = useState('')
  const [contactNo, setContactNo] = useState('')
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [about, setAbout] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [prefilled, setPrefilled] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  // Pre-fill from existing service in edit mode
  useEffect(() => {
    if (isEdit && existingService && !prefilled) {
      setName(existingService.name ?? '')
      setContactNo(existingService.phone ?? '')
      setWebsite(existingService.website ?? '')
      setEmail(existingService.email ?? '')
      setCategoryId(existingService.category_id ?? '')
      setAddress(existingService.address ?? '')
      setCity(existingService.city ?? '')
      setCountry(existingService.country ?? '')
      setAbout(existingService.about ?? '')
      setShortDesc(existingService.description ?? '')
      if (existingService.icon_url && existingService.icon_public_id) {
        setIcon({ public_id: existingService.icon_public_id, url: existingService.icon_url })
      }
      if (existingService.gallery_urls?.length) {
        setGallery(
          existingService.gallery_urls.map((url, i) => ({
            public_id: existingService.gallery_public_ids?.[i] ?? url,
            url,
          })),
        )
      }
      setPrefilled(true)
    }
  }, [isEdit, existingService, prefilled])

  // Redirect if edit target not found
  useEffect(() => {
    if (isEdit && !loadingService && !existingService) {
      navigate('/dashboard/services', { replace: true })
    }
  }, [isEdit, loadingService, existingService, navigate])

  function clearErr(key: string) {
    setFieldErrors((p) => ({ ...p, [key]: '' }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = t('dashboard.services.form.nameRequired')
    if (!contactNo.trim()) errs.contactNo = t('dashboard.services.contactRequired')
    if (!categoryId) errs.categoryId = t('dashboard.services.form.categoryRequired')
    if (!address.trim()) errs.address = t('dashboard.services.addressRequired')
    if (!about.trim()) errs.about = t('dashboard.services.aboutRequired')
    return errs
  }

  function buildPayload(isDraft: boolean) {
    return {
      name: name.trim(),
      phone: contactNo.trim() || undefined,
      website: website.trim() || undefined,
      email: email.trim() || undefined,
      category_id: categoryId,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      country: country.trim() || undefined,
      about: about.trim() || undefined,
      description: shortDesc.trim() || undefined,
      icon_public_id: icon?.public_id,
      icon_url: icon?.url,
      gallery_public_ids: gallery.map((g) => g.public_id),
      gallery_urls: gallery.map((g) => g.url),
      is_draft: isDraft,
      is_active: !isDraft,
    }
  }

  function handlePreview() {
    const categoryName = categories.find((c) => c.id === categoryId)?.name ?? ''
    const values: ServicePreviewValues = {
      name: name.trim(),
      phone: contactNo.trim(),
      email: email.trim(),
      website: website.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      about: about.trim(),
      description: shortDesc.trim(),
      categoryName,
      iconUrl: icon?.url ?? null,
      galleryUrls: gallery.map((g) => g.url),
    }
    navigate('/dashboard/services/preview', {
      state: { values, fromId: id },
    })
  }

  function submit(isDraft: boolean) {
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})
    setServerError(null)

    if (isEdit) {
      update(
        { id: id!, ...buildPayload(isDraft) },
        {
          onSuccess: () => {
            toast.success(t('dashboard.services.saveChanges') + ' ✓')
            // Stay on edit page after saving draft so user can continue editing
            if (!isDraft) navigate('/dashboard/services')
          },
          onError: (err) => setServerError((err as Error).message),
        },
      )
    } else {
      create(
        buildPayload(isDraft),
        {
          onSuccess: (res) => {
            if (isDraft) {
              // Redirect to edit page so the draft can be continued
              const newId = (res as { data?: { id?: string } })?.data?.id
              toast.success(t('dashboard.services.saveAsDraft') + ' ✓')
              if (newId) {
                navigate(`/dashboard/services/${newId}/edit`, { replace: true })
              } else {
                navigate('/dashboard/services')
              }
            } else {
              toast.success(t('dashboard.services.createService') + ' ✓')
              navigate('/dashboard/services')
            }
          },
          onError: (err) => setServerError((err as Error).message),
        },
      )
    }
  }

  if (isEdit && loadingService) {
    return (
      <div className="py-8 space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 animate-pulse space-y-3">
            <div className="h-4 bg-neutral-100 dark:bg-neutral-700 rounded w-1/4" />
            <div className="h-10 bg-neutral-100 dark:bg-neutral-700 rounded" />
            <div className="h-10 bg-neutral-100 dark:bg-neutral-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {isEdit ? t('dashboard.services.editTitle') : t('dashboard.services.createTitle')}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {isEdit ? existingService?.name : t('dashboard.services.sectionCompany')}
        </p>
      </div>

      {serverError && <div className="mb-6"><ErrorMessage message={serverError} /></div>}

      <div className="space-y-6">

        {/* ── Media ───────────────────────────────────────────────────────── */}
        <Section title={t('dashboard.services.sectionMedia')}>
          <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
            {/* Left: company logo */}
            <div className="w-full sm:w-44 shrink-0">
              <p className="mb-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('dashboard.services.uploadIcon')}
              </p>
              <p className="mb-2 min-h-8 text-xs text-neutral-400">{t('dashboard.services.uploadIconHint')}</p>
              <PhotoUpload
                label=""
                value={icon}
                onChange={setIcon}
                uploadAreaClassName="h-44"
              />
            </div>

            {/* Right: photo gallery */}
            <div className="flex-1 min-w-0">
              <p className="mb-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('dashboard.services.uploadGallery')}
              </p>
              <p className="mb-2 min-h-8 text-xs text-neutral-400">{t('dashboard.services.uploadGalleryHint')}</p>
              <GalleryUpload
                values={gallery}
                onChange={setGallery}
                max={6}
                tileSizeClass="h-28 w-28"
                emptyStateClassName="h-44"
              />
            </div>
          </div>
        </Section>

        {/* ── Company Information ──────────────────────────────────────────── */}
        <Section title={t('dashboard.services.sectionCompany')}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="svc-name" required>{t('dashboard.services.companyName')}</FieldLabel>
              <input
                id="svc-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); clearErr('name') }}
                className={fieldErrors.name ? inputErrorClass : inputClass}
              />
              {fieldErrors.name && <ErrorMessage message={fieldErrors.name} />}
            </div>

            <div>
              <FieldLabel htmlFor="svc-contact" required>{t('dashboard.services.contactNo')}</FieldLabel>
              <input
                id="svc-contact"
                type="text"
                value={contactNo}
                onChange={(e) => { setContactNo(e.target.value); clearErr('contactNo') }}
                className={fieldErrors.contactNo ? inputErrorClass : inputClass}
              />
              {fieldErrors.contactNo && <ErrorMessage message={fieldErrors.contactNo} />}
            </div>

            <div>
              <FieldLabel htmlFor="svc-website">{t('dashboard.services.form.website')}</FieldLabel>
              <input
                id="svc-website"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel htmlFor="svc-email">{t('dashboard.services.form.email')}</FieldLabel>
              <input
                id="svc-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <FieldLabel htmlFor="svc-category" required>{t('dashboard.services.form.category')}</FieldLabel>
              <SelectField
                id="svc-category"
                value={categoryId}
                onValueChange={(v) => { setCategoryId(v); clearErr('categoryId') }}
                placeholder={t('dashboard.services.form.categoryPlaceholder')}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                className={fieldErrors.categoryId ? 'border-red-400 focus:ring-red-400/40' : ''}
              />
              {fieldErrors.categoryId && <ErrorMessage message={fieldErrors.categoryId} />}
            </div>

            <div className="sm:col-span-2">
              <FieldLabel htmlFor="svc-address" required>{t('dashboard.services.address')}</FieldLabel>
              <input
                id="svc-address"
                type="text"
                value={address}
                onChange={(e) => { setAddress(e.target.value); clearErr('address') }}
                className={fieldErrors.address ? inputErrorClass : inputClass}
              />
              {fieldErrors.address && <ErrorMessage message={fieldErrors.address} />}
            </div>

            <div>
              <FieldLabel htmlFor="svc-city">{t('dashboard.services.form.city')}</FieldLabel>
              <input
                id="svc-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel htmlFor="svc-country">{t('dashboard.services.form.country')}</FieldLabel>
              <input
                id="svc-country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </Section>

        {/* ── Descriptions ────────────────────────────────────────────────── */}
        <Section title={t('dashboard.services.sectionDescriptions')}>
          <div className="space-y-5">
            <div>
              <FieldLabel htmlFor="svc-about" required>{t('dashboard.services.about')}</FieldLabel>
              <textarea
                id="svc-about"
                rows={6}
                value={about}
                onChange={(e) => { setAbout(e.target.value.slice(0, ABOUT_MAX)); clearErr('about') }}
                placeholder={t('dashboard.services.aboutPlaceholder')}
                className={fieldErrors.about ? textareaErrorClass : textareaClass}
              />
              <p className="mt-1 text-xs text-neutral-400 text-right">{about.length}/{ABOUT_MAX}</p>
              {fieldErrors.about && <ErrorMessage message={fieldErrors.about} />}
            </div>

            <div>
              <FieldLabel htmlFor="svc-short">{t('dashboard.services.shortDescription')}</FieldLabel>
              <textarea
                id="svc-short"
                rows={3}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value.slice(0, SHORT_MAX))}
                placeholder={t('dashboard.services.shortDescriptionPlaceholder')}
                className={textareaClass}
              />
              <p className="mt-1 text-xs text-neutral-400 text-right">{shortDesc.length}/{SHORT_MAX}</p>
            </div>
          </div>
        </Section>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Mobile primary CTA */}
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 py-3 text-sm font-medium text-white hover:bg-brand-primaryHover disabled:opacity-50 transition-colors sm:hidden"
          >
            {isPending ? '…' : isEdit ? t('dashboard.services.saveChanges') : t('dashboard.services.createService')}
            {!isPending && <ArrowRight className="h-4 w-4" />}
          </button>

          {/* Save as Draft + Preview */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => submit(true)}
              disabled={isPending}
              className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors sm:flex-none"
            >
              {t('dashboard.services.saveAsDraft')}
            </button>
            <button
              type="button"
              onClick={handlePreview}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              <Eye size={14} />
              {t('dashboard.services.previewButton')}
            </button>
          </div>

          {/* Cancel + Desktop primary */}
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <button
              type="button"
              onClick={() => navigate('/dashboard/services')}
              disabled={isPending}
              className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors disabled:opacity-50"
            >
              {t('dashboard.services.form.cancelButton')}
            </button>
            <button
              type="button"
              onClick={() => submit(false)}
              disabled={isPending}
              className="hidden sm:flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-primaryHover disabled:opacity-50 transition-colors"
            >
              {isPending ? '…' : isEdit ? t('dashboard.services.saveChanges') : t('dashboard.services.createService')}
              {!isPending && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
