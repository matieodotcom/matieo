import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// ── Helpers ──────────────────────────────────────────────────────────────────

function parsePagination(query: Record<string, string>) {
  const page = Math.max(1, parseInt(query.page ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20')))
  const offset = (page - 1) * limit
  return { page, limit, offset }
}

// ── Stats ────────────────────────────────────────────────────────────────────

export async function getStats(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [
      usersTotal,
      admins,
      researchers,
      memorialsTotal,
      memorialsPublished,
      memorialsDraft,
      obituariesTotal,
      obituariesPublished,
      obituariesDraft,
      tributesTotal,
      condolencesTotal,
      waitlistTotal,
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'researcher'),
      supabaseAdmin.from('memorials').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('memorials').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabaseAdmin.from('memorials').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabaseAdmin.from('obituaries').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('obituaries').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabaseAdmin.from('obituaries').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabaseAdmin.from('tributes').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('condolences').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('waitlist_subscribers').select('*', { count: 'exact', head: true }),
    ])

    res.json({
      data: {
        users:       { total: usersTotal.count ?? 0, admins: admins.count ?? 0, researchers: researchers.count ?? 0 },
        memorials:   { total: memorialsTotal.count ?? 0, published: memorialsPublished.count ?? 0, draft: memorialsDraft.count ?? 0 },
        obituaries:  { total: obituariesTotal.count ?? 0, published: obituariesPublished.count ?? 0, draft: obituariesDraft.count ?? 0 },
        tributes:    { total: tributesTotal.count ?? 0 },
        condolences: { total: condolencesTotal.count ?? 0 },
        waitlist:    { total: waitlistTotal.count ?? 0 },
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { page, limit, offset } = parsePagination(req.query as Record<string, string>)
    const { role, account_type, q } = req.query as Record<string, string>

    let query = supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role, account_type, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (role) query = query.eq('role', role)
    if (account_type) query = query.eq('account_type', account_type)
    if (q?.trim()) query = query.or(`full_name.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%`)

    const { data, error, count } = await query
    if (error) throw error

    res.json({ data: { items: data ?? [], total: count ?? 0, page, limit } })
  } catch (err) {
    next(err)
  }
}

export async function setUserRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { role } = req.body as { role: string }

    if (!['user', 'admin', 'researcher'].includes(role)) {
      res.status(400).json({ data: null, error: 'Invalid role. Must be user, admin, or researcher' })
      return
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ data, error: null })
  } catch (err) {
    next(err)
  }
}

// ── Memorials ────────────────────────────────────────────────────────────────

export async function listMemorials(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { page, limit, offset } = parsePagination(req.query as Record<string, string>)

    const { data, error, count } = await supabaseAdmin
      .from('memorials')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    res.json({ data: { items: data ?? [], total: count ?? 0, page, limit } })
  } catch (err) {
    next(err)
  }
}

export async function setMemorialStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { status } = req.body as { status: string }

    if (!['draft', 'published'].includes(status)) {
      res.status(400).json({ data: null, error: 'Invalid status. Must be draft or published' })
      return
    }

    const { data, error } = await supabaseAdmin
      .from('memorials')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ data, error: null })
  } catch (err) {
    next(err)
  }
}

export async function deleteMemorial(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('memorials')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

// ── Obituaries ───────────────────────────────────────────────────────────────

export async function listObituaries(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { page, limit, offset } = parsePagination(req.query as Record<string, string>)

    const { data, error, count } = await supabaseAdmin
      .from('obituaries')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    res.json({ data: { items: data ?? [], total: count ?? 0, page, limit } })
  } catch (err) {
    next(err)
  }
}

export async function setObituaryStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { status } = req.body as { status: string }

    if (!['draft', 'published'].includes(status)) {
      res.status(400).json({ data: null, error: 'Invalid status. Must be draft or published' })
      return
    }

    const { data, error } = await supabaseAdmin
      .from('obituaries')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ data, error: null })
  } catch (err) {
    next(err)
  }
}

export async function deleteObituary(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('obituaries')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

// ── Tributes ─────────────────────────────────────────────────────────────────

export async function listTributes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { page, limit, offset } = parsePagination(req.query as Record<string, string>)

    const { data, error, count } = await supabaseAdmin
      .from('tributes')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    res.json({ data: { items: data ?? [], total: count ?? 0, page, limit } })
  } catch (err) {
    next(err)
  }
}

export async function deleteTribute(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('tributes')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

// ── Condolences ──────────────────────────────────────────────────────────────

export async function listCondolences(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { page, limit, offset } = parsePagination(req.query as Record<string, string>)

    const { data, error, count } = await supabaseAdmin
      .from('condolences')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    res.json({ data: { items: data ?? [], total: count ?? 0, page, limit } })
  } catch (err) {
    next(err)
  }
}

export async function deleteCondolence(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('condolences')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

// ── Waitlist ─────────────────────────────────────────────────────────────────

export async function listWaitlist(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { page, limit, offset } = parsePagination(req.query as Record<string, string>)

    const { data, error, count } = await supabaseAdmin
      .from('waitlist_subscribers')
      .select('id, name, email, subscribed_at', { count: 'exact' })
      .order('subscribed_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    res.json({ data: { items: data ?? [], total: count ?? 0, page, limit } })
  } catch (err) {
    next(err)
  }
}
