import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '@/components/layout/Navbar'
import { POLICY_VERSIONS } from '@/config/policy-versions'

export default function TermsPage() {
  const { t, i18n } = useTranslation()
  const lastUpdated = POLICY_VERSIONS.terms.toLocaleDateString(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-6 md:px-8 py-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">{t('terms.heading')}</h1>
        <p className="text-sm text-neutral-400 mb-12">{t('policy.lastUpdatedLabel')} {lastUpdated}</p>

        {/* 1. Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('terms.s1Heading')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            Welcome to MATIEO. We provide a platform for creating dignified digital memorials,
            preserving the stories and legacies of loved ones for families and communities around
            the world.
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            By accessing or using our service, you agree to be bound by these Terms of Service.
            Please read them carefully before using the platform. If you do not agree to these
            terms, you may not access or use our services.
          </p>
        </section>

        {/* 2. Use of Service */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('terms.s2Heading')}</h2>

          <h3 className="text-base font-semibold text-neutral-800 mt-6 mb-2">{t('terms.s21Heading')}</h3>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            You must be at least 18 years of age to use MATIEO. By using the platform, you
            represent and warrant that you meet this age requirement and have the legal capacity
            to enter into a binding agreement.
          </p>

          <h3 className="text-base font-semibold text-neutral-800 mt-6 mb-2">
            {t('terms.s22Heading')}
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            When you create an account, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-600 mb-4">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Keep your password secure and confidential</li>
            <li>Notify us immediately of any unauthorized access to your account</li>
          </ul>

          <h3 className="text-base font-semibold text-neutral-800 mt-6 mb-2">
            {t('terms.s23Heading')}
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            You agree not to use MATIEO to:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-600 mb-4">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the intellectual property rights of others</li>
            <li>Upload or distribute viruses or other harmful software</li>
            <li>Send unsolicited communications or spam</li>
            <li>Attempt to gain unauthorized access to any part of the platform</li>
          </ul>
        </section>

        {/* 3. Data and Privacy */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('terms.s3Heading')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            Your use of MATIEO is also governed by our{' '}
            <Link to="/privacy" className="text-brand-primary underline">
              {t('terms.privacyLink')}
            </Link>
            , which is incorporated into these Terms of Service by reference. By using the
            platform, you consent to the collection, use, and sharing of your information as
            described in our Privacy Policy.
          </p>
        </section>

        {/* 4. Intellectual Property */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">
            {t('terms.s4Heading')}
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            The MATIEO platform, including its design, features, and underlying technology, is
            owned by MATIEO and protected by applicable intellectual property laws. You may not
            copy, modify, distribute, or create derivative works without our explicit written
            permission.
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            By uploading content to MATIEO, you grant us a non-exclusive, worldwide, royalty-free
            license to use, display, and distribute that content solely for the purpose of
            operating and improving the platform and delivering the service to you.
          </p>
        </section>

        {/* 5. Free Trial and Subscriptions */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">
            {t('terms.s5Heading')}
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            MATIEO offers a 14-day free trial for new accounts. During the trial period, you have
            access to all platform features without charge. No payment information is required to
            start your trial.
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            After the trial period, continued access requires a paid subscription. You may cancel
            your subscription at any time. Cancellation takes effect at the end of the current
            billing cycle, and you will retain access to the platform until that date.
          </p>
        </section>

        {/* 6. Limitation of Liability */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">
            {t('terms.s6Heading')}
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            To the maximum extent permitted by applicable law, MATIEO and its affiliates,
            officers, employees, and partners shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages arising from your use of, or inability to
            use, the platform, even if we have been advised of the possibility of such damages.
          </p>
        </section>

        {/* 7. Termination */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('terms.s7Heading')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            We reserve the right to suspend or terminate your account and access to MATIEO at our
            sole discretion, without notice, if we believe you have violated these Terms of
            Service or engaged in conduct that is harmful to other users, us, or third parties.
            You may also delete your account at any time through your account settings.
          </p>
        </section>

        {/* 8. Changes to Terms */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('terms.s8Heading')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            We may update these Terms of Service from time to time. When we make material changes,
            we will notify you by email or by displaying a prominent notice on the platform. Your
            continued use of MATIEO after any changes constitutes your acceptance of the new
            terms.
          </p>
        </section>

        {/* 9. Contact Us */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('terms.s9Heading')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            <strong>Email:</strong> legal@matieo.com
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            <strong>Address:</strong> MATIEO Legal Department
            <br />
            123 Memorial Drive, Suite 100
            <br />
            Kuala Lumpur, Malaysia
          </p>
        </section>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-neutral-100 flex flex-col sm:flex-row gap-4">
          <Link
            to="/privacy"
            className="flex items-center gap-1 text-sm text-brand-primary hover:underline"
          >
            {t('terms.viewPrivacy')}
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/cookie-policy"
            className="flex items-center gap-1 text-sm text-brand-primary hover:underline"
          >
            {t('terms.viewCookie')}
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    </div>
  )
}
