import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  avatar_cloudinary_public_id: string | null
  avatar_url: string | null
  role: string
  dark_mode: boolean
  account_type: 'individual' | 'organization'
}

export function useProfile() {
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery<Profile | null>({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_cloudinary_public_id, avatar_url, role, dark_mode, account_type')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data as Profile
    },
    enabled: !!userId,
    staleTime: 60_000,
  })
}
