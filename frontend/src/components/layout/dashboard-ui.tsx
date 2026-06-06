import type { ReactNode } from 'react'
import { MaterialIcon } from '../MaterialIcon'
import type { VerificationStatus } from '@shared/contracts/verification.api'

/** Standard <main> classes inside AppShell */
export const appShellMainClass =
  'max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop pt-stack-lg pb-stack-md md:pb-stack-lg'

interface DashboardHeaderProps {
  title: string
  description?: string
  badge?: ReactNode
  action?: ReactNode
}

export function DashboardHeader({ title, description, badge, action }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-stretch lg:items-start gap-stack-md">
      <div className="min-w-0 flex-1">
        {badge && <div className="mb-stack-sm">{badge}</div>}
        <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-background">{title}</h1>
        {description && (
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-stack-sm max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 w-full lg:w-auto">{action}</div>}
    </header>
  )
}

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

const alertStyles: Record<AlertVariant, string> = {
  info: 'bg-primary-container/15 border-primary/30 text-on-background',
  success: 'bg-secondary-container/25 border-secondary/40 text-on-secondary-container',
  warning: 'bg-primary-container/20 border-primary/30 text-on-background',
  error: 'bg-error-container/25 border-error/40 text-on-error-container',
}

interface DashboardAlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  icon?: string
}

export function DashboardAlert({ variant = 'info', title, children, icon }: DashboardAlertProps) {
  return (
    <div className={`flex gap-stack-sm p-stack-md rounded-xl border ${alertStyles[variant]}`}>
      {icon && <MaterialIcon name={icon} filled className="shrink-0 mt-0.5" />}
      <div className="min-w-0">
        {title && <p className="font-label-md text-label-md font-bold uppercase tracking-wide mb-1">{title}</p>}
        <div className="font-body-md text-body-md opacity-90">{children}</div>
      </div>
    </div>
  )
}

interface DashboardSectionProps {
  title: string
  badge?: ReactNode
  children: ReactNode
  className?: string
}

export function DashboardSection({ title, badge, children, className = '' }: DashboardSectionProps) {
  return (
    <section
      className={`bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm ${className}`}
    >
      <div className="px-margin-mobile md:px-stack-lg py-stack-md border-b border-outline-variant bg-surface-bright flex flex-wrap justify-between items-center gap-stack-sm">
        <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
        {badge}
      </div>
      {children}
    </section>
  )
}

interface StatCardProps {
  icon: string
  label: string
  value: ReactNode
  hint?: string
  accent?: 'primary' | 'secondary' | 'tertiary'
}

const accentIconBg: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary-container/15 border-primary/20 text-primary',
  secondary: 'bg-secondary-container/25 border-secondary/30 text-secondary',
  tertiary: 'bg-tertiary-container/15 border-tertiary/20 text-tertiary',
}

export function StatCard({ icon, label, value, hint, accent = 'primary' }: StatCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-ambient flex flex-col gap-stack-md">
      <div className="flex justify-between items-start gap-stack-sm">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center border ${accentIconBg[accent]}`}
        >
          <MaterialIcon name={icon} filled />
        </div>
        <span className="bg-surface-container text-on-surface-variant font-label-md text-[11px] uppercase tracking-wider px-3 py-1 rounded-full">
          {label}
        </span>
      </div>
      <div>
        <div className="font-stat-xl text-stat-xl text-on-surface">{value}</div>
        {hint && <p className="font-body-md text-body-md text-on-surface-variant mt-unit">{hint}</p>}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
}

export function EmptyState({ icon = 'inbox', title, description }: EmptyStateProps) {
  return (
    <div className="py-16 px-stack-lg text-center">
      <MaterialIcon name={icon} className="text-4xl text-outline mb-stack-sm mx-auto block" />
      <p className="font-headline-md text-on-surface-variant">{title}</p>
      {description && <p className="font-body-md text-body-md text-on-surface-variant/80 mt-stack-sm">{description}</p>}
    </div>
  )
}

const statusStyles: Record<VerificationStatus, string> = {
  pending_review: 'bg-primary-container/20 text-on-primary-container',
  verified: 'bg-secondary-container/30 text-secondary',
  rejected: 'bg-error-container/30 text-error',
  suspended: 'bg-surface-container text-on-surface-variant',
}

const statusLabels: Record<VerificationStatus, string> = {
  pending_review: 'Pending review',
  verified: 'Verified',
  rejected: 'Rejected',
  suspended: 'Suspended',
}

export function VerificationStatusPill({ status }: { status: VerificationStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-md text-[11px] uppercase tracking-wider ${statusStyles[status]}`}
    >
      {status === 'verified' && <MaterialIcon name="verified" className="text-[14px]" filled />}
      {statusLabels[status]}
    </span>
  )
}

export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-stack-md">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      <p className="font-body-md text-on-surface-variant">{label}</p>
    </div>
  )
}
