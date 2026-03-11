import type { Response, NextFunction } from 'express'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { AuthenticatedRequest } from '@/types/memorial.types'

export async function list(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>
    const pageNum  = Math.max(1, parseInt(page))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)))
    const offset   = (pageNum - 1) * limitNum

    const { data, error, count } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1)

    if (error) throw error

    res.json({ data, total: count ?? 0, page: pageNum, limit: limitNum, error: null })
  } catch (err) {
    next(err)
  }
}

export async function markRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) throw error

    res.json({ data: { id }, error: null })
  } catch (err) {
    next(err)
  }
}

export async function markAllRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', req.user.id)
      .eq('is_read', false)

    if (error) throw error

    res.json({ data: { updated: true }, error: null })
  } catch (err) {
    next(err)
  }
}

export async function deleteOne(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) throw error

    res.json({ data: { id }, error: null })
  } catch (err) {
    next(err)
  }
}
