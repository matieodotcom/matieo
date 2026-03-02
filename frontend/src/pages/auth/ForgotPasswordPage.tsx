import { Link } from 'react-router-dom'
import { Mail, ChevronLeft, CircleCheck } from 'lucide-react'
import { useForgotPassword } from '@/hooks/use-auth'
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

// ── ForgotPasswordPage ────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const { form, onSubmit, isPending, error, emailSent, submittedEmail, resend } =
    useForgotPassword()

  const {
    register,
    formState: { errors },
  } = form

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm mx-auto px-8 py-10 flex flex-col items-center gap-6">
        {/* Logo — both screens */}
        <Link to="/" className="flex items-center gap-2">
          <LogoMark />
          <span className="text-brand-primary font-bold text-lg tracking-tight">MATIEO</span>
        </Link>

        {!emailSent ? (
          /* ── Screen 1: Enter email ── */
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-neutral-900">Forgot Password?</h1>
              <p className="text-sm text-neutral-500 mt-1">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            <form onSubmit={onSubmit} noValidate className="w-full space-y-4">
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
                    Sending…
                  </>
                ) : (
                  'Reset Password'
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
              <h1 className="text-2xl font-bold text-neutral-900">Check your email</h1>
              <p className="text-sm text-neutral-500 mt-1">We sent a password reset link to</p>
              <p className="text-sm font-semibold text-neutral-900 mt-1">{submittedEmail}</p>
            </div>

            <button
              type="button"
              onClick={() => window.open('mailto:')}
              className="w-full bg-brand-primary hover:bg-brand-primaryHover text-white font-medium
                text-sm py-2.5 rounded-lg transition-colors"
            >
              Open email
            </button>

            <p className="text-sm text-neutral-500">
              Didn't receive the email?{' '}
              <button
                type="button"
                onClick={resend}
                className="text-brand-primary font-medium hover:underline"
              >
                Click to resend
              </button>
            </p>
          </>
        )}

        {/* Back to Sign in — both screens */}
        <Link
          to="/signin"
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Back to Sign in
        </Link>

        {/* Footer — both screens */}
        <p className="text-xs text-neutral-400">© 2026 MATIEO</p>
      </div>
    </main>
  )
}
