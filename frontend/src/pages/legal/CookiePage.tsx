import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '@/components/layout/Navbar'
import { POLICY_VERSIONS } from '@/config/policy-versions'

export default function CookiePage() {
  const { t, i18n } = useTranslation()
  const lastUpdated = POLICY_VERSIONS.cookie.toLocaleDateString(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-6 md:px-8 py-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">{t('cookie.heading')}</h1>
        <p className="text-sm text-neutral-400 mb-12">{t('policy.lastUpdatedLabel')} {lastUpdated}</p>

        {/* 1. What Are Cookies */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('cookie.s1Heading')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            Cookies are small text files that are placed on your device when you visit a website.
            They are widely used to make websites work, to work more efficiently, and to provide
            information to the website owners. Cookies do not contain any information that
            personally identifies you, but personal information that we store about you may be
            linked to the information stored in and obtained from cookies.
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            We use cookies and similar tracking technologies (such as local storage and session
            storage) on the MATIEO platform. By continuing to use our Service, you consent to
            our use of cookies in accordance with this Cookie Policy.
          </p>
        </section>

        {/* 2. Types of Cookies We Use */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('cookie.s2Heading')}</h2>

          <h3 className="text-base font-semibold text-neutral-800 mt-6 mb-2">{t('cookie.s21Heading')}</h3>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            These cookies are strictly necessary for the platform to function and cannot be
            switched off. They are set in response to actions you take, such as logging in or
            filling in forms. Without these cookies, services you have asked for cannot be provided.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-600 mb-4">
            <li>Authentication tokens (Supabase session cookies)</li>
            <li>Security and fraud prevention cookies</li>
            <li>Load-balancing cookies to ensure platform stability</li>
          </ul>

          <h3 className="text-base font-semibold text-neutral-800 mt-6 mb-2">{t('cookie.s22Heading')}</h3>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            These cookies allow us to count visits and understand how visitors interact with our
            platform so we can measure and improve its performance. All information collected is
            aggregated and therefore anonymous.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-600 mb-4">
            <li>Page view and session duration tracking</li>
            <li>Feature usage analytics</li>
            <li>Error monitoring and performance metrics</li>
          </ul>

          <h3 className="text-base font-semibold text-neutral-800 mt-6 mb-2">{t('cookie.s23Heading')}</h3>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            These cookies enable us to provide enhanced functionality and personalisation. They may
            be set by us or by third-party providers whose services we have added to our platform.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-600 mb-4">
            <li>Language and region preference storage</li>
            <li>Dark mode and display preference storage</li>
            <li>Recently viewed memorial preferences</li>
          </ul>
        </section>

        {/* 3. Third-Party Cookies */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('cookie.s3Heading')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            Some pages on our platform may include content or features provided by third parties,
            including:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-600 mb-4">
            <li><strong>Supabase</strong> — authentication and database sessions</li>
            <li><strong>Cloudinary</strong> — media delivery and image optimisation</li>
            <li><strong>Google OAuth</strong> — when you choose to sign in with Google</li>
          </ul>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            These third parties may set their own cookies. We do not control the use of these
            cookies and recommend reviewing the privacy and cookie policies of these providers
            directly.
          </p>
        </section>

        {/* 4. Managing Your Cookies */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('cookie.s4Heading')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            Most web browsers allow you to manage your cookie preferences through their settings.
            You can set your browser to refuse cookies, or to alert you when cookies are being
            sent. Please note that disabling essential cookies may prevent you from using certain
            features of our platform, including signing in.
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            To manage cookies in your browser, refer to the help documentation for:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-600 mb-4">
            <li>Google Chrome — Settings → Privacy and security → Cookies</li>
            <li>Mozilla Firefox — Options → Privacy & Security → Cookies</li>
            <li>Safari — Preferences → Privacy → Cookies</li>
            <li>Microsoft Edge — Settings → Cookies and site permissions</li>
          </ul>
        </section>

        {/* 5. Changes to This Policy */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('cookie.s5Heading')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            We may update this Cookie Policy from time to time to reflect changes in technology,
            legislation, or our data practices. When we make material changes, we will update the
            "Last updated" date at the top of this page. We encourage you to review this policy
            periodically to stay informed about how we use cookies.
          </p>
        </section>

        {/* 6. Contact Us */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-4">{t('cookie.s6Heading')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            If you have any questions about our use of cookies, please contact us:
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

        {/* Bottom bar — links to other legal pages */}
        <div className="mt-16 pt-8 border-t border-neutral-100 flex flex-col sm:flex-row gap-4">
          <Link
            to="/privacy"
            className="flex items-center gap-1 text-sm text-brand-primary hover:underline"
          >
            {t('cookie.viewPrivacy')}
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/terms"
            className="flex items-center gap-1 text-sm text-brand-primary hover:underline"
          >
            {t('cookie.viewTerms')}
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    </div>
  )
}
