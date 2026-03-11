import { Link } from 'react-router-dom'
import { Mail, ChevronLeft, CircleCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useForgotPassword } from '@/hooks/use-auth'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

// ── ForgotPasswordPage ────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const { form, onSubmit, isPending, error, emailSent, submittedEmail, resend, resendCooldown } =
    useForgotPassword()

  const {
    register,
    formState: { errors },
  } = form

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm mx-auto px-4 sm:px-8 py-10 flex flex-col items-center gap-6">
        {/* Logo — both screens */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="w-9 h-9" aria-hidden="true" />
          <span className="text-brand-primary font-bold text-lg tracking-tight">MATIEO</span>
        </Link>

        {!emailSent ? (
          /* ── Screen 1: Enter email ── */
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-neutral-900">{t('auth.forgotPassword.heading')}</h1>
              <p className="text-sm text-neutral-500 mt-1">
                {t('auth.forgotPassword.subheading')}
              </p>
            </div>

            <form onSubmit={onSubmit} noValidate className="w-full space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  {t('auth.forgotPassword.emailLabel')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <Mail size={15} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                    {...register('email')}
                    className="w-full border border-neutral-200 rounded-lg pl-9 pr-3 py-2.5 text-sm
                      text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2
                      focus:ring-brand-primary focus:border-transparent transition"
                  />
                </div>
                {errors.email && <ErrorMessage message={errors.email.message!} />}
              </div>

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
                    {t('auth.forgotPassword.submitting')}
                  </>
                ) : (
                  t('auth.forgotPassword.submit')
                )}
              </button>

              {error && <ErrorMessage message={error} />}
            </form>
          </>
        ) : (
          /* ── Screen 2: Check your email ── */
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CircleCheck size={32} className="text-green-500" strokeWidth={1.5} />
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-neutral-900">{t('auth.forgotPassword.checkEmail.heading')}</h1>
              <p className="text-sm text-neutral-500 mt-1">{t('auth.forgotPassword.checkEmail.message')}</p>
              <p className="text-sm font-semibold text-neutral-900 mt-1">{submittedEmail}</p>
            </div>

            <button
              type="button"
              onClick={() => window.open('mailto:')}
              className="w-full bg-brand-primary hover:bg-brand-primaryHover text-white font-medium
                text-sm py-2.5 rounded-lg transition-colors"
            >
              {t('auth.forgotPassword.checkEmail.openEmail')}
            </button>

            {error && <ErrorMessage message={error} />}

            <p className="text-sm text-neutral-500">
              {t('auth.forgotPassword.checkEmail.notReceived')}{' '}
              {resendCooldown > 0 ? (
                <span className="text-neutral-400">
                  {t('auth.forgotPassword.checkEmail.resendIn', { count: resendCooldown })}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={resend}
                  disabled={isPending}
                  className="text-brand-primary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? t('auth.forgotPassword.submitting') : t('auth.forgotPassword.checkEmail.resend')}
                </button>
              )}
            </p>
          </>
        )}

        {/* Back to Sign in — both screens */}
        <Link
          to="/signin"
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          {t('auth.forgotPassword.backToSignIn')}
        </Link>

        {/* Footer — both screens */}
        <p className="text-xs text-neutral-400">{t('auth.copyright')}</p>
      </div>
    </main>
  )
}
