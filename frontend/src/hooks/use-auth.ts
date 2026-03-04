import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/lib/toast'

// ── Schemas ───────────────────────────────────────────────────────────────────

const signInSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormValues = z.infer<typeof signInSchema>

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

    const { data, error: authError } = await supabase.auth.signUp({
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

    // Supabase returns user with empty identities when email is already registered
    if (!data.user || data.user.identities?.length === 0) {
      setError('An account with this email already exists. Please sign in instead.')
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

// ── useSignIn ─────────────────────────────────────────────────────────────────

export function useSignIn(options?: { onSuccess?: () => void }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: SignInFormValues) => {
    setIsPending(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    setIsPending(false)

    if (authError) {
      setError(authError.message)
      return
    }

    options?.onSuccess ? options.onSuccess() : navigate('/')
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    error,
  }
}

// ── useGoogleAuth ─────────────────────────────────────────────────────────────

export function useGoogleAuth(options?: { redirectTo?: string }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleAuth = async () => {
    setIsPending(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: options?.redirectTo ?? window.location.origin + '/' },
    })

    if (authError) {
      setError(authError.message)
      setIsPending(false)
    }
    // On success, browser redirects — no client-side navigation needed
  }

  return { handleGoogleAuth, isPending, error }
}

// ── useForgotPassword ─────────────────────────────────────────────────────────

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function useForgotPassword() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const submitReset = async (email: string) => {
    setIsPending(true)
    setError(null)

    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })

    setIsPending(false)

    if (authError) {
      setError(authError.message)
      return
    }

    setSubmittedEmail(email)
    setEmailSent(true)
  }

  const onSubmit = form.handleSubmit((values) => submitReset(values.email))
  const resend = () => submitReset(submittedEmail)

  return { form, onSubmit, isPending, error, emailSent, submittedEmail, resend }
}

// ── useResetPassword ──────────────────────────────────────────────────────────

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function useResetPassword() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setIsPending(true)
    setError(null)

    const { error: authError } = await supabase.auth.updateUser({
      password: values.password,
    })

    setIsPending(false)

    if (authError) {
      setError(authError.message)
      return
    }

    toast.success('Password updated successfully')
    navigate('/signin')
  })

  return { form, onSubmit, isPending, error }
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
