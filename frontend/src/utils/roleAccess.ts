import type { UserRole } from '@shared/contracts/auth.api'

export type NavItem =
  | 'discover'
  | 'wallet'
  | 'advisor'
  | 'partner'
  | 'admin-partners'
  | 'admin-advisors'
  | 'guide'
  | 'settings'

export interface NavLinkDef {
  id: NavItem
  label: string
  icon: string
  to: string
}

const SETTINGS: NavLinkDef = { id: 'settings', label: 'Settings', icon: 'settings', to: '/settings' }

export function getRoleHome(role: UserRole | undefined): string {
  if (!role) return '/discover'
  switch (role) {
    case 'admin':
      return '/workflow'
    case 'partner_doctor':
      return '/partner'
    case 'advisor':
      return '/advisor'
    case 'client':
    default:
      return '/discover'
  }
}

/** Sidebar / bottom nav — only links the role may use */
export function getNavLinksForRole(role: UserRole | undefined): NavLinkDef[] {
  if (!role) {
    return [{ id: 'discover', label: 'Discover', icon: 'explore', to: '/discover' }]
  }

  switch (role) {
    case 'client':
      return [
        { id: 'discover', label: 'Discover', icon: 'explore', to: '/discover' },
        { id: 'wallet', label: 'Wallet', icon: 'account_balance_wallet', to: '/wallet' },
        SETTINGS,
      ]
    case 'advisor':
      return [
        { id: 'advisor', label: 'Advisor Hub', icon: 'medical_services', to: '/advisor' },
        SETTINGS,
      ]
    case 'partner_doctor':
      return [
        { id: 'partner', label: 'Partner Portal', icon: 'verified_user', to: '/partner' },
        SETTINGS,
      ]
    case 'admin':
      return [
        { id: 'guide', label: 'Demo Guide', icon: 'menu_book', to: '/workflow' },
        { id: 'admin-partners', label: 'Partners', icon: 'verified_user', to: '/admin/partners' },
        { id: 'admin-advisors', label: 'Advisors', icon: 'medical_services', to: '/admin/advisors' },
        SETTINGS,
      ]
    default:
      return [{ id: 'discover', label: 'Discover', icon: 'explore', to: '/discover' }]
  }
}

/** Route → roles allowed (undefined = any authenticated user) */
const ROUTE_ACCESS: Record<string, UserRole[] | 'public' | 'guest'> = {
  '/auth': 'public',
  '/auth/advisor-apply': 'public',
  '/workflow': 'public',
  '/discovery': 'guest',
  '/discover': 'guest',
  '/discover/ai': 'guest',
  '/advisors': 'guest',
  '/wallet': ['client'],
  '/waiting': ['client'],
  '/advisor': ['advisor'],
  '/partner': ['partner_doctor'],
  '/partner/applicants': ['partner_doctor'],
  '/admin': ['admin'],
  '/admin/partners': ['admin'],
  '/admin/advisors': ['admin'],
  '/settings': ['client', 'advisor', 'partner_doctor', 'admin'],
  '/consultation': ['client', 'advisor'],
  '/verification': ['advisor', 'partner_doctor'],
  '/incoming-call': ['advisor'],
  '/incoming-verification': ['advisor'],
}

function matchRoutePrefix(pathname: string): string | undefined {
  const paths = Object.keys(ROUTE_ACCESS).sort((a, b) => b.length - a.length)
  return paths.find((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function canAccessPath(pathname: string, role: UserRole | undefined): boolean {
  const key = matchRoutePrefix(pathname)
  if (!key) return Boolean(role)

  const access = ROUTE_ACCESS[key]
  if (access === 'public') return true
  if (access === 'guest') return !role || role === 'client'
  if (!role) return false
  return access.includes(role)
}

export function formatRoleLabel(role: UserRole): string {
  return role.replace(/_/g, ' ')
}
