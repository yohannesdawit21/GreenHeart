interface LogoProps {
  className?: string
  title?: string
}

/**
 * Green Heart brand mark — a leaf/flame teardrop (green + heart) drawn in the
 * platform's teal-green palette. Size it via `className` (e.g. "w-10 h-10").
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
        <linearGradient id="greenHeartBody" x1="24" y1="3" x2="24" y2="47" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d5c60" />
          <stop offset="1" stopColor="#004346" />
        </linearGradient>
      </defs>
      {/* Leaf/flame body — pointed top reads as heart, rounded base as leaf */}
      <path
        d="M24 3C33 14 41 22 41 31C41 40.4 33.4 47 24 47C14.6 47 7 40.4 7 31C7 22 15 14 24 3Z"
        fill="url(#greenHeartBody)"
      />
      {/* Inner glow — splits the mark into two leaf halves */}
      <path
        d="M24 14C30 22 34 27 34 33C34 39.6 29.5 44 24 44C24 34 24 24 24 14Z"
        fill="#90d2d6"
        fillOpacity="0.45"
      />
      {/* Central vein */}
      <path
        d="M24 12C24 22 24 34 24 44"
        stroke="#F5FAFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
      {/* Side veins */}
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
