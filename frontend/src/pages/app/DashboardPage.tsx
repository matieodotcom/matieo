import { Link } from 'react-router-dom'
import { Plus, Heart, BarChart2, Briefcase } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useProfile } from '@/hooks/use-profile'

export default function DashboardPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const fullName = user?.user_metadata?.full_name as string | undefined
  const firstName = fullName?.split(' ')[0] ?? 'there'
  const { data: profile } = useProfile()
  const isOrganization = profile?.account_type === 'organization'

  const QUICK_ACTIONS = [
    {
      label: t('dashboard.quickActions.createMemorial'),
      description: t('dashboard.quickActions.createMemorialDesc'),
      icon: Plus,
      to: '/dashboard/memorials/create',
    },
    {
      label: t('dashboard.quickActions.browseMemorials'),
      description: t('dashboard.quickActions.browseMemorialsDesc'),
      icon: Heart,
      to: '/memorials',
    },
    {
      label: t('dashboard.quickActions.insights'),
      description: t('dashboard.quickActions.insightsDesc'),
      icon: BarChart2,
      to: '/dashboard/insights',
    },
    ...(isOrganization
      ? [{
          label: t('dashboard.quickActions.services'),
          description: t('dashboard.quickActions.servicesDesc'),
          icon: Briefcase,
          to: '/dashboard/services',
        }]
      : []),
  ]

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {t('dashboard.welcome', { name: firstName })}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
        {QUICK_ACTIONS.map(({ label, description, icon: Icon, to }) => (
          <Link
            key={to}
            to={to}
            className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 p-6 hover:shadow-sm transition-shadow flex flex-col gap-3"
          >
            <Icon size={24} className="text-brand-primary" aria-hidden="true" />
            <div>
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">{label}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
