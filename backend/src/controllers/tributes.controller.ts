import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { AuthenticatedRequest } from '@/types/memorial.types'

export async function deleteTribute(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest
    const { tributeId } = req.params

    // Fetch to verify ownership
    const { data: tribute, error: fetchError } = await supabaseAdmin
      .from('tributes')
      .select('user_id')
      .eq('id', tributeId)
      .single()

    if (fetchError || !tribute) {
      res.status(404).json({ data: null, error: 'Tribute not found' })
      return
    }

    if (tribute.user_id !== authReq.user.id) {
      res.status(403).json({ data: null, error: 'Not authorised to delete this tribute' })
      return
    }

    const { error } = await supabaseAdmin.from('tributes').delete().eq('id', tributeId)

    if (error) {
      res.status(500).json({ data: null, error: error.message })
      return
    }

    res.status(200).json({ data: { id: tributeId }, error: null })
  } catch (err) {
    next(err)
  }
}

export async function listTributes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { data, error } = await supabaseAdmin
      .from('tributes')
      .select('*')
      .eq('memorial_id', id)
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

export async function createTribute(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest
    const { id: memorial_id } = req.params
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
      .from('tributes')
      .insert({
        memorial_id,
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
