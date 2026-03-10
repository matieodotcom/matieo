import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '@/components/layout/Navbar'

export default function PrivacyPage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-6 md:px-8 py-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">{t('privacy.heading')}</h1>
        <p className="text-sm text-neutral-400 mb-12">{t('privacy.lastUpdated')}</p>

        {/* 1. Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('privacy.s1Heading')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            Welcome to MATIEO ("we," "our," or "us"). This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you visit our platform, including our
            website, services, and applications (collectively, the "Service").
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            By accessing or using our Service, you agree to the collection and use of information
            in accordance with this Privacy Policy. If you disagree with any part of this policy,
            please do not access the Service.
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">
            {t('privacy.s2Heading')}
          </h2>

          <h3 className="text-base font-semibold text-neutral-800 mt-6 mb-2">
            {t('privacy.s21Heading')}
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            We collect information you voluntarily provide when you register for an account or use
            our Service, including:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-600 mb-4">
            <li>Name, email address, and password</li>
            <li>Profile information and preferences</li>
            <li>Memorial content including photos, text, and tributes</li>
            <li>Payment and billing information</li>
          </ul>

          <h3 className="text-base font-semibold text-neutral-800 mt-6 mb-2">
            {t('privacy.s22Heading')}
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            When you use the Service, we automatically collect certain information, including:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-600 mb-4">
            <li>Device type, browser type, and operating system</li>
            <li>IP address and general location data</li>
            <li>Pages visited, time spent, and navigation paths</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h3 className="text-base font-semibold text-neutral-800 mt-6 mb-2">
            {t('privacy.s23Heading')}
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            We may receive information about you from third parties, such as when you sign in
            using Google OAuth. This may include your name, email address, and profile photo as
            provided by the third-party service.
          </p>
        </section>

        {/* 3. How We Use Your Information */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">
            {t('privacy.s3Heading')}
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            We use the information we collect to operate and improve the Service, including to:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-600 mb-4">
            <li>Create and manage your account</li>
            <li>Provide and personalise platform features</li>
            <li>Process payments and manage subscriptions</li>
            <li>Send transactional emails and service notifications</li>
            <li>Analyse usage patterns to improve the platform</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        {/* 4. How We Share Your Information */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">
            {t('privacy.s4Heading')}
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            We do not sell your personal information. We may share your information with trusted
            third-party service providers who assist us in operating the platform, subject to
            confidentiality obligations. These include cloud infrastructure providers, payment
            processors, and analytics services.
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            We may also disclose your information where required by law, court order, or
            governmental authority, or to protect the rights, property, or safety of MATIEO,
            our users, or the public.
          </p>
        </section>

        {/* 5. Cookies */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('privacy.s5Heading')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            We use cookies and similar tracking technologies to maintain your session, remember
            your preferences, and analyse platform usage. You can control cookie settings through
            your browser. Disabling cookies may affect certain platform functionality.
          </p>
        </section>

        {/* 6. Data Retention */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('privacy.s6Heading')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            We retain your personal information for as long as your account is active or as needed
            to provide the Service. When you delete your account, we will delete or anonymise your
            personal information within 30 days, except where we are required to retain it for
            legal or compliance purposes.
          </p>
        </section>

        {/* 7. Your Rights */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('privacy.s7Heading')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            Depending on your location, you may have the right to access, correct, or delete the
            personal information we hold about you, to object to or restrict certain processing,
            and to request a portable copy of your data. To exercise these rights, please contact
            us at legal@matieo.com.
          </p>
        </section>

        {/* 8. Changes to This Policy */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">
            {t('privacy.s8Heading')}
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            We may update this Privacy Policy from time to time. When we make material changes, we
            will notify you by email or by displaying a prominent notice on the platform. Your
            continued use of MATIEO after any changes constitutes your acceptance of the updated
            policy.
          </p>
        </section>

        {/* 9. Contact Us */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('privacy.s9Heading')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            If you have any questions about this Privacy Policy, please contact us:
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
        <div className="mt-16 pt-8 border-t border-neutral-100">
          <Link
            to="/terms"
            className="flex items-center gap-1 text-sm text-brand-primary hover:underline"
          >
            {t('privacy.viewTerms')}
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    </div>
  )
}
