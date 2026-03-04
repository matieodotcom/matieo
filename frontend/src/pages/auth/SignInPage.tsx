import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, MailWarning } from 'lucide-react'
import { useSignIn, useGoogleAuth } from '@/hooks/use-auth'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

// ── UnconfirmedEmailBanner ────────────────────────────────────────────────────

function UnconfirmedEmailBanner({
  onResend,
  isResending,
  cooldown,
}: {
  onResend: () => void
  isResending: boolean
  cooldown: number
}) {
  return (
    <div role="alert" className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
      <MailWarning size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-800">Email not verified</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Please verify your email before signing in.
        </p>
        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0 || isResending}
          className="mt-2 text-xs font-medium text-amber-800 underline
            disabled:no-underline disabled:text-amber-400 disabled:cursor-not-allowed"
        >
          {isResending
            ? 'Sending…'
            : cooldown > 0
            ? `Resend in ${cooldown}s`
            : 'Resend verification email'}
        </button>
      </div>
    </div>
  )
}

// ── Google G icon ─────────────────────────────────────────────────────────────

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

// ── App mockup (right panel) ──────────────────────────────────────────────────

function AppMockup() {
  return (
    <div className="relative w-full max-w-lg">
      {/* Tablet frame */}
      <div className="rounded-2xl bg-white border border-neutral-200 shadow-xl overflow-hidden">
        <div className="bg-white border-b border-neutral-100 px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-brand-secondary" />
            <span className="text-xs font-bold text-brand-secondary tracking-tight">MATIEO</span>
          </div>
          <div className="flex-1 bg-neutral-100 rounded-full h-5" />
        </div>
        <div className="p-4 bg-neutral-50">
          <div className="bg-white rounded-xl border border-neutral-100 p-4 mb-3">
            <p className="text-xs font-semibold text-neutral-700 mb-3">Memorial Gallery</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg overflow-hidden">
                  <div className="h-16 bg-neutral-200" />
                  <div className="pt-2 space-y-1">
                    <div className="h-2 bg-neutral-200 rounded w-3/4" />
                    <div className="h-1.5 bg-neutral-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-xl border border-neutral-100 p-3">
              <div className="h-2 bg-neutral-100 rounded w-1/2 mb-2" />
              <div className="h-5 bg-brand-primaryLight rounded w-2/3" />
            </div>
            <div className="bg-white rounded-xl border border-neutral-100 p-3">
              <div className="h-2 bg-neutral-100 rounded w-1/2 mb-2" />
              <div className="h-5 bg-brand-primaryLight rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
      {/* Floating phone frame */}
      <div className="absolute -bottom-4 -left-6 w-28 rounded-2xl bg-white border border-neutral-200 shadow-xl overflow-hidden">
        <div className="bg-brand-primary px-2 py-2">
          <div className="h-1.5 bg-white/30 rounded w-2/3 mb-1" />
          <div className="h-3 bg-white rounded w-1/2" />
        </div>
        <div className="p-2 space-y-1.5">
          <div className="h-2 bg-neutral-100 rounded" />
          <div className="h-2 bg-neutral-100 rounded w-4/5" />
          <div className="h-6 bg-brand-primaryLight rounded mt-2" />
        </div>
      </div>
    </div>
  )
}

// ── SignInPage ────────────────────────────────────────────────────────────────

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)

  const {
    form,
    onSubmit,
    isPending,
    error,
    isEmailUnconfirmed,
    resendVerification,
    isResending,
    resendCooldown,
  } = useSignIn()
  const { handleGoogleAuth, isPending: googlePending, error: googleError } = useGoogleAuth()

  const {
    register,
    formState: { errors },
  } = form

  const combinedError = error ?? googleError

  return (
    <main className="min-h-screen flex">
      {/* ── Left: Form panel ── */}
      <div className="w-full md:w-[45%] flex flex-col px-6 sm:px-10 md:px-16 py-10 bg-white">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-10 self-start">
          <img src="/logo.png" alt="" className="w-9 h-9" aria-hidden="true" />
          <span className="text-brand-primary font-bold text-lg tracking-tight">MATIEO</span>
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
          {/* Heading */}
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Sign in</h1>
          <p className="text-sm text-neutral-500 mb-6">
            Welcome back! Please enter your details.
          </p>

          {/* Form */}
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <Mail size={15} />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@email.com"
                  {...register('email')}
                  className="w-full border border-neutral-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-neutral-900
                    placeholder:text-neutral-400 focus:outline-none focus:ring-2
                    focus:ring-brand-primary focus:border-transparent transition"
                />
              </div>
              {errors.email && <ErrorMessage message={errors.email.message!} />}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <Lock size={15} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
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
              {errors.password && <ErrorMessage message={errors.password.message!} />}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-1">
              <Link
                to="/forgot-password"
                className="text-sm text-brand-primary font-medium hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={isPending || googlePending}
              className="w-full bg-brand-primary hover:bg-brand-primaryHover text-white font-medium text-sm
                py-2.5 rounded-lg transition-colors
                disabled:bg-brand-primaryLight disabled:text-brand-primary disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span
                    className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Auth error / unconfirmed email */}
            {isEmailUnconfirmed ? (
              <UnconfirmedEmailBanner
                onResend={resendVerification}
                isResending={isResending}
                cooldown={resendCooldown}
              />
            ) : (
              combinedError && <ErrorMessage message={combinedError} />
            )}

            {/* Login with Google */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googlePending || isPending}
              className="w-full flex items-center justify-center gap-3 bg-neutral-100 hover:bg-neutral-200
                text-sm font-medium text-neutral-700 py-2.5 rounded-lg transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              Login with Google
            </button>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-1 border-t border-neutral-200" />
              <span className="mx-3 text-xs text-neutral-400">or</span>
              <div className="flex-1 border-t border-neutral-200" />
            </div>

            {/* Create New Account */}
            <Link
              to="/signup"
              className="w-full flex items-center justify-center border border-neutral-200 bg-white
                hover:bg-neutral-50 text-sm font-medium text-neutral-700 py-2.5 rounded-lg
                transition-colors"
            >
              Create New Account
            </Link>
          </form>

          {/* Terms */}
          <p className="text-xs text-neutral-400 mt-5 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline hover:text-neutral-600 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-neutral-600 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-neutral-400 mt-8 text-center">© 2026 MATIEO</p>
      </div>

      {/* ── Right: Product panel ── */}
      <div className="hidden md:flex flex-1 bg-neutral-50 flex-col justify-center px-8 md:px-14 py-16">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold text-neutral-800 leading-snug mb-3">
            A Modern Way to Remember
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed mb-12">
            Create and share digital obituaries and memorials with dignity,
            simplicity, and care.
          </p>
          <AppMockup />
        </div>
      </div>
    </main>
  )
}
