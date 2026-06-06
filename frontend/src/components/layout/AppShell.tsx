import { useEffect, useState, type CSSProperties } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BrandLockup } from '../Logo'
import { UserMenu } from '../UserMenu'
import { MaterialIcon } from '../MaterialIcon'
import { btnIcon } from './buttonStyles'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { getNavLinksForRole, getRoleHome, type NavItem } from '../../utils/roleAccess'

const SIDEBAR_STORAGE_KEY = 'greenheart-sidebar-collapsed'
const SIDEBAR_EXPANDED = '16rem'
const SIDEBAR_COLLAPSED = '4.5rem'

const sidebarToggleClass = `${btnIcon} h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest shadow-[0_2px_10px_rgba(13,92,96,0.14)] hover:border-primary/40 hover:text-primary hover:shadow-[0_4px_14px_rgba(13,92,96,0.2)] transition-[box-shadow,border-color,color,transform] duration-200 ease-in-out`

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  })

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed))
  }, [sidebarCollapsed])

  const role = user?.role
  const isClient = role === 'client'
  const navLinks = getNavLinksForRole(role)
  const showLiveIndicator = role === 'advisor' || role === 'partner_doctor'
  const showSearchBar = showSearch && (isClient || !user)

  const shellStyle = {
    '--app-header-h': '4rem',
    '--app-bottom-nav-h': '4.75rem',
    '--app-sidebar-w': sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
  } as CSSProperties

  const navLinkClass = (active: boolean, mobile = false, collapsed = false) => {
    if (mobile) {
      return `flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[4.25rem] shrink-0 transition-transform ${
        active ? 'bg-primary-container text-on-primary-container scale-95 shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
      }`
    }
    if (collapsed) {
      return `flex items-center justify-center rounded-lg p-3 font-label-md text-label-md transition-colors ${
        active
          ? 'bg-secondary-container text-on-secondary-container hover:shadow-sm'
          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
      }`
    }
    return `flex items-center gap-stack-sm rounded-lg px-4 py-3 font-label-md text-label-md transition-colors ${
      active
        ? 'bg-secondary-container text-on-secondary-container hover:shadow-sm'
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
    }`
  }

  const renderNavLink = (item: (typeof navLinks)[0], mobile = false, collapsed = false) => {
    const active = activeNav === item.id || location.pathname === item.to
    const mobileLabel = item.label.includes(' ') ? item.label.split(' ')[0] : item.label
    return (
      <Link
        key={item.id}
        to={item.to}
        title={collapsed && !mobile ? item.label : undefined}
        aria-label={collapsed && !mobile ? item.label : undefined}
        className={navLinkClass(active, mobile, collapsed)}
      >
        <MaterialIcon name={item.icon} className={active ? 'filled' : ''} />
        {mobile ? (
          <span className="font-label-md text-[10px] mt-1 leading-tight max-w-[4rem] truncate">{mobileLabel}</span>
        ) : (
          !collapsed && <span className="truncate">{item.label}</span>
        )}
      </Link>
    )
  }

  return (
    <div
      className="text-on-background font-body-md antialiased min-h-screen bg-background overflow-x-hidden transition-[padding] duration-300 ease-in-out md:pl-[var(--app-sidebar-w)]"
      style={shellStyle}
    >
      <header className="bg-surface-container-lowest border-b border-outline-variant fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-margin-desktop h-16 md:left-[var(--app-sidebar-w)] md:w-[calc(100%-var(--app-sidebar-w))] transition-[left,width] duration-300 ease-in-out">
        <div className="flex items-center gap-3 w-full max-w-2xl mx-auto md:mx-0 min-w-0">
          <Link
            to={getRoleHome(role)}
            className="flex items-center md:hidden shrink-0 min-w-0"
          >
            <BrandLockup subtitle="" className="gap-2 [&_span]:text-base" />
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

      <div
        className="hidden md:block fixed left-0 top-0 h-full z-40 transition-[width] duration-300 ease-in-out pointer-events-none"
        style={{ width: 'var(--app-sidebar-w)' }}
      >
        <nav
          aria-label="Sidebar"
          aria-expanded={!sidebarCollapsed}
          className={`bg-surface border-r border-outline-variant h-full flex flex-col py-stack-lg pointer-events-auto overflow-hidden ${
            sidebarCollapsed ? 'w-[4.5rem] px-2' : 'w-64 px-stack-md'
          }`}
        >
          <div className={`shrink-0 mb-5 ${sidebarCollapsed ? 'px-1' : 'px-2'}`}>
            <Link to={getRoleHome(role)} title="Green Heart home" className="block max-w-full">
              <BrandLockup collapsed={sidebarCollapsed} />
            </Link>
          </div>

          <div className="flex flex-col gap-2 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide min-h-0">
            {navLinks.map((item) => renderNavLink(item, false, sidebarCollapsed))}
          </div>

          <div className={`shrink-0 pt-4 border-t border-outline-variant ${sidebarCollapsed ? 'px-1' : 'px-2'}`}>
            {user && (
              <div
                className={`text-sm text-on-surface-variant ${sidebarCollapsed ? 'flex justify-center py-1' : 'px-2 pb-1'}`}
                title={sidebarCollapsed ? user.email : undefined}
              >
                {sidebarCollapsed ? (
                  <span className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container font-label-md flex items-center justify-center text-sm">
                    {user.profile?.username?.[0]?.toUpperCase() ?? '?'}
                  </span>
                ) : (
                  <>
                    <p className="font-label-md truncate">{user.email}</p>
                    <p className="text-xs capitalize opacity-70">{user.role.replace('_', ' ')}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>

        <button
          type="button"
          onClick={() => setSidebarCollapsed((v) => !v)}
          className={`${sidebarToggleClass} pointer-events-auto absolute top-[1.75rem] right-0 translate-x-1/2 flex z-50`}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!sidebarCollapsed}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <MaterialIcon name={sidebarCollapsed ? 'chevron_right' : 'chevron_left'} className="text-[16px]" />
        </button>
      </div>

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
