import { apiFetch } from '@/lib/apiClient'

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
}

interface SignResponse {
  data: {
    signature: string
    timestamp: number
    folder: string
    cloud_name: string
    api_key: string
  } | null
  error: string | null
}

/**
 * Upload a file to Cloudinary via the backend signed upload flow.
 * 1. GET signature from /api/cloudinary/sign (authenticated)
 * 2. POST file directly to Cloudinary with the signature
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  // Step 1: get signed params from backend
  const signed = await apiFetch<SignResponse>('/api/cloudinary/sign', { method: 'POST' })
  if (!signed.data) throw new Error(signed.error ?? 'Failed to get upload signature')

  const { signature, timestamp, folder, api_key } = signed.data

  // Cloud name comes from frontend env (backend may not have it set)
  const cloudName =
    (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined) ||
    signed.data.cloud_name

  if (!cloudName) throw new Error('Cloudinary cloud name is not configured')

  // Step 2: upload directly to Cloudinary
  const formData = new FormData()
  formData.append('file', file)
  formData.append('signature', signature)
  formData.append('timestamp', String(timestamp))
  formData.append('folder', folder)
  formData.append('api_key', api_key)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: { message?: string } }).error?.message ?? 'Upload failed')
  }

  const data = (await res.json()) as { public_id: string; secure_url: string }
  return { public_id: data.public_id, secure_url: data.secure_url }
}
