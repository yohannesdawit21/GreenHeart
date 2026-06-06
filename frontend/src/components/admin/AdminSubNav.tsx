import { Link, useLocation } from 'react-router-dom'
import { MaterialIcon } from '../MaterialIcon'

const ADMIN_TABS = [
  { to: '/admin/partners', label: 'Partner doctors', icon: 'verified_user' },
  { to: '/admin/advisors', label: 'Advisor doctors', icon: 'medical_services' },
] as const

export function AdminSubNav() {
  const location = useLocation()

  return (
    <nav className="flex flex-wrap gap-2 border-b border-outline-variant/60 pb-stack-sm">
      {ADMIN_TABS.map((tab) => {
        const active = location.pathname.startsWith(tab.to)
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-label-md transition-colors ${
              active
                ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
            }`}
          >
            <MaterialIcon name={tab.icon} className="text-base" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
