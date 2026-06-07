import { useEffect, useState } from 'react'
import { adminService } from '../../api/admin.service'
import { getApiErrorMessage } from '../../utils/apiError'
import { StatCard } from '../layout/dashboard-ui'

export function AdminPlatformStats() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof adminService.getPlatformStats>> | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminService
      .getPlatformStats()
      .then(setStats)
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load platform revenue.')))
  }, [])

  if (error) {
    return (
      <p className="text-sm text-error bg-error-container/20 border border-error/20 rounded-xl px-stack-lg py-stack-md">
        {error}
      </p>
    )
  }

  if (!stats) {
    return (
      <div className="grid sm:grid-cols-3 gap-stack-md animate-pulse">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 bg-surface-container-low rounded-xl border border-outline-variant/40" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-3 gap-stack-md">
      <StatCard
        icon="savings"
        label="Platform earned"
        value={`${stats.platformEarnedCoins.toLocaleString()} coins`}
        hint={`${stats.feePercent}% service fee on advisor withdrawals`}
        accent="secondary"
      />
      <StatCard
        icon="payments"
        label="Advisor payouts"
        value={`${stats.grossWithdrawnCoins.toLocaleString()} coins`}
        hint="Gross withdrawn by advisors (before platform fee)"
        accent="primary"
      />
      <StatCard
        icon="receipt_long"
        label="Withdrawals"
        value={stats.withdrawalCount.toLocaleString()}
        hint="Completed demo payout transactions"
        accent="tertiary"
      />
    </div>
  )
}
