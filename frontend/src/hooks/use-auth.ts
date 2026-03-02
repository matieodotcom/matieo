import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/lib/toast'

// ── Schemas ───────────────────────────────────────────────────────────────────

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignUpFormValues = z.infer<typeof signUpSchema>

// ── useAuthListener ───────────────────────────────────────────────────────────

export function useAuthListener() {
  const { setUser, setSession, setLoading } = useAuthStore()

  useEffect(() => {
    // Load initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setSession, setLoading])
}

// ── useSignUp ─────────────────────────────────────────────────────────────────

export function useSignUp() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  })

  const onSubmit = async (values: SignUpFormValues) => {
    setIsPending(true)
    setError(null)

    const { error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
        emailRedirectTo: window.location.origin + '/',
      },
    })

    setIsPending(false)

    if (authError) {
      setError(authError.message)
      return
    }

    toast.success(`Check your inbox! We've sent a verification link to ${values.email}`)
    setEmailSent(true)
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    error,
    emailSent,
    submittedEmail: form.getValues('email'),
  }
}

// ── useGoogleAuth ─────────────────────────────────────────────────────────────

export function useGoogleAuth() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleAuth = async () => {
    setIsPending(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/' },
    })

    if (authError) {
      setError(authError.message)
      setIsPending(false)
    }
    // On success, browser redirects — no client-side navigation needed
  }

  return { handleGoogleAuth, isPending, error }
}

// ── useSignOut ────────────────────────────────────────────────────────────────

export function useSignOut() {
  const [isPending, setIsPending] = useState(false)
  const clear = useAuthStore((s) => s.clear)
  const navigate = useNavigate()

  const signOut = async () => {
    setIsPending(true)
    await supabase.auth.signOut()
    clear()
    navigate('/')
  }

  return { signOut, isPending }
}
