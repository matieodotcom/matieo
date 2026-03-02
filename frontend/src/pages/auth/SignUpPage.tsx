import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, UserCheck, BarChart2, Shield } from 'lucide-react'
import { useSignUp, useGoogleAuth } from '@/hooks/use-auth'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

// ── Google SVG icon ───────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}

// ── Benefits panel data ───────────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: UserCheck,
    heading: 'Preserve every memory',
    description: 'Create beautiful memorials that honour your loved ones and keep their stories alive for future generations.',
  },
  {
    icon: BarChart2,
    heading: 'Insights that matter',
    description: 'Explore mortality data trends, patterns, and analytics to gain a deeper understanding of life and loss.',
  },
  {
    icon: Shield,
    heading: 'Private and secure',
    description: 'Your data is protected with enterprise-grade security. Share only what you choose, with who you choose.',
  },
]

// ── EmailSentState ────────────────────────────────────────────────────────────

function EmailSentState({
  email,
  onResend,
  isPending,
}: {
  email: string
  onResend: () => void
  isPending: boolean
}) {
  return (
    <div className="text-center py-4">
      <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={28} className="text-green-500" />
      </div>
      <h2 className="text-xl font-semibold text-brand-secondary mb-2">Verify your email</h2>
      <p className="text-sm text-neutral-500 mb-1">
        We've sent a verification link to
      </p>
      <p className="text-sm font-medium text-brand-secondary mb-6">{email}</p>
      <p className="text-xs text-neutral-400 mb-4">
        Didn't receive it? Check your spam folder or
      </p>
      <button
        onClick={onResend}
        disabled={isPending}
        className="text-sm text-brand-primary font-medium hover:underline disabled:opacity-50"
      >
        {isPending ? 'Resending…' : 'Resend email'}
      </button>
    </div>
  )
}

// ── SignUpPage ────────────────────────────────────────────────────────────────

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const {
    form,
    onSubmit,
    isPending,
    error,
    emailSent,
    submittedEmail,
  } = useSignUp()
  const { handleGoogleAuth, isPending: googlePending, error: googleError } = useGoogleAuth()

  const {
    register,
    formState: { errors },
  } = form

  const combinedError = error ?? googleError

  return (
    <main className="min-h-screen flex">
      {/* ── Left: Form panel ── */}
      <div className="w-full md:w-[45%] flex flex-col justify-center px-8 md:px-16 py-12 bg-white">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 self-start">
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold tracking-tight">M</span>
          </div>
          <span className="text-brand-secondary font-bold text-lg tracking-tight">MATIEO</span>
        </Link>

        {emailSent ? (
          <EmailSentState
            email={submittedEmail}
            onResend={onSubmit}
            isPending={isPending}
          />
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-brand-secondary mb-1">
              Create your account
            </h1>
            <p className="text-sm text-neutral-500 mb-6">
              Already have an account?{' '}
              <Link to="/signin" className="text-brand-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googlePending || isPending}
              className="w-full flex items-center justify-center gap-3 border border-neutral-200 bg-white hover:bg-neutral-50
                text-sm font-medium text-neutral-700 py-2.5 rounded-lg transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative flex items-center mb-4">
              <div className="flex-1 border-t border-neutral-200" />
              <span className="mx-3 text-xs text-neutral-400">or continue with email</span>
              <div className="flex-1 border-t border-neutral-200" />
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1">
                  Full name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <User size={15} />
                  </span>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Smith"
                    {...register('fullName')}
                    className="w-full border border-neutral-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-neutral-900
                      placeholder:text-neutral-400 focus:outline-none focus:ring-2
                      focus:ring-brand-primary focus:border-transparent transition"
                  />
                </div>
                {errors.fullName && (
                  <ErrorMessage message={errors.fullName.message!} />
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <Mail size={15} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...register('email')}
                    className="w-full border border-neutral-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-neutral-900
                      placeholder:text-neutral-400 focus:outline-none focus:ring-2
                      focus:ring-brand-primary focus:border-transparent transition"
                  />
                </div>
                {errors.email && (
                  <ErrorMessage message={errors.email.message!} />
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <Lock size={15} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    {...register('password')}
                    className="w-full border border-neutral-200 rounded-lg pl-9 pr-10 py-2.5 text-sm text-neutral-900
                      placeholder:text-neutral-400 focus:outline-none focus:ring-2
                      focus:ring-brand-primary focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <ErrorMessage message={errors.password.message!} />
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending || googlePending}
                className="w-full bg-brand-primary hover:bg-brand-primaryHover text-white font-medium text-sm
                  py-2.5 rounded-lg transition-colors
                  disabled:bg-brand-primaryLight disabled:text-brand-primary disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 mt-2"
              >
                {isPending ? (
                  <>
                    <span
                      className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    Creating account…
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Auth error */}
              {combinedError && (
                <ErrorMessage message={combinedError} />
              )}
            </form>
          </>
        )}
      </div>

      {/* ── Right: Benefits panel ── */}
      <div className="hidden md:flex flex-1 bg-neutral-50 flex-col justify-center px-16">
        <div className="max-w-sm">
          <h2 className="text-xl font-semibold text-brand-secondary mb-8">
            Everything you need, in one place
          </h2>
          <ul className="space-y-8">
            {BENEFITS.map(({ icon: Icon, heading, description }) => (
              <li key={heading} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-primaryLight flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-brand-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-secondary mb-1">{heading}</p>
                  <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
