import { Link } from 'react-router-dom'
import { MaterialIcon } from './MaterialIcon'

interface WalletBalanceChipProps {
  balance: number | null
  escrow?: number
  loading?: boolean
  compact?: boolean
  to?: string
}

export function WalletBalanceChip({ balance, escrow = 0, loading = false, compact = false, to = '/wallet' }: WalletBalanceChipProps) {
  const label = loading ? '…' : `${balance ?? 0} coins`

  if (compact) {
    return (
      <Link
        to={to}
        className="inline-flex items-center gap-1 text-xs font-label-md text-on-surface-variant hover:text-primary transition-colors"
        title={escrow > 0 ? `${escrow} coins in escrow` : 'Open wallet'}
      >
        <MaterialIcon name="monetization_on" className="text-sm text-primary" />
        {label}
      </Link>
    )
  }

  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1.5 text-sm font-label-md text-on-surface hover:border-primary/40 hover:text-primary transition-colors"
      title={escrow > 0 ? `${escrow} coins held in escrow for active sessions` : 'Open wallet'}
    >
      <MaterialIcon name="account_balance_wallet" className="text-primary text-base" />
      <span>{label}</span>
      {!loading && escrow > 0 && (
        <span className="text-xs text-on-surface-variant">({escrow} escrow)</span>
      )}
    </Link>
  )
}
