import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Lock, Eye, EyeOff, ChevronLeft, ShieldAlert } from 'lucide-react'
import { useResetPassword } from '@/hooks/use-auth'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

// ── ResetPasswordPage ─────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const { form, onSubmit, isPending, error, isValidLink } = useResetPassword()
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
          <img src="/logo.png" alt="" className="w-9 h-9" aria-hidden="true" />
          <span className="text-brand-primary font-bold text-lg tracking-tight">MATIEO</span>
        </Link>

        {!isValidLink ? (
          /* ── Invalid / expired link ── */
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <ShieldAlert size={32} className="text-red-500" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-neutral-900">
                {t('auth.resetPassword.invalidLink.heading')}
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                {t('auth.resetPassword.invalidLink.message')}
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="w-full text-center bg-brand-primary hover:bg-brand-primaryHover text-white
                font-medium text-sm py-2.5 rounded-lg transition-colors"
            >
              {t('auth.resetPassword.invalidLink.request')}
            </Link>
          </>
        ) : (
          <>
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900">{t('auth.resetPassword.heading')}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {t('auth.resetPassword.subheading')}
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
              {t('auth.resetPassword.newPassword')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Lock size={15} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                {...register('password')}
                className="w-full border border-neutral-200 rounded-lg pl-9 pr-10 py-2.5 text-sm
                  text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2
                  focus:ring-brand-primary focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('auth.signUp.hidePassword') : t('auth.signUp.showPassword')}
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
              {t('auth.resetPassword.confirmPassword')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Lock size={15} />
              </span>
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                {...register('confirmPassword')}
                className="w-full border border-neutral-200 rounded-lg pl-9 pr-10 py-2.5 text-sm
                  text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2
                  focus:ring-brand-primary focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? t('auth.signUp.hideConfirmPassword') : t('auth.signUp.showConfirmPassword')}
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
                {t('auth.resetPassword.submitting')}
              </>
            ) : (
              t('auth.resetPassword.submit')
            )}
          </button>

          {/* Auth error */}
          {error && <ErrorMessage message={error} />}
        </form>
          </>
        )}

        {/* Back to Sign in */}
        <Link
          to="/signin"
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          {t('auth.resetPassword.backToSignIn')}
        </Link>

        {/* Footer */}
        <p className="text-xs text-neutral-400">{t('auth.copyright')}</p>
      </div>
    </main>
  )
}
