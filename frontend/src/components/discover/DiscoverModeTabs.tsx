import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { MaterialIcon } from '../MaterialIcon'

export function DiscoverModeTabs() {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const isAi = pathname.startsWith('/discover/ai')
  const query = searchParams.get('q')
  const aiHref = query ? `/discover/ai?q=${encodeURIComponent(query)}` : '/discover/ai'

  const tabClass = (active: boolean) =>
    `flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 min-h-[44px] text-sm font-label-md transition-all ${
      active
        ? 'bg-primary text-on-primary shadow-sm'
        : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
    }`

  return (
    <nav
      aria-label="Discovery mode"
      className="flex w-full sm:w-auto gap-1 p-1 bg-surface-container-low border border-outline-variant rounded-full"
    >
      <Link to="/discover" className={tabClass(!isAi)} aria-current={!isAi ? 'page' : undefined}>
        <MaterialIcon name="grid_view" className="text-[18px]" />
        Browse
      </Link>
      <Link to={aiHref} className={tabClass(isAi)} aria-current={isAi ? 'page' : undefined}>
        <MaterialIcon name="psychology" className="text-[18px]" />
        AI Match
      </Link>
    </nav>
  )
}
