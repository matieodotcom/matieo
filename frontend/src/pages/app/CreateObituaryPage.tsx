import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { PhotoUpload } from '@/components/ui/PhotoUpload'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useObituaryForm } from '@/hooks/use-create-obituary'
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

// ── Section card wrapper ───────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-6">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{title}</h2>
      {subtitle && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

// ── Text input ────────────────────────────────────────────────────────────────

const inputClass =
  'w-full px-3 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent'

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CreateObituaryPage() {
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
    formState: { errors },
    handleSubmit,
  } = form

  const country = watch('country')
  const biographyValue = watch('biography') ?? ''

  const [countryOptions, setCountryOptions] = useState(() => buildCountryOptions(null))

  useEffect(() => {
    detectUserCountryCode().then((code) => {
      if (code) setCountryOptions(buildCountryOptions(code))
    })
  }, [])

  const stateOptions = useMemo(() => buildStateOptions(country ?? ''), [country])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-pulse rounded-full bg-brand-primaryLight" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {isEdit ? 'Edit Obituary' : "Let's create an online obituary"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          We are deeply sorry for your loss and are committed to helping you create a beautiful obituary.
        </p>
      </div>

      {error && <ErrorMessage message={error.message} />}

      <form onSubmit={handleSubmit(onPublish)} noValidate className="space-y-6">

        {/* ── Photos ── */}
        <SectionCard title="Photos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Obituary Photo */}
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Obituary Photo
                <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-3">360×360px, PNG/JPG up to 10MB</p>
              <Controller
                control={control}
                name="profilePhoto"
                render={({ field }) => (
                  <PhotoUpload
                    value={field.value ?? null}
                    onChange={field.onChange}
                    aspect={1}
                    uploadPreset="obituary_profile"
                  />
                )}
              />
              {errors.profilePhoto && (
                <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.profilePhoto.message as string}
                </p>
              )}
            </div>

            {/* Cover Photo */}
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Upload Cover Photo
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-3">1296×282px, PNG/JPG up to 10MB</p>
              <Controller
                control={control}
                name="coverPhoto"
                render={({ field }) => (
                  <PhotoUpload
                    value={field.value ?? null}
                    onChange={field.onChange}
                    aspect={1296 / 282}
                    uploadPreset="obituary_cover"
                  />
                )}
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Personal Information ── */}
        <SectionCard title="Personal Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="firstName" label="First Name" required error={errors.firstName?.message}>
              <input
                id="firstName"
                type="text"
                placeholder="First name"
                className={inputClass}
                {...register('firstName')}
              />
            </Field>

            <Field id="lastName" label="Last Name" required error={errors.lastName?.message}>
              <input
                id="lastName"
                type="text"
                placeholder="Last name"
                className={inputClass}
                {...register('lastName')}
              />
            </Field>

            <Field id="dateOfBirth" label="Date of Birth" error={errors.dateOfBirth?.message}>
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <DatePicker
                    id="dateOfBirth"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

            <Field id="ageAtDeath" label="Age of Death" required error={errors.ageAtDeath?.message}>
              <Controller
                control={control}
                name="ageAtDeath"
                render={({ field }) => (
                  <Select
                    id="ageAtDeath"
                    placeholder="Select age"
                    options={AGE_OPTIONS}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

            <Field id="dateOfDeath" label="Date of Death" required error={errors.dateOfDeath?.message}>
              <Controller
                control={control}
                name="dateOfDeath"
                render={({ field }) => (
                  <DatePicker
                    id="dateOfDeath"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

            <Field id="country" label="Country" required error={errors.country?.message}>
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <Select
                    id="country"
                    placeholder="Select country"
                    options={countryOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

            <Field id="state" label="State" error={errors.state?.message}>
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <Select
                    id="state"
                    placeholder="Select state"
                    options={stateOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

            <Field id="placeOfDeath" label="Place of Death" required error={errors.placeOfDeath?.message}>
              <Controller
                control={control}
                name="placeOfDeath"
                render={({ field }) => (
                  <Select
                    id="placeOfDeath"
                    placeholder="Select place of death"
                    options={PLACE_OF_DEATH_OPTIONS}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

            <Field id="gender" label="Gender" required error={errors.gender?.message}>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select
                    id="gender"
                    placeholder="Select gender"
                    options={GENDER_OPTIONS}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

            <Field id="raceEthnicity" label="Race/Ethnicity" required error={errors.raceEthnicity?.message}>
              <Controller
                control={control}
                name="raceEthnicity"
                render={({ field }) => (
                  <Select
                    id="raceEthnicity"
                    placeholder="Select race/ethnicity"
                    options={RACE_OPTIONS}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ── Cause of Passing (Private) ── */}
        <SectionCard title="Cause of Passing (Optional)">
          <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-700">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              This information will never appear on the public obituary. With consent, it may be used anonymously for insights.
            </p>
          </div>
          <div className="space-y-4">
            <Field id="causeOfPassing" label="Cause of Passing" error={errors.causeOfPassing?.message}>
              <Controller
                control={control}
                name="causeOfPassing"
                render={({ field }) => (
                  <Select
                    id="causeOfPassing"
                    placeholder="Select cause of passing"
                    options={CAUSE_OF_PASSING_OPTIONS}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

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
                I consent to this information being used anonymously for mortality insights research
              </label>
            </div>
          </div>
        </SectionCard>

        {/* ── Funeral/Prayers Details ── */}
        <SectionCard
          title="Funeral/Prayers Details (Optional)"
          subtitle="Resident, religious home, funeral center, etc."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="funeralName" label="Name" error={errors.funeralName?.message}>
              <input
                id="funeralName"
                type="text"
                placeholder="e.g. Grace Memorial Chapel"
                className={inputClass}
                {...register('funeralName')}
              />
            </Field>

            <Field id="funeralLocation" label="Location" error={errors.funeralLocation?.message}>
              <input
                id="funeralLocation"
                type="text"
                placeholder="Address or city"
                className={inputClass}
                {...register('funeralLocation')}
              />
            </Field>

            <Field id="funeralDate" label="Date" error={errors.funeralDate?.message}>
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
            </Field>

            <Field id="funeralTime" label="Time" error={errors.funeralTime?.message}>
              <input
                id="funeralTime"
                type="time"
                className={inputClass}
                {...register('funeralTime')}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field id="funeralNote" label="Note" error={errors.funeralNote?.message}>
                <textarea
                  id="funeralNote"
                  rows={3}
                  placeholder="Additional notes about the funeral service..."
                  className={`${inputClass} resize-none`}
                  {...register('funeralNote')}
                />
              </Field>
            </div>
          </div>
        </SectionCard>

        {/* ── Burial Details ── */}
        <SectionCard title="Burial Details (Optional)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="burialCenterName" label="Burial Center Name" error={errors.burialCenterName?.message}>
              <input
                id="burialCenterName"
                type="text"
                placeholder="Cemetery or burial center name"
                className={inputClass}
                {...register('burialCenterName')}
              />
            </Field>

            <Field id="burialLocation" label="Location" error={errors.burialLocation?.message}>
              <input
                id="burialLocation"
                type="text"
                placeholder="Address or city"
                className={inputClass}
                {...register('burialLocation')}
              />
            </Field>

            <Field id="burialDate" label="Burial Date" error={errors.burialDate?.message}>
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
            </Field>

            <Field id="burialTime" label="Burial Time" error={errors.burialTime?.message}>
              <input
                id="burialTime"
                type="time"
                className={inputClass}
                {...register('burialTime')}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field id="burialNote" label="Note" error={errors.burialNote?.message}>
                <textarea
                  id="burialNote"
                  rows={3}
                  placeholder="Additional notes about the burial..."
                  className={`${inputClass} resize-none`}
                  {...register('burialNote')}
                />
              </Field>
            </div>
          </div>
        </SectionCard>

        {/* ── Contact Person ── */}
        <SectionCard title="Contact Person">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="contactPersonName" label="Name" required error={errors.contactPersonName?.message}>
              <input
                id="contactPersonName"
                type="text"
                placeholder="Contact person's full name"
                className={inputClass}
                {...register('contactPersonName')}
              />
            </Field>

            <Field id="contactPersonRelationship" label="Relationship" required error={errors.contactPersonRelationship?.message}>
              <Controller
                control={control}
                name="contactPersonRelationship"
                render={({ field }) => (
                  <Select
                    id="contactPersonRelationship"
                    placeholder="Select relationship"
                    options={RELATIONSHIP_OPTIONS}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

            <Field id="contactPersonPhone" label="Phone Number" required error={errors.contactPersonPhone?.message}>
              <input
                id="contactPersonPhone"
                type="tel"
                placeholder="+1 234 567 8900"
                className={inputClass}
                {...register('contactPersonPhone')}
              />
            </Field>

            <Field id="contactPersonEmail" label="Email Address" error={errors.contactPersonEmail?.message}>
              <input
                id="contactPersonEmail"
                type="email"
                placeholder="email@example.com"
                className={inputClass}
                {...register('contactPersonEmail')}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ── Family Members ── */}
        <SectionCard title="Family Members (Optional)">
          <div className="space-y-3">
            {familyMembersField.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor={`familyMembers.${index}.name`}
                      className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1"
                    >
                      Name
                    </label>
                    <input
                      id={`familyMembers.${index}.name`}
                      type="text"
                      placeholder="Family member name"
                      className={inputClass}
                      {...register(`familyMembers.${index}.name`)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`familyMembers.${index}.relationship`}
                      className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1"
                    >
                      Relationship
                    </label>
                    <Controller
                      control={control}
                      name={`familyMembers.${index}.relationship`}
                      render={({ field: f }) => (
                        <Select
                          id={`familyMembers.${index}.relationship`}
                          placeholder="Select relationship"
                          options={RELATIONSHIP_OPTIONS}
                          value={f.value ?? ''}
                          onChange={f.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => familyMembersField.remove(index)}
                  aria-label="Remove family member"
                  className="mt-6 flex items-center justify-center h-10 w-10 rounded-lg text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
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
              Add Family Member
            </button>
          </div>
        </SectionCard>

        {/* ── Memorial Message ── */}
        <SectionCard title="Memorial Message (Optional)">
          <Field id="biography" label="Biography" error={errors.biography?.message}>
            <textarea
              id="biography"
              rows={6}
              placeholder="Share the life story, memories, and legacy of your loved one..."
              className={`${inputClass} resize-none`}
              {...register('biography')}
            />
            <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500 text-right">
              {biographyValue.length} / 4000
            </p>
          </Field>
        </SectionCard>

        {/* ── Death Certificate ── */}
        <SectionCard title="Death Certificate (Optional)">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Upload a copy of the death certificate for verification purposes
          </p>
          <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-700">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              This document will be kept private and used only for verification purposes.
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
                label="Upload death certificate (PDF, PNG, JPG up to 10MB)"
              />
            )}
          />
        </SectionCard>

        {/* ── Footer ── */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate('/dashboard/obituary')}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isPending}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save as Draft
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primaryHover rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving…' : isEdit ? 'Update Obituary' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  )
}
