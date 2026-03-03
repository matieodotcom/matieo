import { Link } from 'react-router-dom'
import { Plus, Heart, BarChart2, Briefcase } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const QUICK_ACTIONS = [
  {
    label: 'Create Memorial',
    description: 'Honour a loved one',
    icon: Plus,
    to: '/app/memorials/create',
  },
  {
    label: 'Browse Memorials',
    description: 'View all memorials',
    icon: Heart,
    to: '/memorials',
  },
  {
    label: 'Insights',
    description: 'Mortality analytics',
    icon: BarChart2,
    to: '/app/dashboard/insights',
  },
  {
    label: 'Services',
    description: 'Funeral & support services',
    icon: Briefcase,
    to: '/app/dashboard/services',
  },
] as const

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const fullName = user?.user_metadata?.full_name as string | undefined
  const firstName = fullName?.split(' ')[0] ?? 'there'

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Welcome back, {firstName}!</h1>
        <p className="text-sm text-neutral-500 mt-1">Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
        {QUICK_ACTIONS.map(({ label, description, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="bg-white rounded-xl border border-neutral-100 p-6 hover:shadow-sm transition-shadow flex flex-col gap-3"
          >
            <Icon size={24} className="text-brand-primary" aria-hidden="true" />
            <div>
              <p className="font-semibold text-neutral-900">{label}</p>
              <p className="text-sm text-neutral-500">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
