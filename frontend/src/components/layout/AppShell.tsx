import { Link, useLocation } from 'react-router-dom'
import { Logo } from '../Logo'

type NavItem = 'discover' | 'wallet' | 'logs' | 'settings' | 'advisor'

interface AppShellProps {
  children: React.ReactNode
  activeNav?: NavItem
  showSearch?: boolean
  searchPlaceholder?: string
  searchClassName?: string
}

const navItems: { id: NavItem; label: string; icon: string; to: string }[] = [
  { id: 'discover', label: 'Discover', icon: 'explore', to: '/discover' },
  { id: 'wallet', label: 'Wallet', icon: 'account_balance_wallet', to: '/wallet' },
  { id: 'logs', label: 'Logs', icon: 'history', to: '/advisor' },
  { id: 'settings', label: 'Settings', icon: 'settings', to: '/discover' },
]

export function AppShell({
  children,
  activeNav = 'discover',
  showSearch = true,
  searchPlaceholder = 'Describe what you are feeling inside...',
  searchClassName = '',
}: AppShellProps) {
  const location = useLocation()

  return (
    <div className="text-on-background font-body-md antialiased md:pl-64 pt-16 md:pt-0 pb-20 md:pb-0 min-h-screen bg-background">
      <header className="bg-surface-container-lowest border-b border-outline-variant fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 md:ml-64 md:w-[calc(100%-16rem)]">
        <div className="flex items-center gap-4 w-full max-w-2xl mx-auto md:mx-0">
          <Link to="/discover" className="flex items-center gap-2 font-headline-md text-headline-md font-bold text-primary md:hidden">
            <Logo className="w-8 h-8" />
            Green Heart
          </Link>
          {showSearch && (
            <div className="grow relative hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                className={`w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-10 pr-4 text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm ${searchClassName}`}
                placeholder={searchPlaceholder}
                type="text"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/wallet"
            className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors flex items-center justify-center relative group"
          >
            <span className="material-symbols-outlined">monetization_on</span>
            <span className="absolute top-full right-0 mt-2 bg-inverse-surface text-inverse-on-surface font-label-md text-label-md px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Wallet Balance
            </span>
          </Link>
          <Link
            to="/auth"
            className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </Link>
        </div>
      </header>

      <nav className="bg-surface border-r border-outline-variant fixed left-0 top-0 h-full w-64 hidden md:flex flex-col py-stack-lg px-stack-md gap-stack-md z-40">
        <div className="flex items-center gap-3 px-4 mb-8">
          <Logo className="w-10 h-10" />
          <div>
            <Link to="/discover" className="font-headline-md text-headline-md font-extrabold text-primary leading-tight block">
              Green Heart
            </Link>
            <p className="font-label-md text-label-md text-on-surface-variant">Holistic Health</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const active = activeNav === item.id
            return (
              <Link
                key={item.id}
                to={item.to}
                className={`flex items-center gap-stack-sm rounded-lg px-4 py-3 font-label-md text-label-md transition-colors ${
                  active
                    ? 'bg-secondary-container text-on-secondary-container scale-[0.98]'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className={`material-symbols-outlined ${active ? 'filled' : ''}`}>{item.icon}</span>
                {item.label === 'wallet' ? 'WALLET' : item.label}
              </Link>
            )
          })}
          <Link
            to="/advisor"
            className={`flex items-center gap-stack-sm rounded-lg px-4 py-3 font-label-md text-label-md transition-colors ${
              location.pathname === '/advisor'
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined">medical_services</span>
            Advisor Hub
          </Link>
        </div>
      </nav>

      <nav className="bg-surface-container-lowest border-t border-outline-variant shadow-lg fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 md:hidden">
        {navItems.map((item) => {
          const active = activeNav === item.id
          return (
            <Link
              key={item.id}
              to={item.to}
              className={`flex flex-col items-center justify-center rounded-xl p-2 w-16 transition-transform ${
                active
                  ? 'bg-primary-container text-on-primary-container scale-95'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined ${active ? 'filled' : ''}`}>{item.icon}</span>
              <span className="font-label-md text-label-md text-[10px] mt-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {children}
    </div>
  )
}
