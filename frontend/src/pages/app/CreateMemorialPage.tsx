import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller } from 'react-hook-form'
import { ArrowRight, Check, X } from 'lucide-react'
import { PhotoUpload, GalleryUpload } from '@/components/ui/PhotoUpload'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
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
  { value: 'Afar', label: 'Afar' },
  { value: 'African', label: 'African' },
  { value: 'African American', label: 'African American' },
  { value: 'Afrikaner', label: 'Afrikaner' },
  { value: 'Akan', label: 'Akan' },
  { value: 'Algerian', label: 'Algerian' },
  { value: 'Amhara', label: 'Amhara' },
  { value: 'Angolan', label: 'Angolan' },
  { value: 'Berber', label: 'Berber' },
  { value: 'Cameroonian', label: 'Cameroonian' },
  { value: 'Congolese', label: 'Congolese' },
  { value: 'Egyptian', label: 'Egyptian' },
  { value: 'Ethiopian', label: 'Ethiopian' },
  { value: 'Ghanaian', label: 'Ghanaian' },
  { value: 'Hausa', label: 'Hausa' },
  { value: 'Igbo', label: 'Igbo' },
  { value: 'Ivorian', label: 'Ivorian' },
  { value: 'Kenyan', label: 'Kenyan' },
  { value: 'Libyan', label: 'Libyan' },
  { value: 'Malagasy', label: 'Malagasy' },
  { value: 'Malian', label: 'Malian' },
  { value: 'Maasai', label: 'Maasai' },
  { value: 'Mauritian', label: 'Mauritian' },
  { value: 'Moroccan', label: 'Moroccan' },
  { value: 'Mozambican', label: 'Mozambican' },
  { value: 'Namibian', label: 'Namibian' },
  { value: 'Nigerian', label: 'Nigerian' },
  { value: 'Oromo', label: 'Oromo' },
  { value: 'Rwandan', label: 'Rwandan' },
  { value: 'Senegalese', label: 'Senegalese' },
  { value: 'Shona', label: 'Shona' },
  { value: 'Somali', label: 'Somali' },
  { value: 'Sudanese', label: 'Sudanese' },
  { value: 'Swahili', label: 'Swahili' },
  { value: 'Tanzanian', label: 'Tanzanian' },
  { value: 'Tigrinya', label: 'Tigrinya' },
  { value: 'Tunisian', label: 'Tunisian' },
  { value: 'Ugandan', label: 'Ugandan' },
  { value: 'Wolof', label: 'Wolof' },
  { value: 'Xhosa', label: 'Xhosa' },
  { value: 'Yoruba', label: 'Yoruba' },
  { value: 'Zambian', label: 'Zambian' },
  { value: 'Zimbabwean', label: 'Zimbabwean' },
  { value: 'Zulu', label: 'Zulu' },

  // Americas
  { value: 'Afro-Caribbean', label: 'Afro-Caribbean' },
  { value: 'Argentinian', label: 'Argentinian' },
  { value: 'Bolivian', label: 'Bolivian' },
  { value: 'Brazilian', label: 'Brazilian' },
  { value: 'Canadian', label: 'Canadian' },
  { value: 'Chilean', label: 'Chilean' },
  { value: 'Colombian', label: 'Colombian' },
  { value: 'Costa Rican', label: 'Costa Rican' },
  { value: 'Cuban', label: 'Cuban' },
  { value: 'Dominican', label: 'Dominican' },
  { value: 'Ecuadorian', label: 'Ecuadorian' },
  { value: 'Guatemalan', label: 'Guatemalan' },
  { value: 'Haitian', label: 'Haitian' },
  { value: 'Hispanic', label: 'Hispanic' },
  { value: 'Honduran', label: 'Honduran' },
  { value: 'Indigenous American', label: 'Indigenous American' },
  { value: 'Jamaican', label: 'Jamaican' },
  { value: 'Latino', label: 'Latino' },
  { value: 'Mexican', label: 'Mexican' },
  { value: 'Native American', label: 'Native American' },
  { value: 'Nicaraguan', label: 'Nicaraguan' },
  { value: 'Panamanian', label: 'Panamanian' },
  { value: 'Paraguayan', label: 'Paraguayan' },
  { value: 'Peruvian', label: 'Peruvian' },
  { value: 'Puerto Rican', label: 'Puerto Rican' },
  { value: 'Trinidadian', label: 'Trinidadian' },
  { value: 'Uruguayan', label: 'Uruguayan' },
  { value: 'Venezuelan', label: 'Venezuelan' },

  // East Asia
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Hong Konger', label: 'Hong Konger' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Mongolian', label: 'Mongolian' },
  { value: 'Taiwanese', label: 'Taiwanese' },
  { value: 'Tibetan', label: 'Tibetan' },
  { value: 'Uyghur', label: 'Uyghur' },

  // Southeast Asia
  { value: 'Balinese', label: 'Balinese' },
  { value: 'Burmese', label: 'Burmese' },
  { value: 'Cambodian', label: 'Cambodian' },
  { value: 'Filipino', label: 'Filipino' },
  { value: 'Hmong', label: 'Hmong' },
  { value: 'Indonesian', label: 'Indonesian' },
  { value: 'Javanese', label: 'Javanese' },
  { value: 'Laotian', label: 'Laotian' },
  { value: 'Malay', label: 'Malay' },
  { value: 'Singaporean', label: 'Singaporean' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Timorese', label: 'Timorese' },
  { value: 'Vietnamese', label: 'Vietnamese' },

  // South Asia
  { value: 'Bangladeshi', label: 'Bangladeshi' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Bhutanese', label: 'Bhutanese' },
  { value: 'Gujarati', label: 'Gujarati' },
  { value: 'Indian', label: 'Indian' },
  { value: 'Kashmiri', label: 'Kashmiri' },
  { value: 'Malayali', label: 'Malayali' },
  { value: 'Marathi', label: 'Marathi' },
  { value: 'Maldivian', label: 'Maldivian' },
  { value: 'Nepalese', label: 'Nepalese' },
  { value: 'Pakistani', label: 'Pakistani' },
  { value: 'Punjabi', label: 'Punjabi' },
  { value: 'Rajasthani', label: 'Rajasthani' },
  { value: 'Sindhi', label: 'Sindhi' },
  { value: 'Sinhalese', label: 'Sinhalese' },
  { value: 'Sri Lankan', label: 'Sri Lankan' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Telugu', label: 'Telugu' },

  // Central Asia
  { value: 'Afghan', label: 'Afghan' },
  { value: 'Azerbaijani', label: 'Azerbaijani' },
  { value: 'Georgian', label: 'Georgian' },
  { value: 'Kazakh', label: 'Kazakh' },
  { value: 'Kyrgyz', label: 'Kyrgyz' },
  { value: 'Tajik', label: 'Tajik' },
  { value: 'Turkmen', label: 'Turkmen' },
  { value: 'Uzbek', label: 'Uzbek' },

  // Middle East
  { value: 'Arab', label: 'Arab' },
  { value: 'Armenian', label: 'Armenian' },
  { value: 'Assyrian', label: 'Assyrian' },
  { value: 'Bahraini', label: 'Bahraini' },
  { value: 'Druze', label: 'Druze' },
  { value: 'Iranian / Persian', label: 'Iranian / Persian' },
  { value: 'Iraqi', label: 'Iraqi' },
  { value: 'Israeli', label: 'Israeli' },
  { value: 'Jewish', label: 'Jewish' },
  { value: 'Jordanian', label: 'Jordanian' },
  { value: 'Kurdish', label: 'Kurdish' },
  { value: 'Kuwaiti', label: 'Kuwaiti' },
  { value: 'Lebanese', label: 'Lebanese' },
  { value: 'Omani', label: 'Omani' },
  { value: 'Palestinian', label: 'Palestinian' },
  { value: 'Saudi', label: 'Saudi' },
  { value: 'Syrian', label: 'Syrian' },
  { value: 'Turkish', label: 'Turkish' },
  { value: 'Yemeni', label: 'Yemeni' },

  // Europe
  { value: 'Albanian', label: 'Albanian' },
  { value: 'Austrian', label: 'Austrian' },
  { value: 'Basque', label: 'Basque' },
  { value: 'Belgian', label: 'Belgian' },
  { value: 'Bosnian', label: 'Bosnian' },
  { value: 'British', label: 'British' },
  { value: 'Bulgarian', label: 'Bulgarian' },
  { value: 'Catalan', label: 'Catalan' },
  { value: 'Caucasian', label: 'Caucasian' },
  { value: 'Croatian', label: 'Croatian' },
  { value: 'Czech', label: 'Czech' },
  { value: 'Danish', label: 'Danish' },
  { value: 'Dutch', label: 'Dutch' },
  { value: 'Estonian', label: 'Estonian' },
  { value: 'Finnish', label: 'Finnish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Greek', label: 'Greek' },
  { value: 'Hungarian', label: 'Hungarian' },
  { value: 'Icelandic', label: 'Icelandic' },
  { value: 'Irish', label: 'Irish' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Latvian', label: 'Latvian' },
  { value: 'Lithuanian', label: 'Lithuanian' },
  { value: 'Macedonian', label: 'Macedonian' },
  { value: 'Maltese', label: 'Maltese' },
  { value: 'Norwegian', label: 'Norwegian' },
  { value: 'Polish', label: 'Polish' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Romanian', label: 'Romanian' },
  { value: 'Roma / Romani', label: 'Roma / Romani' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Sami', label: 'Sami' },
  { value: 'Scottish', label: 'Scottish' },
  { value: 'Serbian', label: 'Serbian' },
  { value: 'Slovak', label: 'Slovak' },
  { value: 'Slovenian', label: 'Slovenian' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Swedish', label: 'Swedish' },
  { value: 'Swiss', label: 'Swiss' },
  { value: 'Ukrainian', label: 'Ukrainian' },
  { value: 'Welsh', label: 'Welsh' },

  // Pacific
  { value: 'Aboriginal Australian', label: 'Aboriginal Australian' },
  { value: 'Fijian', label: 'Fijian' },
  { value: 'Hawaiian', label: 'Hawaiian' },
  { value: 'Maori', label: 'Maori' },
  { value: 'Melanesian', label: 'Melanesian' },
  { value: 'Micronesian', label: 'Micronesian' },
  { value: 'Pacific Islander', label: 'Pacific Islander' },
  { value: 'Papuan', label: 'Papuan' },
  { value: 'Polynesian', label: 'Polynesian' },
  { value: 'Samoan', label: 'Samoan' },
  { value: 'Tongan', label: 'Tongan' },

  // Catch-all
  { value: 'Multiracial', label: 'Multiracial / Mixed Heritage' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say' }
]

const RELATIONSHIP_OPTIONS = [
  // Close Family
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Partner', label: 'Partner' },
  { value: 'Son', label: 'Son' },
  { value: 'Daughter', label: 'Daughter' },
  { value: 'Father', label: 'Father' },
  { value: 'Mother', label: 'Mother' },
  { value: 'Brother', label: 'Brother' },
  { value: 'Sister', label: 'Sister' },
  { value: 'Grandfather', label: 'Grandfather' },
  { value: 'Grandmother', label: 'Grandmother' },
  { value: 'Grandson', label: 'Grandson' },
  { value: 'Granddaughter', label: 'Granddaughter' },

  // Extended Family
  { value: 'Uncle', label: 'Uncle' },
  { value: 'Aunt', label: 'Aunt' },
  { value: 'Nephew', label: 'Nephew' },
  { value: 'Niece', label: 'Niece' },
  { value: 'Cousin', label: 'Cousin' },
  { value: 'Father-in-law', label: 'Father-in-law' },
  { value: 'Mother-in-law', label: 'Mother-in-law' },
  { value: 'Brother-in-law', label: 'Brother-in-law' },
  { value: 'Sister-in-law', label: 'Sister-in-law' },
  { value: 'Stepfather', label: 'Stepfather' },
  { value: 'Stepmother', label: 'Stepmother' },
  { value: 'Stepson', label: 'Stepson' },
  { value: 'Stepdaughter', label: 'Stepdaughter' },
  { value: 'Godfather', label: 'Godfather' },
  { value: 'Godmother', label: 'Godmother' },
  { value: 'Godson', label: 'Godson' },
  { value: 'Goddaughter', label: 'Goddaughter' },

  // Non-family
  { value: 'Friend', label: 'Friend' },
  { value: 'Best Friend', label: 'Best Friend' },
  { value: 'Colleague', label: 'Colleague' },
  { value: 'Mentor', label: 'Mentor' },
  { value: 'Teacher', label: 'Teacher' },
  { value: 'Student', label: 'Student' },
  { value: 'Neighbour', label: 'Neighbour' },
  { value: 'Follower', label: 'Follower' },
  { value: 'Fan', label: 'Fan' },
  { value: 'Caregiver', label: 'Caregiver' },

  // Catch-all
  { value: 'Other', label: 'Other' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export function isCustomColor(value: string): boolean {
  return value.startsWith('#') || value.startsWith('linear-gradient')
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

const GRADIENT_DIRECTIONS = [
  { value: 'to right',        label: '→' },
  { value: 'to bottom right', label: '↘' },
  { value: 'to bottom',       label: '↓' },
  { value: 'to bottom left',  label: '↙' },
  { value: 'to left',         label: '←' },
]

function parseLinearGradient(value: string): { direction: string; from: string; to: string } | null {
  const m = value.match(/^linear-gradient\(([^,]+),\s*(#[\da-fA-F]{3,8}),\s*(#[\da-fA-F]{3,8})\)$/)
  return m ? { direction: m[1].trim(), from: m[2], to: m[3] } : null
}

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
  const parsedCustom = coverGradient.startsWith('linear-gradient')
    ? parseLinearGradient(coverGradient)
    : null

  const [tab, setTab] = useState<'presets' | 'custom'>(() =>
    coverGradient.startsWith('linear-gradient') ? 'custom' : 'presets'
  )
  const [fromColor, setFromColor] = useState(parsedCustom?.from ?? '#3B5BFF')
  const [toColor, setToColor] = useState(parsedCustom?.to ?? '#1A1A2E')
  const [direction, setDirection] = useState(parsedCustom?.direction ?? 'to right')

  const fromInputRef = useRef<HTMLInputElement>(null)
  const toInputRef = useRef<HTMLInputElement>(null)

  function buildGradient(dir: string, from: string, to: string) {
    return `linear-gradient(${dir}, ${from}, ${to})`
  }

  function handleFromChange(color: string) {
    setFromColor(color)
    onGradientChange(buildGradient(direction, color, toColor))
  }

  function handleToChange(color: string) {
    setToColor(color)
    onGradientChange(buildGradient(direction, fromColor, color))
  }

  function handleDirectionChange(dir: string) {
    setDirection(dir)
    onGradientChange(buildGradient(dir, fromColor, toColor))
  }

  function switchTab(t: 'presets' | 'custom') {
    setTab(t)
    if (t === 'custom') {
      onGradientChange(buildGradient(direction, fromColor, toColor))
    } else {
      onGradientChange('blue')
    }
  }

  const liveGradient = buildGradient(direction, fromColor, toColor)

  return (
    <div className="space-y-4">
      <PhotoUpload
        label="Cover Photo"
        hint="Recommended 1216×282px, up to 10MB"
        value={coverPhoto}
        onChange={onCoverPhotoChange}
      />
      {!coverPhoto && (
        <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-4 space-y-4">
          {/* Tab header */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 shrink-0">
              Cover Background
            </p>
            <div className="flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-0.5 gap-0.5">
              {(['presets', 'custom'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => switchTab(t)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    tab === t
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                  }`}
                >
                  {t === 'presets' ? 'Presets' : 'Custom Gradient'}
                </button>
              ))}
            </div>
          </div>

          {tab === 'presets' ? (
            <div className="grid grid-cols-4 gap-2">
              {COVER_GRADIENTS.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  aria-label={g.label}
                  aria-pressed={coverGradient === g.key}
                  onClick={() => onGradientChange(g.key)}
                  className="group flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`relative h-12 w-full rounded-xl bg-gradient-to-r ${g.tw} transition-all ring-offset-2
                      ${coverGradient === g.key
                        ? 'ring-2 ring-brand-primary'
                        : 'hover:ring-2 hover:ring-neutral-300 dark:hover:ring-neutral-600'
                      }`}
                  >
                    {coverGradient === g.key && (
                      <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] leading-tight text-center truncate w-full ${
                      coverGradient === g.key
                        ? 'text-brand-primary font-medium'
                        : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200'
                    }`}
                  >
                    {g.label}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Live preview */}
              <div
                className="h-14 w-full rounded-xl"
                style={{ backgroundImage: liveGradient }}
                aria-label="Gradient preview"
              />

              {/* Direction */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Direction
                </p>
                <div className="flex gap-1.5">
                  {GRADIENT_DIRECTIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => handleDirectionChange(d.value)}
                      aria-label={`Direction ${d.label}`}
                      aria-pressed={direction === d.value}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-base font-medium transition-all
                        ${direction === d.value
                          ? 'bg-brand-primary text-white shadow-sm'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-brand-primaryLight hover:text-brand-primary dark:hover:bg-brand-primary/20'
                        }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    From
                  </p>
                  <button
                    type="button"
                    onClick={() => fromInputRef.current?.click()}
                    className="flex w-full items-center gap-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 transition-colors hover:border-brand-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
                  >
                    <span
                      className="h-6 w-6 shrink-0 rounded-md shadow-sm ring-1 ring-black/10"
                      style={{ backgroundColor: fromColor }}
                    />
                    <span className="text-sm font-mono text-neutral-700 dark:text-neutral-300">
                      {fromColor.toUpperCase()}
                    </span>
                  </button>
                  <input
                    ref={fromInputRef}
                    type="color"
                    value={fromColor}
                    onChange={(e) => handleFromChange(e.target.value)}
                    className="sr-only"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    To
                  </p>
                  <button
                    type="button"
                    onClick={() => toInputRef.current?.click()}
                    className="flex w-full items-center gap-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 transition-colors hover:border-brand-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
                  >
                    <span
                      className="h-6 w-6 shrink-0 rounded-md shadow-sm ring-1 ring-black/10"
                      style={{ backgroundColor: toColor }}
                    />
                    <span className="text-sm font-mono text-neutral-700 dark:text-neutral-300">
                      {toColor.toUpperCase()}
                    </span>
                  </button>
                  <input
                    ref={toInputRef}
                    type="color"
                    value={toColor}
                    onChange={(e) => handleToChange(e.target.value)}
                    className="sr-only"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                </div>
              </div>
            </div>
          )}
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
      <div className="py-8 space-y-6">
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
    <div className="py-8">
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
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="w-full sm:w-[360px] sm:shrink-0">
              <Controller
                name="profilePhoto"
                control={control}
                render={({ field }) => (
                  <PhotoUpload
                    label="Memorial Photo"
                    hint="Recommended 360×360px, up to 10MB"
                    value={field.value ?? null}
                    onChange={field.onChange}
                    uploadAreaClassName="h-48 sm:h-[360px]"
                    error={errors.profilePhoto?.message as string | undefined}
                  />
                )}
              />
            </div>
            <div className="min-w-0 flex-1">
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
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    id="dateOfBirth"
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                    placeholder="Pick date of birth"
                    disableFuture
                  />
                )}
              />
              {errors.dateOfBirth && <ErrorMessage message={errors.dateOfBirth.message!} />}
            </div>

            {/* Date of Death */}
            <div>
              <FieldLabel htmlFor="dateOfDeath">Date of Death</FieldLabel>
              <Controller
                name="dateOfDeath"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    id="dateOfDeath"
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                    placeholder="Pick date of death"
                    disableFuture
                  />
                )}
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
              Preview
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
