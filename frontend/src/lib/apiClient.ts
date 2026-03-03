import { supabase } from '@/lib/supabase'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token

  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (res.status === 401) {
    await supabase.auth.signOut()
    window.location.href = '/signin'
    throw new Error('Unauthorized')
  }

  const body = await res.json()
  if (!res.ok) throw new Error((body as { error?: string }).error ?? 'Request failed')
  return body as T
}
