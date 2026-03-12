import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSignUp, useGoogleAuth } from '@/hooks/use-auth'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

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

// ── Product mockup (right panel) ──────────────────────────────────────────────

function AppMockup() {
  return (
    <div className="relative w-full max-w-lg">
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

// ── VerificationBanner ────────────────────────────────────────────────────────

function VerificationBanner({ email }: { email: string }) {
  const { t } = useTranslation()
  return (
    <div
      role="status"
      className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
    >
      <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-green-800">{t('auth.signUp.verification.title')}</p>
        <p className="text-xs text-green-700 mt-0.5">
          {t('auth.signUp.verification.message')}{' '}
          <span className="font-medium">{email}</span>.
        </p>
      </div>
    </div>
  )
}

// ── SignUpPage ────────────────────────────────────────────────────────────────

export default function SignUpPage() {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [searchParams] = useSearchParams()
  const forceOrg = searchParams.get('type') === 'organization'

  const { form, onSubmit, isPending, error, emailSent, submittedEmail } = useSignUp()
  const { handleGoogleAuth, isPending: googlePending, error: googleError } = useGoogleAuth()

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

  const accountType = watch('accountType')
  const combinedError = error ?? googleError

  useEffect(() => {
    if (forceOrg) setValue('accountType', 'organization')
  }, [forceOrg, setValue])

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
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">{t('auth.signUp.heading')}</h1>
          <p className="text-sm text-neutral-500 mb-6">
            {t('auth.signUp.subheading')}
          </p>

          {/* Account type selector — segmented pill */}
          {!forceOrg ? (
            <div
              role="group"
              aria-label="Account type"
              className="relative flex items-center bg-neutral-100 rounded-full p-1 mb-5"
            >
              {/* Sliding white pill */}
              <div
                aria-hidden="true"
                className={`absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
                  accountType === 'organization' ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
              {/* Individual button */}
              <button
                type="button"
                onClick={() => setValue('accountType', 'individual')}
                className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                  accountType === 'individual'
                    ? 'text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {t('auth.signUp.individual')}
              </button>
              {/* Organization button */}
              <button
                type="button"
                onClick={() => setValue('accountType', 'organization')}
                className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                  accountType === 'organization'
                    ? 'text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {t('auth.signUp.organization')}
              </button>
            </div>
          ) : (
            /* forceOrg: single full-width pill, no toggle */
            <div className="mb-5">
              <div className="flex items-center bg-neutral-100 rounded-full p-1">
                <div className="flex-1 py-2 text-sm font-medium text-center text-neutral-900 bg-white rounded-full shadow-sm">
                  {t('auth.signUp.organization')}
                </div>
              </div>
            </div>
          )}

          {/* Google button */}
          <button
            type="button"
            onClick={() => accountType && handleGoogleAuth(accountType)}
            disabled={googlePending || isPending || !accountType}
            className="w-full flex items-center justify-center gap-3 bg-neutral-100 hover:bg-neutral-200
              text-sm font-medium text-neutral-700 py-2.5 rounded-lg transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed mb-5"
          >
            <GoogleIcon />
            {t('auth.signUp.google')}
          </button>

          {/* Divider */}
          <div className="relative flex items-center mb-5">
            <div className="flex-1 border-t border-neutral-200" />
            <span className="mx-3 text-xs text-neutral-400">{t('auth.signUp.or')}</span>
            <div className="flex-1 border-t border-neutral-200" />
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {/* Name fields — conditional on account type */}
            {accountType === 'individual' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-neutral-700 mb-1"
                  >
                    {t('auth.signUp.firstName')}
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Shariff"
                    {...register('firstName')}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-900
                      placeholder:text-neutral-400 focus:outline-none focus:ring-2
                      focus:ring-brand-primary focus:border-transparent transition"
                  />
                  {errors.firstName && (
                    <ErrorMessage message={errors.firstName.message!} />
                  )}
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-neutral-700 mb-1"
                  >
                    {t('auth.signUp.lastName')}
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Saim"
                    {...register('lastName')}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-900
                      placeholder:text-neutral-400 focus:outline-none focus:ring-2
                      focus:ring-brand-primary focus:border-transparent transition"
                  />
                  {errors.lastName && (
                    <ErrorMessage message={errors.lastName.message!} />
                  )}
                </div>
              </div>
            )}

            {accountType === 'organization' && (
              <div>
                <label
                  htmlFor="organizationName"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  {t('auth.signUp.organizationName')}
                </label>
                <input
                  id="organizationName"
                  type="text"
                  autoComplete="organization"
                  placeholder={t('auth.signUp.organizationNamePlaceholder')}
                  {...register('organizationName')}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-900
                    placeholder:text-neutral-400 focus:outline-none focus:ring-2
                    focus:ring-brand-primary focus:border-transparent transition"
                />
                {errors.organizationName && (
                  <ErrorMessage message={errors.organizationName.message!} />
                )}
              </div>
            )}

            {/* Email + Confirm email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  {t('auth.signUp.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@email.com"
                  {...register('email')}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-900
                    placeholder:text-neutral-400 focus:outline-none focus:ring-2
                    focus:ring-brand-primary focus:border-transparent transition"
                />
                {errors.email && (
                  <ErrorMessage message={errors.email.message!} />
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmEmail"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  {t('auth.signUp.confirmEmail')}
                </label>
                <input
                  id="confirmEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="name@email.com"
                  {...register('confirmEmail')}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-900
                    placeholder:text-neutral-400 focus:outline-none focus:ring-2
                    focus:ring-brand-primary focus:border-transparent transition"
                />
                {errors.confirmEmail && (
                  <ErrorMessage message={errors.confirmEmail.message!} />
                )}
              </div>
            </div>

            {/* Password + Confirm password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  {t('auth.signUp.password')}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Password"
                    {...register('password')}
                    className="w-full border border-neutral-200 rounded-lg px-3 pr-9 py-2.5 text-sm text-neutral-900
                      placeholder:text-neutral-400 focus:outline-none focus:ring-2
                      focus:ring-brand-primary focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? t('auth.signUp.hidePassword') : t('auth.signUp.showPassword')}
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
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  {t('auth.signUp.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Password"
                    {...register('confirmPassword')}
                    className="w-full border border-neutral-200 rounded-lg px-3 pr-9 py-2.5 text-sm text-neutral-900
                      placeholder:text-neutral-400 focus:outline-none focus:ring-2
                      focus:ring-brand-primary focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? t('auth.signUp.hideConfirmPassword') : t('auth.signUp.showConfirmPassword')}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <ErrorMessage message={errors.confirmPassword.message!} />
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending || googlePending || !accountType}
              className="w-full bg-brand-primary hover:bg-brand-primaryHover text-white font-medium text-sm
                py-2.5 rounded-lg transition-colors mt-1
                disabled:bg-brand-primaryLight disabled:text-brand-primary disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span
                    className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  {t('auth.signUp.submitting')}
                </>
              ) : (
                t('auth.signUp.submit')
              )}
            </button>

            {/* Auth error */}
            {combinedError && <ErrorMessage message={combinedError} />}

            {/* Verification banner */}
            {emailSent && <VerificationBanner email={submittedEmail} />}
          </form>

          {/* Already a member */}
          <p className="text-sm text-neutral-500 mt-5">
            {t('auth.signUp.alreadyMember')}{' '}
            <Link to="/signin" className="text-brand-primary font-semibold hover:underline">
              {t('auth.signUp.login')}
            </Link>
          </p>

          {/* Terms */}
          <p className="text-xs text-neutral-400 mt-4 leading-relaxed">
            {t('auth.terms')}{' '}
            <a href="/terms" className="underline hover:text-neutral-600 transition-colors">
              {t('auth.termsLink')}
            </a>{' '}
            {t('auth.and')}{' '}
            <a href="/privacy" className="underline hover:text-neutral-600 transition-colors">
              {t('auth.privacyLink')}
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-neutral-400 mt-8 text-center">{t('auth.copyright')}</p>
      </div>

      {/* ── Right: Product panel ── */}
      <div className="hidden md:flex flex-1 bg-neutral-50 flex-col justify-center px-14 py-16">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold text-neutral-800 leading-snug mb-3">
            {t('auth.rightPanel.heading')}
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed mb-12">
            {t('auth.rightPanel.subheading')}
          </p>
          <AppMockup />
        </div>
      </div>
    </main>
  )
}
