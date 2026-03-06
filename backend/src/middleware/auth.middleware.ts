import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { AuthenticatedRequest } from '@/types/memorial.types'

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ data: null, error: 'Missing or invalid Authorization header' })
    return
  }

  const token = authHeader.slice(7)

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) {
    res.status(401).json({ data: null, error: 'Invalid or expired token' })
    return
  }

  ;(req as AuthenticatedRequest).user = {
    id: data.user.id,
    email: data.user.email,
    role: (data.user.user_metadata?.role as string) ?? 'user',
    full_name: data.user.user_metadata?.full_name as string | undefined,
  }

  next()
}
