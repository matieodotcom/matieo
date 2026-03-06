import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { cloudinary } from '@/lib/cloudinary'
import type {
  AuthenticatedRequest,
  CreateMemorialPayload,
  UpdateMemorialPayload,
  PhotoPayload,
} from '@/types/memorial.types'

// ── Slug generation ───────────────────────────────────────────────────────────

function generateSlug(fullName: string, year?: string | number): string {
  const base = fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  const suffix = year ?? new Date().getFullYear()
  return `${base}-${suffix}`
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base
  let attempt = 0
  while (true) {
    const { data } = await supabaseAdmin
      .from('memorials')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (!data) return slug
    attempt++
    slug = `${base}-${attempt}`
  }
}

// ── Controllers ───────────────────────────────────────────────────────────────

export async function listPublished(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { q = '', page = '1', limit = '12' } = req.query as Record<string, string>
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)))
    const offset = (pageNum - 1) * limitNum

    let query = supabaseAdmin
      .from('memorials')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1)

    if (q.trim()) {
      query = query.ilike('full_name', `%${q.trim()}%`)
    }

    const { data, error, count } = await query
    if (error) throw error

    res.json({ data, total: count ?? 0, page: pageNum, limit: limitNum, error: null })
  } catch (err) {
    next(err)
  }
}

export async function getBySlug(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { slug } = req.params

    const { data, error } = await supabaseAdmin
      .from('memorials')
      .select('*, memorial_photos(*)')
      .eq('slug', slug)
      .eq('status', 'published')
      .is('deleted_at', null)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      res.status(404).json({ data: null, error: 'Memorial not found' })
      return
    }

    res.json({ data, error: null })
  } catch (err) {
    next(err)
  }
}

export async function list(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { q = '', page = '1', limit = '12' } = req.query as Record<string, string>
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)))
    const offset = (pageNum - 1) * limitNum

    let query = supabaseAdmin
      .from('memorials')
      .select('*', { count: 'exact' })
      .eq('created_by', req.user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1)

    if (q.trim()) {
      query = query.ilike('full_name', `%${q.trim()}%`)
    }

    const { data, error, count } = await query
    if (error) throw error

    res.json({ data, total: count ?? 0, page: pageNum, limit: limitNum, error: null })
  } catch (err) {
    next(err)
  }
}

export async function create(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { custom_slug, photos, ...payload } = req.body as CreateMemorialPayload

    if (!payload.full_name?.trim()) {
      res.status(400).json({ data: null, error: 'full_name is required' })
      return
    }

    let slug: string
    if (custom_slug?.trim()) {
      // Validate uniqueness of custom slug
      const { data: existing } = await supabaseAdmin
        .from('memorials')
        .select('id')
        .eq('slug', custom_slug.trim())
        .maybeSingle()
      if (existing) {
        res.status(422).json({ data: null, error: 'This web address is already taken' })
        return
      }
      slug = custom_slug.trim()
    } else {
      const year = payload.date_of_death
        ? new Date(payload.date_of_death).getFullYear()
        : undefined
      const baseSlug = generateSlug(payload.full_name, year)
      slug = await uniqueSlug(baseSlug)
    }

    const fullMemorialUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/memorial/${slug}`

    const creatorName: string | null = req.user.full_name ?? req.user.email ?? null

    const { data, error } = await supabaseAdmin
      .from('memorials')
      .insert({
        ...payload,
        created_by: req.user.id,
        creator_name: creatorName,
        slug,
        full_memorial_url: fullMemorialUrl,
      })
      .select()
      .single()

    if (error) throw error

    // Insert gallery photos if provided
    if (photos && photos.length > 0) {
      await insertPhotos(data.id, photos)
    }

    res.status(201).json({ data, error: null })
  } catch (err) {
    next(err)
  }
}

async function insertPhotos(memorialId: string, photos: PhotoPayload[]): Promise<void> {
  const rows = photos.map((p, i) => ({
    memorial_id: memorialId,
    cloudinary_public_id: p.cloudinary_public_id,
    cloudinary_url: p.cloudinary_url,
    caption: p.caption ?? null,
    sort_order: p.sort_order ?? i,
  }))
  await supabaseAdmin.from('memorial_photos').insert(rows)
}

export async function getById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('memorials')
      .select('*, memorial_photos(*)')
      .eq('id', id)
      .eq('created_by', req.user.id)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      res.status(404).json({ data: null, error: 'Memorial not found' })
      return
    }

    res.json({ data, error: null })
  } catch (err) {
    next(err)
  }
}

export async function update(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { photos, custom_slug, ...payload } = req.body as UpdateMemorialPayload & { custom_slug?: string }

    const { data, error } = await supabaseAdmin
      .from('memorials')
      .update(payload)
      .eq('id', id)
      .eq('created_by', req.user.id)
      .is('deleted_at', null)
      .select()
      .maybeSingle()

    if (error) throw error
    if (!data) {
      res.status(404).json({ data: null, error: 'Memorial not found' })
      return
    }

    // Replace gallery photos if provided
    if (photos !== undefined) {
      await supabaseAdmin.from('memorial_photos').delete().eq('memorial_id', id)
      if (photos.length > 0) {
        await insertPhotos(id, photos)
      }
    }

    res.json({ data, error: null })
  } catch (err) {
    next(err)
  }
}

export async function softDelete(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('memorials')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('created_by', req.user.id)
      .is('deleted_at', null)
      .select('id')
      .maybeSingle()

    if (error) throw error
    if (!data) {
      res.status(404).json({ data: null, error: 'Memorial not found' })
      return
    }

    res.json({ data: { id: data.id }, error: null })
  } catch (err) {
    next(err)
  }
}

export async function permanentDelete(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    // Fetch memorial — must belong to user and not be soft-deleted
    const { data: memorial, error: fetchError } = await supabaseAdmin
      .from('memorials')
      .select('id, status, cover_cloudinary_public_id, profile_cloudinary_public_id')
      .eq('id', id)
      .eq('created_by', req.user.id)
      .is('deleted_at', null)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!memorial) {
      res.status(404).json({ data: null, error: 'Memorial not found' })
      return
    }

    if (memorial.status !== 'draft') {
      res.status(403).json({ data: null, error: 'Only draft memorials can be permanently deleted' })
      return
    }

    // Collect gallery photo public_ids
    const { data: photos } = await supabaseAdmin
      .from('memorial_photos')
      .select('cloudinary_public_id')
      .eq('memorial_id', id)

    const publicIds: string[] = [
      memorial.cover_cloudinary_public_id,
      memorial.profile_cloudinary_public_id,
      ...(photos ?? []).map((p: { cloudinary_public_id: string | null }) => p.cloudinary_public_id),
    ].filter(Boolean) as string[]

    // Best-effort Cloudinary cleanup — DB delete always proceeds
    const results = await Promise.allSettled(
      publicIds.map((pid) => cloudinary.uploader.destroy(pid)),
    )
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`Cloudinary destroy failed for ${publicIds[i]}:`, r.reason)
      }
    })

    // Hard delete — cascade removes memorial_photos
    const { error: deleteError } = await supabaseAdmin
      .from('memorials')
      .delete()
      .eq('id', id)
      .eq('created_by', req.user.id)

    if (deleteError) throw deleteError

    res.json({ data: { id }, error: null })
  } catch (err) {
    next(err)
  }
}

export async function unpublish(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('memorials')
      .update({ status: 'draft' })
      .eq('id', id)
      .eq('created_by', req.user.id)
      .is('deleted_at', null)
      .select()
      .maybeSingle()

    if (error) throw error
    if (!data) {
      res.status(404).json({ data: null, error: 'Memorial not found' })
      return
    }

    res.json({ data, error: null })
  } catch (err) {
    next(err)
  }
}

export async function publish(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('memorials')
      .update({ status: 'published' })
      .eq('id', id)
      .eq('created_by', req.user.id)
      .is('deleted_at', null)
      .select()
      .maybeSingle()

    if (error) throw error
    if (!data) {
      res.status(404).json({ data: null, error: 'Memorial not found' })
      return
    }

    res.json({ data, error: null })
  } catch (err) {
    next(err)
  }
}
