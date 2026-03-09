import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { AuthenticatedRequest } from '@/types/memorial.types'

export async function listCondolences(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { data, error } = await supabaseAdmin
      .from('condolences')
      .select('*')
      .eq('obituary_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      res.status(500).json({ data: null, error: error.message })
      return
    }

    res.json({ data, error: null })
  } catch (err) {
    next(err)
  }
}

export async function createCondolence(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest
    const { id: obituary_id } = req.params
    const { message } = req.body as { message?: string }

    if (!message || message.trim().length === 0) {
      res.status(400).json({ data: null, error: 'Message is required' })
      return
    }

    if (message.trim().length > 500) {
      res.status(400).json({ data: null, error: 'Message must be 500 characters or fewer' })
      return
    }

    const author_name =
      authReq.user.full_name ?? authReq.user.email ?? 'Anonymous'

    const { data, error } = await supabaseAdmin
      .from('condolences')
      .insert({
        obituary_id,
        user_id: authReq.user.id,
        author_name,
        message: message.trim(),
      })
      .select()
      .single()

    if (error) {
      res.status(500).json({ data: null, error: error.message })
      return
    }

    res.status(201).json({ data, error: null })
  } catch (err) {
    next(err)
  }
}
