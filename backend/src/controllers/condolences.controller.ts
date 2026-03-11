import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendCondolencePosted } from '@/lib/emailClient'
import type { AuthenticatedRequest } from '@/types/memorial.types'

export async function deleteCondolence(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest
    const { id: obituaryId, condolenceId } = req.params

    const [condolenceResult, obituaryResult] = await Promise.all([
      supabaseAdmin.from('condolences').select('user_id').eq('id', condolenceId).single(),
      supabaseAdmin.from('obituaries').select('created_by').eq('id', obituaryId).single(),
    ])

    if (condolenceResult.error || !condolenceResult.data) {
      res.status(404).json({ data: null, error: 'Condolence not found' })
      return
    }

    const isAuthor = condolenceResult.data.user_id === authReq.user.id
    const isPageOwner = obituaryResult.data?.created_by === authReq.user.id

    if (!isAuthor && !isPageOwner) {
      res.status(403).json({ data: null, error: 'Not authorised to delete this condolence' })
      return
    }

    const { error } = await supabaseAdmin.from('condolences').delete().eq('id', condolenceId)

    if (error) {
      res.status(500).json({ data: null, error: error.message })
      return
    }

    res.status(200).json({ data: { id: condolenceId }, error: null })
  } catch (err) {
    next(err)
  }
}

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
    ;(async () => {
      const { data: obituary } = await supabaseAdmin
        .from('obituaries')
        .select('created_by, full_name, slug')
        .eq('id', obituary_id)
        .single()
      if (!obituary) return
      await sendCondolencePosted(
        obituary.created_by,
        authReq.user.id,
        obituary.full_name,
        obituary.slug,
        author_name,
      )
    })().catch((err) => console.error('[email] sendCondolencePosted failed', err))
  } catch (err) {
    next(err)
  }
}
