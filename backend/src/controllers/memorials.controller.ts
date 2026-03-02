import type { Response, NextFunction } from 'express'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type {
  AuthenticatedRequest,
  CreateMemorialPayload,
  UpdateMemorialPayload,
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

export async function list(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { data, error } = await supabaseAdmin
      .from('memorials')
      .select('*')
      .eq('created_by', req.user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ data, error: null })
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
    const payload = req.body as CreateMemorialPayload

    if (!payload.full_name?.trim()) {
      res.status(400).json({ data: null, error: 'full_name is required' })
      return
    }

    const year = payload.date_of_death
      ? new Date(payload.date_of_death).getFullYear()
      : undefined
    const baseSlug = generateSlug(payload.full_name, year)
    const slug = await uniqueSlug(baseSlug)
    const fullMemorialUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/memorial/${slug}`

    const { data, error } = await supabaseAdmin
      .from('memorials')
      .insert({
        ...payload,
        created_by: req.user.id,
        slug,
        full_memorial_url: fullMemorialUrl,
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ data, error: null })
  } catch (err) {
    next(err)
  }
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
      .select('*')
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
    const payload = req.body as UpdateMemorialPayload

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
