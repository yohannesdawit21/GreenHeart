import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../Logo'
import { MaterialIcon } from '../MaterialIcon'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'

type NavItem = 'discover' | 'wallet' | 'advisor' | 'partner' | 'admin'

interface AppShellProps {
  children: React.ReactNode
  activeNav?: NavItem
  showSearch?: boolean
  searchPlaceholder?: string
  searchClassName?: string
  onSearch?: (query: string) => void
}

function roleHome(role: string | undefined): string {
  if (role === 'admin') return '/admin'
  if (role === 'partner_doctor') return '/partner'
  if (role === 'advisor') return '/advisor'
  return '/discover'
}

/** Standard page padding — use on <main> inside AppShell (vertical inset handled by .app-shell-content) */
export const appShellMainClass =
  'max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop pt-stack-lg pb-stack-md md:pb-stack-lg'

export function AppShell({
  children,
  activeNav = 'discover',
  showSearch = true,
  searchPlaceholder = 'Describe what you are feeling inside...',
  searchClassName = '',
  onSearch,
}: AppShellProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { connected } = useSocket()

  const isClient = user?.role === 'client'
  const isAdvisor = user?.role === 'advisor'
  const isPartner = user?.role === 'partner_doctor'
  const isAdmin = user?.role === 'admin'

  const clientNav = [
    { id: 'discover' as const, label: 'Discover', icon: 'explore', to: '/discover' },
    { id: 'wallet' as const, label: 'Wallet', icon: 'account_balance_wallet', to: '/wallet' },
  ]

  const roleNav = [
    ...(isAdvisor || isAdmin ? [{ id: 'advisor' as const, label: 'Advisor Hub', icon: 'medical_services', to: '/advisor' }] : []),
    ...(isPartner || isAdmin ? [{ id: 'partner' as const, label: 'Partner Portal', icon: 'verified_user', to: '/partner' }] : []),
    ...(isAdmin ? [{ id: 'admin' as const, label: 'Admin', icon: 'admin_panel_settings', to: '/admin' }] : []),
  ]

  const sidebarNav = isClient ? clientNav : roleNav.length > 0 ? roleNav : clientNav

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const navLinkClass = (active: boolean) =>
    `flex items-center gap-stack-sm rounded-lg px-4 py-3 font-label-md text-label-md transition-colors ${
      active
        ? 'bg-secondary-container text-on-secondary-container'
        : 'text-on-surface-variant hover:bg-surface-container-high'
    }`

  return (
    <div
      className="text-on-background font-body-md antialiased min-h-screen bg-background md:pl-64"
      style={
        {
          '--app-header-h': '4rem',
          '--app-bottom-nav-h': '4.75rem',
        } as React.CSSProperties
      }
    >
      <header className="bg-surface-container-lowest border-b border-outline-variant fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-margin-desktop h-16 md:left-64 md:w-[calc(100%-16rem)]">
        <div className="flex items-center gap-4 w-full max-w-2xl mx-auto md:mx-0 min-w-0">
          <Link
            to={roleHome(user?.role)}
            className="flex items-center gap-2 font-headline-md text-headline-md font-bold text-primary md:hidden shrink-0"
          >
            <Logo className="w-8 h-8" />
            Green Heart
          </Link>
          {showSearch && isClient && (
            <div className="grow relative hidden md:block min-w-0">
              <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
              <input
                className={`w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-10 pr-4 text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm ${searchClassName}`}
                placeholder={searchPlaceholder}
                type="text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onSearch) {
                    onSearch((e.target as HTMLInputElement).value)
                  }
                }}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {(isAdvisor || isPartner) && (
            <span
              className={`hidden sm:flex items-center gap-1 text-xs font-label-md px-2 py-1 rounded-full ${
                connected ? 'bg-secondary-container/30 text-secondary' : 'bg-error-container/30 text-error'
              }`}
              title={connected ? 'Realtime connected' : 'Connecting…'}
            >
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-secondary' : 'bg-error animate-pulse'}`} />
              {connected ? 'Live' : 'Offline'}
            </span>
          )}
          {isClient && (
            <Link
              to="/wallet"
              className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors"
              title="Wallet"
            >
              <MaterialIcon name="monetization_on" />
            </Link>
          )}
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="text-on-surface-variant hover:bg-surface-container px-3 py-2 rounded-full transition-colors flex items-center gap-1 text-sm"
              title="Sign out"
            >
              <MaterialIcon name="logout" className="text-[20px]" />
              <span className="hidden md:inline">Sign out</span>
            </button>
          ) : (
            <Link to="/auth" className="text-primary font-label-md text-sm hover:underline px-2">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <nav className="bg-surface border-r border-outline-variant fixed left-0 top-0 h-full w-64 hidden md:flex flex-col py-stack-lg px-stack-md z-40">
        <div className="flex items-center gap-3 px-4 mb-8">
          <Logo className="w-10 h-10 shrink-0" />
          <div className="min-w-0">
            <Link to={roleHome(user?.role)} className="font-headline-md text-headline-md font-extrabold text-primary leading-tight block truncate">
              Green Heart
            </Link>
            <p className="font-label-md text-label-md text-on-surface-variant">Holistic Health</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {sidebarNav.map((item) => (
            <Link key={item.id} to={item.to} className={navLinkClass(activeNav === item.id || location.pathname === item.to)}>
              <MaterialIcon name={item.icon} className={activeNav === item.id ? 'filled' : ''} />
              {item.label}
            </Link>
          ))}
        </div>
        {user && (
          <div className="px-4 pt-4 border-t border-outline-variant text-sm text-on-surface-variant shrink-0">
            <p className="font-label-md truncate">{user.email}</p>
            <p className="text-xs capitalize opacity-70">{user.role.replace('_', ' ')}</p>
          </div>
        )}
      </nav>

      <nav
        aria-label="Primary"
        className="bg-surface-container-lowest border-t border-outline-variant shadow-lg fixed bottom-0 left-0 right-0 z-50 flex justify-around items-stretch min-h-[var(--app-bottom-nav-h)] px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
      >
        {sidebarNav.map((item) => {
          const active = activeNav === item.id || location.pathname === item.to
          return (
            <Link
              key={item.id}
              to={item.to}
              className={`flex flex-col items-center justify-center rounded-xl p-2 min-w-[4rem] transition-transform ${
                active ? 'bg-primary-container text-on-primary-container scale-95' : 'text-on-surface-variant'
              }`}
            >
              <MaterialIcon name={item.icon} className={active ? 'filled' : ''} />
              <span className="font-label-md text-[10px] mt-1 leading-tight">{item.label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </nav>

      <div className="app-shell-content min-h-screen">{children}</div>
    </div>
  )
}
