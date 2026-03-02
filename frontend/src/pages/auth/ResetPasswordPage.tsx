import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react'
import { useResetPassword } from '@/hooks/use-auth'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

// ── Logo mark (concentric circles) ───────────────────────────────────────────

function LogoMark() {
  return (
    <div className="w-9 h-9 rounded-full bg-brand-secondary flex items-center justify-center flex-shrink-0">
      <div className="w-[22px] h-[22px] rounded-full border-[2.5px] border-white/40 flex items-center justify-center">
        <div className="w-[9px] h-[9px] rounded-full bg-white" />
      </div>
    </div>
  )
}

// ── ResetPasswordPage ─────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  const { form, onSubmit, isPending, error } = useResetPassword()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    formState: { errors },
  } = form

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm mx-auto px-4 sm:px-8 py-10 flex flex-col items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <LogoMark />
          <span className="text-brand-primary font-bold text-lg tracking-tight">MATIEO</span>
        </Link>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Set New Password</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Choose a strong password for your account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} noValidate className="w-full space-y-4">
          {/* New Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              New Password
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
                className="w-full border border-neutral-200 rounded-lg pl-9 pr-10 py-2.5 text-sm
                  text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2
                  focus:ring-brand-primary focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <ErrorMessage message={errors.password.message!} />}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Lock size={15} />
              </span>
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repeat your password"
                {...register('confirmPassword')}
                className="w-full border border-neutral-200 rounded-lg pl-9 pr-10 py-2.5 text-sm
                  text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2
                  focus:ring-brand-primary focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <ErrorMessage message={errors.confirmPassword.message!} />
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
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
                Updating…
              </>
            ) : (
              'Update Password'
            )}
          </button>

          {/* Auth error */}
          {error && <ErrorMessage message={error} />}
        </form>

        {/* Back to Sign in */}
        <Link
          to="/signin"
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Back to Sign in
        </Link>

        {/* Footer */}
        <p className="text-xs text-neutral-400">© 2026 MATIEO</p>
      </div>
    </main>
  )
}
