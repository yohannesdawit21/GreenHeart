import { Link, useLocation } from 'react-router-dom'
import { Logo } from '../Logo'
import { UserMenu } from '../UserMenu'
import { MaterialIcon } from '../MaterialIcon'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { getNavLinksForRole, getRoleHome, type NavItem } from '../../utils/roleAccess'

interface AppShellProps {
  children: React.ReactNode
  activeNav?: NavItem
  showSearch?: boolean
  searchPlaceholder?: string
  searchClassName?: string
  onSearch?: (query: string) => void
}

export function AppShell({
  children,
  activeNav = 'discover',
  showSearch = true,
  searchPlaceholder = 'Describe what you are feeling inside...',
  searchClassName = '',
  onSearch,
}: AppShellProps) {
  const location = useLocation()
  const { user } = useAuth()
  const { connected } = useSocket()

  const role = user?.role
  const isClient = role === 'client'
  const navLinks = getNavLinksForRole(role)
  const showLiveIndicator = role === 'advisor' || role === 'partner_doctor'
  const showSearchBar = showSearch && (isClient || !user)

  const navLinkClass = (active: boolean, mobile = false) => {
    if (mobile) {
      return `flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[4.25rem] shrink-0 transition-transform ${
        active ? 'bg-primary-container text-on-primary-container scale-95 shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
      }`
    }
    return `flex items-center gap-stack-sm rounded-lg px-4 py-3 font-label-md text-label-md transition-colors ${
      active
        ? 'bg-secondary-container text-on-secondary-container hover:shadow-sm'
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
    }`
  }

  const renderNavLink = (item: (typeof navLinks)[0], mobile = false) => {
    const active = activeNav === item.id || location.pathname === item.to
    const mobileLabel = item.label.includes(' ') ? item.label.split(' ')[0] : item.label
    return (
      <Link key={item.id} to={item.to} className={navLinkClass(active, mobile)}>
        <MaterialIcon name={item.icon} className={active ? 'filled' : ''} />
        {mobile ? (
          <span className="font-label-md text-[10px] mt-1 leading-tight max-w-[4rem] truncate">{mobileLabel}</span>
        ) : (
          item.label
        )}
      </Link>
    )
  }

  return (
    <div
      className="text-on-background font-body-md antialiased min-h-screen bg-background md:pl-64 overflow-x-hidden"
      style={
        {
          '--app-header-h': '4rem',
          '--app-bottom-nav-h': '4.75rem',
        } as React.CSSProperties
      }
    >
      <header className="bg-surface-container-lowest border-b border-outline-variant fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-margin-desktop h-16 md:left-64 md:w-[calc(100%-16rem)]">
        <div className="flex items-center gap-3 w-full max-w-2xl mx-auto md:mx-0 min-w-0">
          <Link
            to={getRoleHome(role)}
            className="flex items-center gap-2 font-headline-md text-headline-md font-bold text-primary md:hidden shrink-0 min-w-0"
          >
            <Logo className="w-8 h-8 shrink-0" />
            <span className="truncate">Green Heart</span>
          </Link>
          {showSearchBar && (
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
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {showLiveIndicator && (
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-label-md px-2 py-1 rounded-full ${
                connected ? 'bg-secondary-container/30 text-secondary' : 'bg-error-container/30 text-error'
              }`}
              title={connected ? 'Realtime connected' : 'Connecting…'}
            >
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-secondary' : 'bg-error animate-pulse'}`} />
              <span className="hidden sm:inline">{connected ? 'Live' : 'Offline'}</span>
            </span>
          )}
          {isClient && (
            <Link
              to="/wallet"
              className="md:hidden text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors"
              title="Wallet"
            >
              <MaterialIcon name="account_balance_wallet" />
            </Link>
          )}
          {user ? (
            <UserMenu />
          ) : (
            <Link
              to="/auth"
              className="text-primary font-label-md text-xs sm:text-sm hover:underline px-2 py-1 whitespace-nowrap"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      <nav className="bg-surface border-r border-outline-variant fixed left-0 top-0 h-full w-64 hidden md:flex flex-col py-stack-lg px-stack-md z-40">
        <div className="flex items-center gap-3 px-4 mb-8 shrink-0">
          <Logo className="w-10 h-10 shrink-0" />
          <div className="min-w-0">
            <Link
              to={getRoleHome(role)}
              className="font-headline-md text-headline-md font-extrabold text-primary leading-tight block truncate"
            >
              Green Heart
            </Link>
            <p className="font-label-md text-label-md text-on-surface-variant">Holistic Health</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">{navLinks.map((item) => renderNavLink(item))}</div>
        {user && (
          <div className="px-4 pt-4 border-t border-outline-variant text-sm text-on-surface-variant shrink-0">
            <p className="font-label-md truncate">{user.email}</p>
            <p className="text-xs capitalize opacity-70">{user.role.replace('_', ' ')}</p>
          </div>
        )}
      </nav>

      <nav
        aria-label="Primary"
        className="bg-surface-container-lowest border-t border-outline-variant shadow-lg fixed bottom-0 left-0 right-0 z-50 md:hidden min-h-[var(--app-bottom-nav-h)] pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex overflow-x-auto scrollbar-hide justify-start sm:justify-around gap-1 px-2 max-w-full">
          {navLinks.map((item) => renderNavLink(item, true))}
        </div>
      </nav>

      <div className="app-shell-content min-h-screen w-full max-w-[100vw]">{children}</div>
    </div>
  )
}
