import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

export interface PhotoValue {
  public_id: string
  url: string
}

interface PhotoUploadProps {
  label: string
  hint?: string
  value: PhotoValue | null
  onChange: (value: PhotoValue | null) => void
  accept?: string
  maxSizeMb?: number
  error?: string
  uploadAreaClassName?: string
}

export function PhotoUpload({
  label,
  hint,
  value,
  onChange,
  accept = 'image/*',
  maxSizeMb = 10,
  error: externalError,
  uploadAreaClassName,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const sessionUploads = useRef(new Set<string>())
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File must be smaller than ${maxSizeMb}MB`)
      return
    }

    setIsUploading(true)
    try {
      const result = await uploadToCloudinary(file)
      sessionUploads.current.add(result.public_id)
      onChange({ public_id: result.public_id, url: result.secure_url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // reset so same file can be re-selected
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</p>
      {hint && <p className="mb-2 text-xs text-neutral-400">{hint}</p>}

      {value ? (
        <div className="relative w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
          <img
            src={value.url}
            alt={label}
            className={`${uploadAreaClassName ?? 'h-40'} w-full object-cover`}
          />
          <button
            type="button"
            onClick={() => {
              if (value?.public_id && sessionUploads.current.has(value.public_id)) {
                deleteFromCloudinary(value.public_id).catch(() => {})
                sessionUploads.current.delete(value.public_id)
              }
              onChange(null)
            }}
            aria-label={`Remove ${label}`}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full
              bg-neutral-900/70 text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
            transition-colors cursor-pointer ${uploadAreaClassName ?? 'h-40'} w-full
            ${isUploading
              ? 'border-brand-primary/40 bg-brand-primaryLight/30 dark:bg-brand-primary/10'
              : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 hover:border-brand-primary/60 hover:bg-brand-primaryLight/20'
            }`}
        >
          {isUploading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-neutral-400" />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Click or drag to upload
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
      {externalError && <ErrorMessage message={externalError} />}
    </div>
  )
}

// ── Multi-photo gallery upload variant ────────────────────────────────────────

interface GalleryUploadProps {
  values: PhotoValue[]
  onChange: (values: PhotoValue[]) => void
  max?: number
}

export function GalleryUpload({ values, onChange, max = 5 }: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const sessionUploads = useRef(new Set<string>())
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    if (values.length >= max) {
      setError(`Maximum ${max} photos allowed`)
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be smaller than 10MB')
      return
    }
    setIsUploading(true)
    try {
      const result = await uploadToCloudinary(file)
      sessionUploads.current.add(result.public_id)
      onChange([...values, { public_id: result.public_id, url: result.secure_url }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function remove(index: number) {
    const item = values[index]
    if (item?.public_id && sessionUploads.current.has(item.public_id)) {
      deleteFromCloudinary(item.public_id).catch(() => {})
      sessionUploads.current.delete(item.public_id)
    }
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {values.map((photo, i) => (
          <div key={photo.public_id} className="relative h-24 w-24 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
            <img src={photo.url} alt={`Gallery photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full
                bg-neutral-900/70 text-white hover:bg-neutral-900 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {values.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            aria-label="Add photo"
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed
              border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50
              hover:border-brand-primary/60 hover:bg-brand-primaryLight/20 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            ) : (
              <>
                <Upload className="h-5 w-5 text-neutral-400" />
                <span className="text-xs text-neutral-400">Add photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}

      <p className="mt-1.5 text-xs text-neutral-400">
        {values.length} / {max} photos
      </p>
    </div>
  )
}
