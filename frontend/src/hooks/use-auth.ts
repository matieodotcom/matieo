import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/lib/toast'

// ── Schemas ───────────────────────────────────────────────────────────────────

const signUpSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Enter a valid email address'),
    confirmEmail: z.string(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.confirmEmail === data.email, {
    message: 'Email addresses do not match',
    path: ['confirmEmail'],
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

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
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      confirmEmail: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: SignUpFormValues) => {
    setIsPending(true)
    setError(null)

    const { error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: `${values.firstName} ${values.lastName}` },
        emailRedirectTo: window.location.origin + '/',
      },
    })

    setIsPending(false)

    if (authError) {
      setError(authError.message)
      return
    }

    toast.success(`Verification link sent to ${values.email}`)
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
