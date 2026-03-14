import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// ── Helpers ───────────────────────────────────────────────────────────────────

async function requireOrgUser(userId: string, res: Response): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('account_type')
    .eq('id', userId)
    .single()

  if (error || !data) {
    res.status(403).json({ data: null, error: 'Could not verify account type' })
    return false
  }

  if (data.account_type !== 'organization') {
    res.status(403).json({ data: null, error: 'This endpoint is only available to organisation accounts' })
    return false
  }

  return true
}

// ── Public: list categories with service_count ────────────────────────────────

export async function listPublicCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_categories')
      .select('id, name, slug, description, icon, image_url, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error

    // Get service counts per category
    const categoryIds = (data ?? []).map((c) => c.id)
    let counts: Record<string, number> = {}

    if (categoryIds.length > 0) {
      const { data: countRows, error: countErr } = await supabaseAdmin
        .from('organization_services')
        .select('category_id')
        .eq('is_active', true)
        .in('category_id', categoryIds)

      if (countErr) throw countErr

      for (const row of countRows ?? []) {
        counts[row.category_id] = (counts[row.category_id] ?? 0) + 1
      }
    }

    const result = (data ?? []).map((c) => ({
      ...c,
      service_count: counts[c.id] ?? 0,
    }))

    res.json({ data: result, error: null })
  } catch (err) {
    next(err)
  }
}

// ── Org: list my services ─────────────────────────────────────────────────────

export async function listMyServices(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as Request & { user: { id: string } }).user.id

    const isOrg = await requireOrgUser(userId, res)
    if (!isOrg) return

    const { data, error } = await supabaseAdmin
      .from('organization_services')
      .select('id, organization_id, category_id, name, description, phone, email, website, address, city, country, is_active, is_draft, about, icon_public_id, icon_url, gallery_public_ids, gallery_urls, created_at, service_categories(id, name, slug, icon)')
      .eq('organization_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ data: data ?? [], error: null })
  } catch (err) {
    next(err)
  }
}

// ── Org: create service listing ───────────────────────────────────────────────

export async function createMyService(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as Request & { user: { id: string } }).user.id

    const isOrg = await requireOrgUser(userId, res)
    if (!isOrg) return

    const {
      category_id, name, description, phone, email, website, address, city, country, is_active,
      icon_public_id, icon_url, gallery_public_ids, gallery_urls, about, is_draft,
    } = req.body as {
      category_id?: string
      name?: string
      description?: string
      phone?: string
      email?: string
      website?: string
      address?: string
      city?: string
      country?: string
      is_active?: boolean
      icon_public_id?: string
      icon_url?: string
      gallery_public_ids?: string[]
      gallery_urls?: string[]
      about?: string
      is_draft?: boolean
    }

    if (!name?.trim()) {
      res.status(400).json({ data: null, error: 'name is required' })
      return
    }

    if (!category_id) {
      res.status(400).json({ data: null, error: 'category_id is required' })
      return
    }

    const { data, error } = await supabaseAdmin
      .from('organization_services')
      .insert({
        organization_id: userId,
        category_id,
        name: name.trim(),
        description: description?.trim() ?? null,
        phone: phone?.trim() ?? null,
        email: email?.trim() ?? null,
        website: website?.trim() ?? null,
        address: address?.trim() ?? null,
        city: city?.trim() ?? null,
        country: country?.trim() ?? null,
        is_active: is_active ?? true,
        icon_public_id: icon_public_id ?? null,
        icon_url: icon_url ?? null,
        gallery_public_ids: gallery_public_ids ?? [],
        gallery_urls: gallery_urls ?? [],
        about: about?.trim() ?? null,
        is_draft: is_draft ?? false,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ data, error: null })
  } catch (err) {
    next(err)
  }
}

// ── Org: update my service listing ───────────────────────────────────────────

export async function updateMyService(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as Request & { user: { id: string } }).user.id
    const { id } = req.params

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('organization_services')
      .select('organization_id')
      .eq('id', id)
      .single()

    if (fetchErr || !existing) {
      res.status(404).json({ data: null, error: 'Service listing not found' })
      return
    }

    if (existing.organization_id !== userId) {
      res.status(403).json({ data: null, error: 'Forbidden' })
      return
    }

    const updates = req.body as Record<string, unknown>

    if ('name' in updates && !String(updates.name ?? '').trim()) {
      res.status(400).json({ data: null, error: 'name cannot be blank' })
      return
    }

    const { data, error } = await supabaseAdmin
      .from('organization_services')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ data, error: null })
  } catch (err) {
    next(err)
  }
}

// ── Org: delete my service listing ───────────────────────────────────────────

export async function deleteMyService(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as Request & { user: { id: string } }).user.id
    const { id } = req.params

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('organization_services')
      .select('organization_id')
      .eq('id', id)
      .single()

    if (fetchErr || !existing) {
      res.status(404).json({ data: null, error: 'Service listing not found' })
      return
    }

    if (existing.organization_id !== userId) {
      res.status(403).json({ data: null, error: 'Forbidden' })
      return
    }

    const { error } = await supabaseAdmin
      .from('organization_services')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

// ── Public: get category with providers ────────────────────────────────────

export async function getCategoryWithProviders(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { slug } = req.params
    const q = (req.query.q as string | undefined)?.trim()
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1)
    const limit = 12
    const offset = (page - 1) * limit

    // Look up category by slug
    const { data: category, error: catErr } = await supabaseAdmin
      .from('service_categories')
      .select('id, name, slug, description, icon, image_url')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (catErr || !category) {
      res.status(404).json({ data: null, error: 'Category not found' })
      return
    }

    // Query providers in this category
    let query = supabaseAdmin
      .from('organization_services')
      .select('id, name, description, icon_url, city, country, organization_id, created_at', { count: 'exact' })
      .eq('category_id', category.id)
      .eq('is_active', true)
      .eq('is_draft', false)

    if (q) {
      query = query.ilike('name', `%${q}%`)
    }

    const { data: providers, error: provErr, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (provErr) throw provErr

    res.json({ data: { category, providers: providers ?? [], total: count ?? 0 }, error: null })
  } catch (err) {
    next(err)
  }
}

// ── Public: get provider detail ───────────────────────────────────────────

export async function getProviderDetail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('organization_services')
      .select('*, service_categories(id, name, slug, icon)')
      .eq('id', id)
      .single()

    if (error || !data) {
      res.status(404).json({ data: null, error: 'Provider not found' })
      return
    }

    if (data.is_draft) {
      res.status(404).json({ data: null, error: 'Provider not found' })
      return
    }

    res.json({ data, error: null })
  } catch (err) {
    next(err)
  }
}

// ── Public: get provider comments ─────────────────────────────────────────

export async function getProviderComments(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1)
    const limit = 20
    const offset = (page - 1) * limit

    const { data, error, count } = await supabaseAdmin
      .from('service_provider_comments')
      .select('id, content, created_at, user_id, profiles!user_id(full_name)', { count: 'exact' })
      .eq('service_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    res.json({ data: { comments: data ?? [], total: count ?? 0 }, error: null })
  } catch (err) {
    next(err)
  }
}

// ── Auth: create provider comment ─────────────────────────────────────────

export async function createProviderComment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as Request & { user: { id: string } }).user.id
    const { id } = req.params
    const { content } = req.body as { content?: string }

    if (!content?.trim()) {
      res.status(400).json({ data: null, error: 'content is required' })
      return
    }

    const { data, error } = await supabaseAdmin
      .from('service_provider_comments')
      .insert({
        service_id: id,
        user_id: userId,
        content: content.trim(),
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ data, error: null })
  } catch (err) {
    next(err)
  }
}
