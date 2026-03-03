import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useSignIn, useGoogleAuth } from '@/hooks/use-auth'

// ── Google G icon ──────────────────────────────────────────────────────────────

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

// ── SignInModal ────────────────────────────────────────────────────────────────

interface SignInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SignInModal({ open, onOpenChange, onSuccess }: SignInModalProps) {
  const [showPassword, setShowPassword] = useState(false)

  const { form, onSubmit, isPending, error } = useSignIn({ onSuccess })
  const {
    handleGoogleAuth,
    isPending: googlePending,
    error: googleError,
  } = useGoogleAuth({
    redirectTo: window.location.origin + '/memorials/create',
  })

  const {
    register,
    formState: { errors },
  } = form

  const combinedError = error ?? googleError

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Heading */}
        <DialogTitle className="text-2xl font-bold text-neutral-900 mb-1">Sign in</DialogTitle>
        <DialogDescription className="text-sm text-neutral-500 mb-6">
          Welcome back! Please enter your details.
        </DialogDescription>

        {/* Form */}
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="modal-email" className="block text-sm font-medium text-neutral-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Mail size={15} />
              </span>
              <input
                id="modal-email"
                type="email"
                autoComplete="email"
                placeholder="name@email.com"
                {...register('email')}
                className="w-full border border-neutral-200 rounded-lg pl-9 pr-3 py-2.5 text-sm
                  text-neutral-900 placeholder:text-neutral-400 focus:outline-none
                  focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
              />
            </div>
            {errors.email && <ErrorMessage message={errors.email.message!} />}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="modal-password" className="block text-sm font-medium text-neutral-700 mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Lock size={15} />
              </span>
              <input
                id="modal-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full border border-neutral-200 rounded-lg pl-9 pr-10 py-2.5 text-sm
                  text-neutral-900 placeholder:text-neutral-400 focus:outline-none
                  focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400
                  hover:text-neutral-600 transition-colors"
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
              onClick={() => onOpenChange(false)}
              className="text-sm text-brand-primary font-medium hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Sign In */}
          <button
            type="submit"
            disabled={isPending || googlePending}
            className="w-full bg-brand-primary hover:bg-brand-primaryHover text-white font-medium
              text-sm py-2.5 rounded-lg transition-colors
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

          {combinedError && <ErrorMessage message={combinedError} />}

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googlePending || isPending}
            className="w-full flex items-center justify-center gap-3 bg-neutral-100
              hover:bg-neutral-200 text-sm font-medium text-neutral-700 py-2.5 rounded-lg
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            onClick={() => onOpenChange(false)}
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
          <Link to="/terms" onClick={() => onOpenChange(false)} className="underline hover:text-neutral-600">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" onClick={() => onOpenChange(false)} className="underline hover:text-neutral-600">
            Privacy Policy
          </Link>
        </p>

        <p className="text-xs text-neutral-400 mt-3 text-center">© 2026 MATIEO</p>
      </DialogContent>
    </Dialog>
  )
}
