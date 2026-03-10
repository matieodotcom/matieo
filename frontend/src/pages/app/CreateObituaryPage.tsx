import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Plus, Trash2 } from 'lucide-react'
import { PhotoUpload } from '@/components/ui/PhotoUpload'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useObituaryForm } from '@/hooks/use-create-obituary'
import { buildCountryOptions, buildStateOptions, detectUserCountryCode } from '@/lib/geo'
import { CoverPhotoField } from '@/pages/app/CreateMemorialPage'
import { useObituaryDraftStore } from '@/store/obituaryDraftStore'

// ── Constants ─────────────────────────────────────────────────────────────────

const AGE_OPTIONS = Array.from({ length: 120 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}))

// GENDER_OPTIONS labels resolved via t() inside the component
const GENDER_OPTION_KEYS = [
  { value: 'male', tKey: 'form.gender_male' },
  { value: 'female', tKey: 'form.gender_female' },
  { value: 'non-binary', tKey: 'form.gender_nonBinary' },
  { value: 'prefer_not_to_say', tKey: 'form.gender_preferNotToSay' },
]

const RACE_OPTIONS = [
  { value: 'Afar', label: 'Afar' },
  { value: 'African', label: 'African' },
  { value: 'African American', label: 'African American' },
  { value: 'Akan', label: 'Akan' },
  { value: 'Arab', label: 'Arab' },
  { value: 'Asian', label: 'Asian' },
  { value: 'Azerbaijani', label: 'Azerbaijani' },
  { value: 'Bantu', label: 'Bantu' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Berber', label: 'Berber' },
  { value: 'Bosnian', label: 'Bosnian' },
  { value: 'Brazilian', label: 'Brazilian' },
  { value: 'British', label: 'British' },
  { value: 'Burmese', label: 'Burmese' },
  { value: 'Cambodian', label: 'Cambodian' },
  { value: 'Caribbean', label: 'Caribbean' },
  { value: 'Caucasian', label: 'Caucasian' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Colombian', label: 'Colombian' },
  { value: 'Congolese', label: 'Congolese' },
  { value: 'Croatian', label: 'Croatian' },
  { value: 'Dutch', label: 'Dutch' },
  { value: 'Egyptian', label: 'Egyptian' },
  { value: 'Ethiopian', label: 'Ethiopian' },
  { value: 'Filipino', label: 'Filipino' },
  { value: 'Finnish', label: 'Finnish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Ghanaian', label: 'Ghanaian' },
  { value: 'Greek', label: 'Greek' },
  { value: 'Gujarati', label: 'Gujarati' },
  { value: 'Hausa', label: 'Hausa' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Hispanic', label: 'Hispanic' },
  { value: 'Hmong', label: 'Hmong' },
  { value: 'Hungarian', label: 'Hungarian' },
  { value: 'Igbo', label: 'Igbo' },
  { value: 'Indian', label: 'Indian' },
  { value: 'Indigenous Australian', label: 'Indigenous Australian' },
  { value: 'Indonesian', label: 'Indonesian' },
  { value: 'Iranian', label: 'Iranian' },
  { value: 'Iraqi', label: 'Iraqi' },
  { value: 'Irish', label: 'Irish' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Javanese', label: 'Javanese' },
  { value: 'Jewish', label: 'Jewish' },
  { value: 'Jordanian', label: 'Jordanian' },
  { value: 'Kazakh', label: 'Kazakh' },
  { value: 'Kenyan', label: 'Kenyan' },
  { value: 'Khmer', label: 'Khmer' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Kurdish', label: 'Kurdish' },
  { value: 'Latin American', label: 'Latin American' },
  { value: 'Lebanese', label: 'Lebanese' },
  { value: 'Malay', label: 'Malay' },
  { value: 'Mexican', label: 'Mexican' },
  { value: 'Mongolian', label: 'Mongolian' },
  { value: 'Moroccan', label: 'Moroccan' },
  { value: 'Native American', label: 'Native American' },
  { value: 'Nepalese', label: 'Nepalese' },
  { value: 'Nigerian', label: 'Nigerian' },
  { value: 'Norwegian', label: 'Norwegian' },
  { value: 'Pakistani', label: 'Pakistani' },
  { value: 'Palestinian', label: 'Palestinian' },
  { value: 'Persian', label: 'Persian' },
  { value: 'Polish', label: 'Polish' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Punjabi', label: 'Punjabi' },
  { value: 'Romanian', label: 'Romanian' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Rwandan', label: 'Rwandan' },
  { value: 'Saudi Arabian', label: 'Saudi Arabian' },
  { value: 'Senegalese', label: 'Senegalese' },
  { value: 'Serbian', label: 'Serbian' },
  { value: 'Sinhalese', label: 'Sinhalese' },
  { value: 'Somali', label: 'Somali' },
  { value: 'South African', label: 'South African' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Sri Lankan', label: 'Sri Lankan' },
  { value: 'Sudanese', label: 'Sudanese' },
  { value: 'Swedish', label: 'Swedish' },
  { value: 'Swahili', label: 'Swahili' },
  { value: 'Syrian', label: 'Syrian' },
  { value: 'Taiwanese', label: 'Taiwanese' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Tibetan', label: 'Tibetan' },
  { value: 'Turkish', label: 'Turkish' },
  { value: 'Ukrainian', label: 'Ukrainian' },
  { value: 'Uzbek', label: 'Uzbek' },
  { value: 'Vietnamese', label: 'Vietnamese' },
  { value: 'Yoruba', label: 'Yoruba' },
  { value: 'Zulu', label: 'Zulu' },
  { value: 'Other', label: 'Other' },
]

const CAUSE_OF_PASSING_OPTIONS = [
  { value: 'Natural causes', label: 'Natural causes' },
  { value: 'Heart disease', label: 'Heart disease' },
  { value: 'Cancer', label: 'Cancer' },
  { value: 'Stroke', label: 'Stroke' },
  { value: 'Respiratory disease', label: 'Respiratory disease' },
  { value: 'Diabetes', label: 'Diabetes' },
  { value: "Alzheimer's", label: "Alzheimer's" },
  { value: 'Influenza/Pneumonia', label: 'Influenza/Pneumonia' },
  { value: 'Kidney disease', label: 'Kidney disease' },
  { value: 'Liver disease', label: 'Liver disease' },
  { value: 'Accident', label: 'Accident' },
  { value: 'Suicide', label: 'Suicide' },
  { value: 'Homicide', label: 'Homicide' },
  { value: 'Other', label: 'Other' },
]

const PLACE_OF_DEATH_OPTIONS = [
  { value: 'Hospital', label: 'Hospital' },
  { value: 'Home', label: 'Home' },
  { value: 'Nursing home', label: 'Nursing home' },
  { value: 'Hospice', label: 'Hospice' },
  { value: 'Other', label: 'Other' },
]

const RELATIONSHIP_OPTIONS = [
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Child', label: 'Child' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Grandparent', label: 'Grandparent' },
  { value: 'Grandchild', label: 'Grandchild' },
  { value: 'Aunt/Uncle', label: 'Aunt/Uncle' },
  { value: 'Niece/Nephew', label: 'Niece/Nephew' },
  { value: 'Cousin', label: 'Cousin' },
  { value: 'Friend', label: 'Friend' },
  { value: 'Other', label: 'Other' },
]

// ── Time options (every 30 min, 6 AM – 11:30 PM) ─────────────────────────────

const TIME_OPTIONS = Array.from({ length: 36 }, (_, i) => {
  const totalMinutes = 360 + i * 30 // start at 06:00
  const h24 = Math.floor(totalMinutes / 60)
  const min = totalMinutes % 60
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  const ampm = h24 < 12 ? 'AM' : 'PM'
  const value = `${String(h24).padStart(2, '0')}:${String(min).padStart(2, '0')}`
  const label = `${h12}:${String(min).padStart(2, '0')} ${ampm}`
  return { value, label }
})

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
      <h2 className="mb-5 text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
      {subtitle && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-3 mb-4">{subtitle}</p>
      )}
      {children}
    </section>
  )
}

// ── Field label ───────────────────────────────────────────────────────────────

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
      {children}
      {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
    </label>
  )
}

// ── Input class ───────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors'

const textareaClass = `${inputClass} resize-none`

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CreateObituaryPage() {
  const { t } = useTranslation()
  const { id: obituaryId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    form,
    familyMembersField,
    onSaveDraft,
    onPublish,
    isPending,
    isLoading,
    isEdit,
    error,
  } = useObituaryForm(obituaryId)

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
    handleSubmit,
  } = form

  const country = watch('country')
  const dateOfBirth = watch('dateOfBirth')
  const dateOfDeath = watch('dateOfDeath')
  const biographyValue = watch('biography') ?? ''

  const [countryOptions, setCountryOptions] = useState(() => buildCountryOptions(null))
  const storedGradient = useObituaryDraftStore((s) => s.coverGradient)
  const saveDraftStore = useObituaryDraftStore((s) => s.saveDraft)
  const [coverGradient, setCoverGradient] = useState(storedGradient)

  useEffect(() => {
    detectUserCountryCode().then((code) => {
      if (code) setCountryOptions(buildCountryOptions(code))
    })
  }, [])

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

  const stateOptions = useMemo(() => buildStateOptions(country ?? ''), [country])
  const genderOptions = GENDER_OPTION_KEYS.map(({ value, tKey }) => ({ value, label: t(tKey) }))

  if (isLoading) {
    return (
      <div className="py-8 space-y-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 animate-pulse space-y-3"
          >
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
          {isEdit ? t('createObituary.editHeading') : t('createObituary.heading')}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {t('createObituary.subheading')}
        </p>
      </div>

      {error && <ErrorMessage message={error.message} />}

      <form onSubmit={handleSubmit(onPublish)} noValidate className="space-y-6">

        {/* ── Photos ── */}
        <Section title={t('createObituary.sectionPhotos')}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Obituary Photo */}
            <div className="w-full sm:w-[360px] sm:shrink-0">
              <Controller
                control={control}
                name="profilePhoto"
                render={({ field }) => (
                  <PhotoUpload
                    label={t('createObituary.fieldObitPhoto')}
                    hint={t('createMemorial.photoHint')}
                    value={field.value ?? null}
                    onChange={field.onChange}
                    uploadAreaClassName="h-48 sm:h-[360px]"
                    error={errors.profilePhoto?.message as string | undefined}
                  />
                )}
              />
            </div>

            {/* Cover Photo + Gradient */}
            <div className="min-w-0 flex-1">
              <Controller
                control={control}
                name="coverPhoto"
                render={({ field }) => (
                  <CoverPhotoField
                    coverPhoto={field.value ?? null}
                    onCoverPhotoChange={field.onChange}
                    coverGradient={coverGradient}
                    onGradientChange={setCoverGradient}
                  />
                )}
              />
            </div>
          </div>
        </Section>

        {/* ── Personal Information ── */}
        <Section title={t('createObituary.sectionPersonalInfo')}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="firstName" required>{t('form.firstName')}</FieldLabel>
              <input
                id="firstName"
                type="text"
                placeholder={t('form.firstName')}
                className={inputClass}
                {...register('firstName')}
              />
              {errors.firstName && <ErrorMessage message={errors.firstName.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="lastName" required>{t('form.lastName')}</FieldLabel>
              <input
                id="lastName"
                type="text"
                placeholder={t('form.lastName')}
                className={inputClass}
                {...register('lastName')}
              />
              {errors.lastName && <ErrorMessage message={errors.lastName.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="dateOfBirth">{t('form.dateOfBirth')}</FieldLabel>
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <DatePicker
                    id="dateOfBirth"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    disableFuture
                  />
                )}
              />
              {errors.dateOfBirth && <ErrorMessage message={errors.dateOfBirth.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="dateOfDeath" required>{t('form.dateOfDeath')}</FieldLabel>
              <Controller
                control={control}
                name="dateOfDeath"
                render={({ field }) => (
                  <DatePicker
                    id="dateOfDeath"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    disableFuture
                  />
                )}
              />
              {errors.dateOfDeath && <ErrorMessage message={errors.dateOfDeath.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="ageAtDeath">{t('form.ageAtDeath')}</FieldLabel>
              <Controller
                control={control}
                name="ageAtDeath"
                render={({ field }) => (
                  <Select
                    id="ageAtDeath"
                    placeholder={t('form.selectAge')}
                    options={AGE_OPTIONS}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  />
                )}
              />
              {errors.ageAtDeath && <ErrorMessage message={errors.ageAtDeath.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="country" required>{t('form.country')}</FieldLabel>
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <Select
                    id="country"
                    placeholder={t('form.selectCountry')}
                    options={countryOptions}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  />
                )}
              />
              {errors.country && <ErrorMessage message={errors.country.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="state">{t('form.state')}</FieldLabel>
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <Select
                    id="state"
                    placeholder={stateOptions.length > 0 ? t('form.selectState') : t('form.noStates')}
                    options={stateOptions}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={stateOptions.length === 0}
                  />
                )}
              />
              {errors.state && <ErrorMessage message={errors.state.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="placeOfDeath" required>{t('createObituary.fieldPlaceOfDeath')}</FieldLabel>
              <Controller
                control={control}
                name="placeOfDeath"
                render={({ field }) => (
                  <Select
                    id="placeOfDeath"
                    placeholder={t('createObituary.selectPlaceOfDeath')}
                    options={PLACE_OF_DEATH_OPTIONS}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  />
                )}
              />
              {errors.placeOfDeath && <ErrorMessage message={errors.placeOfDeath.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="gender" required>{t('form.gender')}</FieldLabel>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select
                    id="gender"
                    placeholder={t('form.selectGender')}
                    options={genderOptions}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  />
                )}
              />
              {errors.gender && <ErrorMessage message={errors.gender.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="raceEthnicity" required>{t('form.raceEthnicity')}</FieldLabel>
              <Controller
                control={control}
                name="raceEthnicity"
                render={({ field }) => (
                  <Select
                    id="raceEthnicity"
                    placeholder={t('form.selectRace')}
                    options={RACE_OPTIONS}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  />
                )}
              />
              {errors.raceEthnicity && <ErrorMessage message={errors.raceEthnicity.message!} />}
            </div>
          </div>
        </Section>

        {/* ── Cause of Passing (Private) ── */}
        <Section title={t('createObituary.sectionCauseOfPassing')}>
          <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-700">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t('createObituary.causePrivateNote')}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="causeOfPassing">{t('createObituary.fieldCauseOfPassing')}</FieldLabel>
              <Controller
                control={control}
                name="causeOfPassing"
                render={({ field }) => (
                  <Select
                    id="causeOfPassing"
                    placeholder={t('createObituary.selectCauseOfPassing')}
                    options={CAUSE_OF_PASSING_OPTIONS}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  />
                )}
              />
              {errors.causeOfPassing && <ErrorMessage message={errors.causeOfPassing.message!} />}
            </div>

            <div className="flex items-start gap-2">
              <input
                id="causeOfPassingConsented"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-brand-primary focus:ring-brand-primary"
                {...register('causeOfPassingConsented')}
              />
              <label
                htmlFor="causeOfPassingConsented"
                className="text-sm text-neutral-600 dark:text-neutral-400"
              >
                {t('createObituary.consentLabel')}
              </label>
            </div>
          </div>
        </Section>

        {/* ── Funeral/Prayers Details ── */}
        <Section
          title={t('createObituary.sectionFuneral')}
          subtitle={t('createObituary.sectionFuneralSubtitle')}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="funeralName">{t('createObituary.funeralName')}</FieldLabel>
              <input
                id="funeralName"
                type="text"
                placeholder={t('createObituary.funeralPlaceholder')}
                className={inputClass}
                {...register('funeralName')}
              />
              {errors.funeralName && <ErrorMessage message={errors.funeralName.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="funeralLocation">{t('createObituary.funeralLocation')}</FieldLabel>
              <input
                id="funeralLocation"
                type="text"
                placeholder={t('form.addressOrCity')}
                className={inputClass}
                {...register('funeralLocation')}
              />
              {errors.funeralLocation && <ErrorMessage message={errors.funeralLocation.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="funeralDate">{t('createObituary.funeralDate')}</FieldLabel>
              <Controller
                control={control}
                name="funeralDate"
                render={({ field }) => (
                  <DatePicker
                    id="funeralDate"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.funeralDate && <ErrorMessage message={errors.funeralDate.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="funeralTime">{t('createObituary.funeralTime')}</FieldLabel>
              <Controller
                control={control}
                name="funeralTime"
                render={({ field }) => (
                  <Select
                    id="funeralTime"
                    placeholder={t('form.selectTime')}
                    options={TIME_OPTIONS}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  />
                )}
              />
              {errors.funeralTime && <ErrorMessage message={errors.funeralTime.message!} />}
            </div>

            <div className="sm:col-span-2">
              <FieldLabel htmlFor="funeralNote">{t('createObituary.funeralNote')}</FieldLabel>
              <textarea
                id="funeralNote"
                rows={3}
                placeholder={t('createObituary.funeralNotePlaceholder')}
                className={textareaClass}
                {...register('funeralNote')}
              />
              {errors.funeralNote && <ErrorMessage message={errors.funeralNote.message!} />}
            </div>
          </div>
        </Section>

        {/* ── Burial Details ── */}
        <Section title={t('createObituary.sectionBurial')}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="burialCenterName">{t('createObituary.burialCenterName')}</FieldLabel>
              <input
                id="burialCenterName"
                type="text"
                placeholder={t('createObituary.burialCenterPlaceholder')}
                className={inputClass}
                {...register('burialCenterName')}
              />
              {errors.burialCenterName && <ErrorMessage message={errors.burialCenterName.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="burialLocation">{t('createObituary.burialLocation')}</FieldLabel>
              <input
                id="burialLocation"
                type="text"
                placeholder={t('form.addressOrCity')}
                className={inputClass}
                {...register('burialLocation')}
              />
              {errors.burialLocation && <ErrorMessage message={errors.burialLocation.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="burialDate">{t('createObituary.burialDate')}</FieldLabel>
              <Controller
                control={control}
                name="burialDate"
                render={({ field }) => (
                  <DatePicker
                    id="burialDate"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.burialDate && <ErrorMessage message={errors.burialDate.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="burialTime">{t('createObituary.burialTime')}</FieldLabel>
              <Controller
                control={control}
                name="burialTime"
                render={({ field }) => (
                  <Select
                    id="burialTime"
                    placeholder={t('form.selectTime')}
                    options={TIME_OPTIONS}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  />
                )}
              />
              {errors.burialTime && <ErrorMessage message={errors.burialTime.message!} />}
            </div>

            <div className="sm:col-span-2">
              <FieldLabel htmlFor="burialNote">{t('createObituary.burialNote')}</FieldLabel>
              <textarea
                id="burialNote"
                rows={3}
                placeholder={t('createObituary.burialNotePlaceholder')}
                className={textareaClass}
                {...register('burialNote')}
              />
              {errors.burialNote && <ErrorMessage message={errors.burialNote.message!} />}
            </div>
          </div>
        </Section>

        {/* ── Contact Person ── */}
        <Section title={t('createObituary.sectionContact')}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="contactPersonName" required>{t('createObituary.contactName')}</FieldLabel>
              <input
                id="contactPersonName"
                type="text"
                placeholder={t('createObituary.contactNamePlaceholder')}
                className={inputClass}
                {...register('contactPersonName')}
              />
              {errors.contactPersonName && <ErrorMessage message={errors.contactPersonName.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="contactPersonRelationship" required>{t('createObituary.contactRelationship')}</FieldLabel>
              <Controller
                control={control}
                name="contactPersonRelationship"
                render={({ field }) => (
                  <Select
                    id="contactPersonRelationship"
                    placeholder={t('form.selectRelationship')}
                    options={RELATIONSHIP_OPTIONS}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  />
                )}
              />
              {errors.contactPersonRelationship && <ErrorMessage message={errors.contactPersonRelationship.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="contactPersonPhone" required>{t('createObituary.contactPhone')}</FieldLabel>
              <input
                id="contactPersonPhone"
                type="tel"
                placeholder="+1 234 567 8900"
                className={inputClass}
                {...register('contactPersonPhone')}
              />
              {errors.contactPersonPhone && <ErrorMessage message={errors.contactPersonPhone.message!} />}
            </div>

            <div>
              <FieldLabel htmlFor="contactPersonEmail">{t('createObituary.contactEmail')}</FieldLabel>
              <input
                id="contactPersonEmail"
                type="email"
                placeholder="email@example.com"
                className={inputClass}
                {...register('contactPersonEmail')}
              />
              {errors.contactPersonEmail && <ErrorMessage message={errors.contactPersonEmail.message!} />}
            </div>
          </div>
        </Section>

        {/* ── Family Members ── */}
        <Section title={t('createObituary.sectionFamily')}>
          <div className="space-y-3">
            {familyMembersField.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`familyMembers.${index}.name`}
                      className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
                    >
                      {t('createObituary.memberName')}
                    </label>
                    <input
                      id={`familyMembers.${index}.name`}
                      type="text"
                      placeholder={t('createObituary.memberNamePlaceholder')}
                      className={inputClass}
                      {...register(`familyMembers.${index}.name`)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`familyMembers.${index}.relationship`}
                      className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
                    >
                      {t('createObituary.memberRelationship')}
                    </label>
                    <Controller
                      control={control}
                      name={`familyMembers.${index}.relationship`}
                      render={({ field: f }) => (
                        <Select
                          id={`familyMembers.${index}.relationship`}
                          placeholder={t('form.selectRelationship')}
                          options={RELATIONSHIP_OPTIONS}
                          value={f.value ?? ''}
                          onValueChange={f.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => familyMembersField.remove(index)}
                  aria-label={t('createObituary.removeMember')}
                  className="mt-6 flex h-10 w-10 items-center justify-center rounded-lg text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => familyMembersField.append({ name: '', relationship: '' })}
              className="flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-primaryHover transition-colors"
            >
              <Plus size={15} />
              {t('createObituary.addMember')}
            </button>
          </div>
        </Section>

        {/* ── Memorial Message ── */}
        <Section title={t('createObituary.sectionMessage')}>
          <div>
            <FieldLabel htmlFor="biography">{t('form.biography')}</FieldLabel>
            <textarea
              id="biography"
              rows={6}
              maxLength={4000}
              placeholder={t('createObituary.biographyPlaceholder')}
              className={textareaClass}
              {...register('biography')}
            />
            <p className="mt-1 text-right text-xs text-neutral-400">{biographyValue.length} / 4000</p>
            {errors.biography && <ErrorMessage message={errors.biography.message!} />}
          </div>
        </Section>

        {/* ── Death Certificate ── */}
        <Section title={t('createObituary.sectionDeathCert')}>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            {t('createObituary.deathCertDesc')}
          </p>
          <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-700">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t('createObituary.deathCertPrivateNote')}
            </p>
          </div>
          <Controller
            control={control}
            name="deathCertPhoto"
            render={({ field }) => (
              <PhotoUpload
                value={field.value ?? null}
                onChange={field.onChange}
                aspect={undefined}
                uploadPreset="obituary_documents"
                label={t('createObituary.deathCertUpload')}
              />
            )}
          />
        </Section>

        {/* ── Footer ── */}
        <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Mobile: Publish first (primary CTA) */}
          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 py-3 text-sm font-medium
              text-white hover:bg-brand-primaryHover disabled:opacity-50 transition-colors sm:hidden"
          >
            {isPending ? t('form.saving') : isEdit ? t('createObituary.updateBtn') : t('createObituary.publishBtn')}
            {!isPending && <ArrowRight className="h-4 w-4" />}
          </button>

          {/* Secondary actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isPending}
              className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 px-5 py-2.5 text-sm font-medium
                text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800
                disabled:opacity-50 transition-colors sm:flex-none"
            >
              {t('form.saveDraft')}
            </button>
            <button
              type="button"
              onClick={() => {
                const values = form.getValues()
                saveDraftStore(values, coverGradient)
                navigate('/dashboard/obituary/preview', { state: { values, coverGradient } })
              }}
              disabled={isPending}
              className="flex-1 rounded-lg border border-brand-primary/30 px-5 py-2.5 text-sm font-medium
                text-brand-primary hover:bg-brand-primaryLight/40 dark:hover:bg-brand-primary/10
                disabled:opacity-50 transition-colors sm:flex-none"
            >
              {t('form.preview')}
            </button>
          </div>

          {/* Cancel + Desktop Publish */}
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <button
              type="button"
              onClick={() => navigate('/dashboard/obituary')}
              disabled={isPending}
              className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="hidden sm:flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium
                text-white hover:bg-brand-primaryHover disabled:opacity-50 transition-colors"
            >
              {isPending ? t('form.saving') : isEdit ? t('createObituary.updateBtn') : t('createObituary.publishBtn')}
              {!isPending && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
