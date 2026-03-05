import type { Response, NextFunction } from 'express'
import { cloudinary } from '@/lib/cloudinary'
import type { AuthenticatedRequest } from '@/types/memorial.types'

export async function deleteAsset(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { public_id } = req.body as { public_id?: string }
    if (!public_id || typeof public_id !== 'string') {
      res.status(400).json({ data: null, error: 'public_id is required' })
      return
    }
    await cloudinary.uploader.destroy(public_id)
    res.json({ data: { deleted: true }, error: null })
  } catch (err) {
    next(err)
  }
}

export async function signUpload(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const folder =
      (process.env.CLOUDINARY_FOLDER_PREFIX ?? 'matieo') +
      `/${req.user.id}`

    const timestamp = Math.round(Date.now() / 1000)
    const paramsToSign = { folder, timestamp }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET ?? '',
    )

    res.json({
      data: {
        signature,
        timestamp,
        folder,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
      },
      error: null,
    })
  } catch (err) {
    next(err)
  }
}
