interface LogoProps {
  className?: string
  title?: string
}

interface BrandLockupProps {
  className?: string
  collapsed?: boolean
  subtitle?: string
}

/**
 * Green Heart brand mark — leaf-heart teardrop in platform teal-green.
 */
export function Logo({ className = 'w-10 h-10', title = 'Green Heart' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="gh-body" x1="24" y1="3" x2="24" y2="47" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d5c60" />
          <stop offset="1" stopColor="#004346" />
        </linearGradient>
        <linearGradient id="gh-shine" x1="14" y1="8" x2="34" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#90d2d6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0d5c60" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M24 3C33 14 41 22 41 31C41 40.4 33.4 47 24 47C14.6 47 7 40.4 7 31C7 22 15 14 24 3Z"
        fill="url(#gh-body)"
      />
      <path
        d="M24 14C30 22 34 27 34 33C34 39.6 29.5 44 24 44C24 34 24 24 24 14Z"
        fill="url(#gh-shine)"
      />
      <path
        d="M24 8C24 8 18.5 14 18.5 19.5C18.5 22.5 20.5 24.5 24 24.5C27.5 24.5 29.5 22.5 29.5 19.5C29.5 14 24 8 24 8Z"
        fill="#90d2d6"
        fillOpacity="0.35"
      />
      <path
        d="M24 12C24 22 24 34 24 44"
        stroke="#F5FAFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
      <path
        d="M24 24C24 24 20 23 16.5 20"
        stroke="#F5FAFF"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
      <path
        d="M24 31C24 31 28.5 30 32 26.5"
        stroke="#F5FAFF"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
    </svg>
  )
}

/** Logo + wordmark for sidebar and headers */
export function BrandLockup({ className = '', collapsed = false, subtitle = 'Holistic Health' }: BrandLockupProps) {
  return (
    <div className={`flex items-center min-w-0 ${collapsed ? 'justify-center' : 'gap-3'} ${className}`}>
      <div
        className={`shrink-0 rounded-xl bg-linear-to-br from-primary-container/30 to-secondary-container/20 border border-primary/15 shadow-sm flex items-center justify-center ${
          collapsed ? 'w-10 h-10 p-1.5' : 'w-11 h-11 p-1.5'
        }`}
      >
        <Logo className="w-full h-full" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <span className="font-headline-md text-headline-md font-extrabold text-primary leading-tight block truncate">
            Green Heart
          </span>
          {subtitle ? (
            <p className="font-label-md text-label-md text-on-surface-variant truncate">{subtitle}</p>
          ) : null}
        </div>
      )}
    </div>
  )
}
