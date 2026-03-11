import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendTributePosted } from '@/lib/emailClient'
import { createNotification, NOTIFICATION_TYPES } from '@/lib/notificationsClient'
import type { AuthenticatedRequest } from '@/types/memorial.types'

export async function deleteTribute(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest
    const { id: memorialId, tributeId } = req.params

    // Fetch tribute + memorial owner in parallel
    const [tributeResult, memorialResult] = await Promise.all([
      supabaseAdmin.from('tributes').select('user_id').eq('id', tributeId).single(),
      supabaseAdmin.from('memorials').select('created_by').eq('id', memorialId).single(),
    ])

    if (tributeResult.error || !tributeResult.data) {
      res.status(404).json({ data: null, error: 'Tribute not found' })
      return
    }

    const isAuthor = tributeResult.data.user_id === authReq.user.id
    const isPageOwner = memorialResult.data?.created_by === authReq.user.id

    if (!isAuthor && !isPageOwner) {
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
    ;(async () => {
      const { data: memorial } = await supabaseAdmin
        .from('memorials')
        .select('created_by, full_name, slug')
        .eq('id', memorial_id)
        .single()
      if (!memorial) return

      // Email — independent; failure must not block notification
      sendTributePosted(
        memorial.created_by,
        authReq.user.id,
        memorial.full_name,
        memorial.slug,
        author_name,
      ).catch((err) => console.error('[email] sendTributePosted failed', err))

      // Self-notify guard: don't notify page owner of their own action
      if (memorial.created_by === authReq.user.id) return

      createNotification({
        userId:       memorial.created_by,
        type:         NOTIFICATION_TYPES.TRIBUTE_POSTED,
        title:        'New tribute',
        message:      `${author_name} left a tribute on ${memorial.full_name}`,
        resourceId:   memorial_id,
        resourceSlug: memorial.slug,
      }).catch((err) => console.error('[notification] createNotification (tribute) failed', err))
    })().catch((err) => console.error('[tribute] post-response IIFE failed', err));
  } catch (err) {
    next(err)
  }
}
