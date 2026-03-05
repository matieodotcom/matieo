import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller } from 'react-hook-form'
import { ArrowRight, Check } from 'lucide-react'
import { PhotoUpload, GalleryUpload } from '@/components/ui/PhotoUpload'
import { Select } from '@/components/ui/Select'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useMemorialForm, sanitiseSlug, deriveSlug } from '@/hooks/use-create-memorial'
import { useMemorialDraftStore } from '@/store/memorialDraftStore'
import { buildCountryOptions, buildStateOptions, detectUserCountryCode } from '@/lib/geo'

// ── Constants ─────────────────────────────────────────────────────────────────

const AGE_OPTIONS = Array.from({ length: 120 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}))

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const RACE_OPTIONS = [
  { value: 'Malay', label: 'Malay' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Indian', label: 'Indian' },
  { value: 'Caucasian', label: 'Caucasian' },
  { value: 'African', label: 'African' },
  { value: 'Hispanic', label: 'Hispanic' },
  { value: 'Arab', label: 'Arab' },
  { value: 'Other', label: 'Other' },
]

const RELATIONSHIP_OPTIONS = [
  { value: 'Son', label: 'Son' },
  { value: 'Daughter', label: 'Daughter' },
  { value: 'Spouse/Partner', label: 'Spouse/Partner' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Grandchild', label: 'Grandchild' },
  { value: 'Friend', label: 'Friend' },
  { value: 'Other', label: 'Other' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export function isCustomColor(value: string): boolean {
  return value.startsWith('#')
}

// ── Gradient options ──────────────────────────────────────────────────────────

export const COVER_GRADIENTS = [
  { key: 'blue',     label: 'Ocean Blue',   tw: 'from-blue-500 to-brand-primary' },
  { key: 'sunset',   label: 'Sunset',       tw: 'from-orange-400 to-rose-500' },
  { key: 'forest',   label: 'Forest',       tw: 'from-green-500 to-teal-400' },
  { key: 'purple',   label: 'Twilight',     tw: 'from-purple-500 to-pink-400' },
  { key: 'ocean',    label: 'Deep Ocean',   tw: 'from-cyan-500 to-blue-700' },
  { key: 'charcoal', label: 'Charcoal',     tw: 'from-neutral-700 to-neutral-900' },
  { key: 'gold',     label: 'Golden Hour',  tw: 'from-amber-400 to-orange-500' },
  { key: 'rose',     label: 'Rose',         tw: 'from-rose-400 to-pink-600' },
]

// ── Domain helper ─────────────────────────────────────────────────────────────

function getDomain(): string {
  if (import.meta.env.DEV) return 'http://localhost:5173'
  if (import.meta.env.VITE_APP_ENV === 'production') return 'https://matieo.com'
  return 'https://dev.matieo.com'
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
      <h2 className="mb-5 text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
      {children}
    </section>
  )
}

function FieldLabel({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
      {children}
      {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
    </label>
  )
}

const inputClass =
  'w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors'

const textareaClass = `${inputClass} resize-none`

// ── Cover photo + gradient picker ────────────────────────────────────────────

interface CoverPhotoFieldProps {
  coverPhoto: import('@/components/ui/PhotoUpload').PhotoValue | null
  onCoverPhotoChange: (v: import('@/components/ui/PhotoUpload').PhotoValue | null) => void
  coverGradient: string
  onGradientChange: (key: string) => void
}

function CoverPhotoField({ coverPhoto, onCoverPhotoChange, coverGradient, onGradientChange }: CoverPhotoFieldProps) {
  const colorInputRef = useRef<HTMLInputElement>(null)
  const isCustom = !COVER_GRADIENTS.some((g) => g.key === coverGradient)

  return (
    <div className="space-y-4">
      <PhotoUpload
        label="Cover Photo"
        hint="Recommended 1216×282px, up to 10MB"
        value={coverPhoto}
        onChange={onCoverPhotoChange}
      />
      {!coverPhoto && (
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Or choose a cover background
          </p>
          <div className="flex flex-wrap gap-2">
            {COVER_GRADIENTS.map((g) => (
              <button
                key={g.key}
                type="button"
                aria-label={g.label}
                aria-pressed={coverGradient === g.key}
                onClick={() => onGradientChange(g.key)}
                className={`relative h-10 w-16 rounded-lg bg-gradient-to-r ${g.tw} ring-offset-2 transition-all
                  ${coverGradient === g.key
                    ? 'ring-2 ring-brand-primary'
                    : 'hover:ring-2 hover:ring-neutral-300 dark:hover:ring-neutral-600'
                  }`}
              >
                {coverGradient === g.key && (
                  <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                )}
              </button>
            ))}
            {/* Custom colour swatch */}
            <div className="relative">
              <button
                type="button"
                aria-label="Custom colour"
                aria-pressed={isCustom}
                onClick={() => colorInputRef.current?.click()}
                className={`relative h-10 w-16 rounded-lg overflow-hidden ring-offset-2 transition-all
                  ${isCustom
                    ? 'ring-2 ring-brand-primary'
                    : 'hover:ring-2 hover:ring-neutral-300 dark:hover:ring-neutral-600'
                  }`}
                style={isCustom ? { backgroundColor: coverGradient } : undefined}
              >
                {!isCustom && (
                  <div className="h-full w-full bg-gradient-to-br from-rose-400 via-amber-300 to-blue-500" />
                )}
                {isCustom && (
                  <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                )}
              </button>
              <input
                ref={colorInputRef}
                type="color"
                defaultValue="#3B5BFF"
                onChange={(e) => onGradientChange(e.target.value)}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CreateMemorialPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { form, onSaveDraft, onPublish, isPending, isLoading, isEdit, error } = useMemorialForm(id)
  const saveDraft = useMemorialDraftStore((s) => s.saveDraft)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = form

  const [countryOptions, setCountryOptions] = useState(() => buildCountryOptions(null))
  useEffect(() => {
    detectUserCountryCode().then(code => {
      if (code) setCountryOptions(buildCountryOptions(code))
    })
  }, [])

  const firstName = watch('firstName')
  const lastName = watch('lastName')
  const dateOfBirth = watch('dateOfBirth')
  const dateOfDeath = watch('dateOfDeath')
  const country = watch('country')
  const stateOptions = useMemo(() => buildStateOptions(country ?? ''), [country])
  const slug = watch('slug')
  const biography = watch('biography') ?? ''
  const tributeMessage = watch('tributeMessage') ?? ''
  const quote = watch('quote') ?? ''

  // Auto-derive slug when name/death year changes (unless user has manually edited it)
  useEffect(() => {
    const year = dateOfDeath ? new Date(dateOfDeath).getFullYear().toString() : undefined
    const derived = deriveSlug(firstName ?? '', lastName ?? '', year)
    // Only auto-update if slug matches previous auto value or is empty
    setValue('slug', derived, { shouldValidate: false })
  }, [firstName, lastName, dateOfDeath, setValue])

  // Auto-calculate age when both dates are present
  useEffect(() => {
    if (!dateOfBirth || !dateOfDeath) return
    const dob = new Date(dateOfBirth)
    const dod = new Date(dateOfDeath)
    let age = dod.getFullYear() - dob.getFullYear()
    const monthDiff = dod.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && dod.getDate() < dob.getDate())) age -= 1
    if (age >= 1 && age <= 120) setValue('ageAtDeath', String(age))
  }, [dateOfBirth, dateOfDeath, setValue])

  const domain = getDomain()
  const displaySlug = slug || '…'

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {[...Array(4)].map((_, i) => (
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {isEdit ? 'Edit Memorial' : 'Create a Memorial'}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {isEdit
            ? 'Update the memorial details below.'
            : 'Honour the life of your loved one. You can save a draft at any time.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onPublish)} noValidate className="space-y-6">
        {/* Photos */}
        <Section title="Photos">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Controller
              name="profilePhoto"
              control={control}
              render={({ field }) => (
                <PhotoUpload
                  label="Memorial Photo"
                  hint="Recommended 360×360px, up to 10MB"
                  value={field.value ?? null}
                  onChange={field.onChange}
                  error={errors.profilePhoto?.message as string | undefined}
                />
              )}
            />
            <Controller
              name="coverPhoto"
              control={control}
              render={({ field: coverField }) => (
                <Controller
                  name="coverGradient"
                  control={control}
                  render={({ field: gradField }) => (
                    <CoverPhotoField
                      coverPhoto={coverField.value ?? null}
                      onCoverPhotoChange={coverField.onChange}
                      coverGradient={gradField.value ?? 'blue'}
                      onGradientChange={gradField.onChange}
                    />
                  )}
                />
              )}
            />
          </div>
        </Section>

        {/* Personal Information */}
        <Section title="Personal Information">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* First Name */}
            <div>
              <FieldLabel htmlFor="firstName" required>First Name</FieldLabel>
              <input
                id="firstName"
                type="text"
                placeholder="Enter first name"
                className={inputClass}
                {...register('firstName')}
              />
              {errors.firstName && <ErrorMessage message={errors.firstName.message!} />}
            </div>

            {/* Last Name */}
            <div>
              <FieldLabel htmlFor="lastName" required>Last Name</FieldLabel>
              <input
                id="lastName"
                type="text"
                placeholder="Enter last name"
                className={inputClass}
                {...register('lastName')}
              />
              {errors.lastName && <ErrorMessage message={errors.lastName.message!} />}
            </div>

            {/* Date of Birth */}
            <div>
              <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
              <input
                id="dateOfBirth"
                type="date"
                className={inputClass}
                {...register('dateOfBirth')}
              />
              {errors.dateOfBirth && <ErrorMessage message={errors.dateOfBirth.message!} />}
            </div>

            {/* Date of Death */}
            <div>
              <FieldLabel htmlFor="dateOfDeath">Date of Death</FieldLabel>
              <input
                id="dateOfDeath"
                type="date"
                className={inputClass}
                {...register('dateOfDeath')}
              />
              {errors.dateOfDeath && <ErrorMessage message={errors.dateOfDeath.message!} />}
            </div>

            {/* Age at Death */}
            <div>
              <FieldLabel htmlFor="ageAtDeath">Age at Death</FieldLabel>
              <Controller
                name="ageAtDeath"
                control={control}
                render={({ field }) => (
                  <Select
                    id="ageAtDeath"
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    placeholder="Select age"
                    options={AGE_OPTIONS}
                  />
                )}
              />
            </div>

            {/* Gender */}
            <div>
              <FieldLabel htmlFor="gender" required>Gender</FieldLabel>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    id="gender"
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    placeholder="Select gender"
                    options={GENDER_OPTIONS}
                  />
                )}
              />
              {errors.gender && <ErrorMessage message={errors.gender.message!} />}
            </div>

            {/* Race / Ethnicity */}
            <div>
              <FieldLabel htmlFor="raceEthnicity" required>Race / Ethnicity</FieldLabel>
              <Controller
                name="raceEthnicity"
                control={control}
                render={({ field }) => (
                  <Select
                    id="raceEthnicity"
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    placeholder="Select race/ethnicity"
                    options={RACE_OPTIONS}
                  />
                )}
              />
              {errors.raceEthnicity && <ErrorMessage message={errors.raceEthnicity.message!} />}
            </div>

            {/* Country */}
            <div>
              <FieldLabel htmlFor="country" required>Country</FieldLabel>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select
                    id="country"
                    value={field.value ?? ''}
                    onValueChange={(val) => {
                      field.onChange(val)
                      // Reset state when country changes
                      setValue('state', '')
                    }}
                    placeholder="Select country"
                    options={countryOptions}
                  />
                )}
              />
              {errors.country && <ErrorMessage message={errors.country.message!} />}
            </div>

            {/* State (Malaysia only) */}
            <div>
              <FieldLabel htmlFor="state">State</FieldLabel>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Select
                    id="state"
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    placeholder={stateOptions.length > 0 ? 'Select state / province' : 'No states for this country'}
                    options={stateOptions}
                    disabled={stateOptions.length === 0}
                  />
                )}
              />
            </div>

            {/* Creator Relationship */}
            <div>
              <FieldLabel htmlFor="creatorRelationship">Your Relationship to the Deceased</FieldLabel>
              <Controller
                name="creatorRelationship"
                control={control}
                render={({ field }) => (
                  <Select
                    id="creatorRelationship"
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    placeholder="Select your relationship"
                    options={RELATIONSHIP_OPTIONS}
                  />
                )}
              />
            </div>
          </div>
        </Section>

        {/* Memorial Quote */}
        <Section title="Memorial Quote">
          <div>
            <FieldLabel htmlFor="quote">Quote</FieldLabel>
            <textarea
              id="quote"
              rows={3}
              maxLength={2000}
              placeholder="A meaningful quote to remember them by…"
              className={textareaClass}
              {...register('quote')}
            />
            <p className="mt-1 text-right text-xs text-neutral-400">{quote.length} / 2000</p>
            {errors.quote && <ErrorMessage message={errors.quote.message!} />}
          </div>
        </Section>

        {/* Memorial Message */}
        <Section title="Memorial Message">
          <div className="space-y-5">
            <div>
              <FieldLabel htmlFor="biography">Biography</FieldLabel>
              <textarea
                id="biography"
                rows={6}
                maxLength={4000}
                placeholder="Share the story of their life…"
                className={textareaClass}
                {...register('biography')}
              />
              <p className="mt-1 text-right text-xs text-neutral-400">{biography.length} / 4000</p>
              {errors.biography && <ErrorMessage message={errors.biography.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="tributeMessage">Tribute Message</FieldLabel>
              <textarea
                id="tributeMessage"
                rows={4}
                maxLength={1500}
                placeholder="A personal tribute from you…"
                className={textareaClass}
                {...register('tributeMessage')}
              />
              <p className="mt-1 text-right text-xs text-neutral-400">{tributeMessage.length} / 1500</p>
              {errors.tributeMessage && <ErrorMessage message={errors.tributeMessage.message!} />}
            </div>
          </div>
        </Section>

        {/* Photo Gallery */}
        <Section title="Photo Gallery">
          <Controller
            name="galleryPhotos"
            control={control}
            render={({ field }) => (
              <GalleryUpload
                values={field.value ?? []}
                onChange={field.onChange}
                max={5}
              />
            )}
          />
        </Section>

        {/* Web Address */}
        <Section title="Create Memorial Web Address">
          <div>
            <FieldLabel htmlFor="slug">Memorial URL</FieldLabel>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-sm text-neutral-500 dark:text-neutral-400 hidden sm:inline">
                {domain}/memorial/
              </span>
              <input
                id="slug"
                type="text"
                placeholder="memorial-web-address"
                className={`${inputClass} flex-1`}
                {...register('slug', {
                  onChange: (e) => {
                    // Sanitise as user types
                    const sanitised = sanitiseSlug(e.target.value)
                    setValue('slug', sanitised, { shouldValidate: true })
                  },
                })}
              />
            </div>
            <p className="mt-1.5 text-xs text-neutral-400 break-all">
              Preview: {domain}/memorial/{displaySlug}
            </p>
            {errors.slug && <ErrorMessage message={errors.slug.message!} />}
          </div>
        </Section>

        {/* Global mutation error */}
        {error && (
          <ErrorMessage message={error instanceof Error ? error.message : 'Something went wrong'} />
        )}

        {/* Bottom actions */}
        <div className="flex items-center justify-between gap-4 pb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isPending}
              className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-5 py-2.5 text-sm font-medium
                text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800
                disabled:opacity-50 transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => {
                const values = form.getValues()
                saveDraft(values)
                navigate('/dashboard/memorials/preview', { state: { values } })
              }}
              disabled={isPending}
              className="rounded-lg border border-brand-primary/30 px-5 py-2.5 text-sm font-medium
                text-brand-primary hover:bg-brand-primaryLight/40 dark:hover:bg-brand-primary/10
                disabled:opacity-50 transition-colors"
            >
              View Draft
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/memorials')}
              disabled={isPending}
              className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium
                text-white hover:bg-brand-primaryHover disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving…' : 'Publish Memorial'}
              {!isPending && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
