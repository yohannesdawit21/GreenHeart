import type { ReactNode } from 'react'

interface StickyActionBarProps {
  children: ReactNode
  className?: string
}

/** Fixed bottom bar that clears AppShell mobile nav — use for primary page actions */
export function StickyActionBar({ children, className = '' }: StickyActionBarProps) {
  return (
    <div
      className={`md:hidden fixed inset-x-0 z-40 border-t border-outline-variant/50 bg-surface/95 backdrop-blur-md px-margin-mobile pt-stack-md pb-[calc(var(--app-bottom-nav-h,4.75rem)+max(0.75rem,env(safe-area-inset-bottom)))] ${className}`}
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-2">{children}</div>
    </div>
  )
}
