import { useCallback, useEffect, useState } from 'react'
import { adminService } from '../../api/admin.service'
import { getApiErrorMessage } from '../../utils/apiError'
import { btnOutline } from '../layout/buttonStyles'
import { StatCard } from '../layout/dashboard-ui'
import { MaterialIcon } from '../MaterialIcon'

export function AdminPlatformStats() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof adminService.getPlatformStats>> | null>(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const loadStats = useCallback(async () => {
    setRefreshing(true)
    try {
      const data = await adminService.getPlatformStats()
      setStats(data)
      setError('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load platform revenue.'))
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadStats()
    const interval = setInterval(() => void loadStats(), 30000)
    return () => clearInterval(interval)
  }, [loadStats])

  if (error && !stats) {
    return (
      <div className="text-sm text-error bg-error-container/20 border border-error/20 rounded-xl px-stack-lg py-stack-md flex flex-wrap items-center justify-between gap-2">
        <span>{error}</span>
        <button type="button" onClick={() => void loadStats()} className={`${btnOutline} text-xs px-3 py-1.5`}>
          Retry
        </button>
      </div>
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
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-on-surface-variant">Marketplace revenue from advisor withdrawal fees</p>
        <button
          type="button"
          onClick={() => void loadStats()}
          disabled={refreshing}
          className={`${btnOutline} text-xs px-3 py-1.5 inline-flex items-center gap-1`}
        >
          <MaterialIcon name="refresh" className={`text-sm ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
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
    </div>
  )
}
