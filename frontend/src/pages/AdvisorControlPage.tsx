import { useState, useEffect } from 'react'
import { AppShell } from '../components/layout/AppShell'
import {
  appShellMainClass,
  DashboardHeader,
  DashboardAlert,
  DashboardSection,
  StatCard,
  LoadingSpinner,
  EmptyState,
} from '../components/layout/dashboard-ui'
import { MaterialIcon } from '../components/MaterialIcon'
import { sessionService } from '../api/session.service'
import { walletService } from '../api/wallet.service'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import type { WalletBalance, TransactionDto } from '@shared/contracts/wallet.api'

export function AdvisorControlPage() {
  const { user } = useAuth()
  const { connected } = useSocket()
  const [online, setOnline] = useState(false)
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [transactions, setTransactions] = useState<TransactionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [presenceError, setPresenceError] = useState('')

  const verificationStatus = user?.profile?.verificationStatus

  useEffect(() => {
    Promise.all([walletService.getBalance(), walletService.getTransactions()])
      .then(([bal, tx]) => {
        setBalance(bal.wallet)
        setTransactions(tx.transactions)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handlePresenceToggle = async () => {
    if (verificationStatus !== 'verified') return
    setPresenceError('')
    const newStatus = !online
    try {
      await sessionService.updatePresence({ online: newStatus })
      setOnline(newStatus)
    } catch (err: any) {
      const code = err.response?.data?.error?.code as string | undefined
      const message = err.response?.data?.error?.message as string | undefined
      if (code === 'ADVISOR_NOT_VERIFIED') {
        setPresenceError('You must be verified before going online.')
      } else if (code === 'SOCKET_NOT_CONNECTED' || !connected) {
        setPresenceError('Wait for the Live indicator in the header, then try again.')
      } else {
        setPresenceError(message || 'Could not update online status.')
      }
    }
  }

  const handleDownloadCsv = () => {
    if (transactions.length === 0) return
    const header = 'Date,Type,Amount (Coins)\n'
    const rows = transactions.map((tx) => `${new Date(tx.timestamp).toISOString()},${tx.type},${tx.amountCoins}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'greenheart-activity.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppShell activeNav="advisor" showSearch={false}>
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        <DashboardHeader
          title="Advisor Hub"
          description="Manage your availability, earnings, and incoming patient sessions."
        />

        {verificationStatus === 'pending_review' && (
          <DashboardAlert variant="warning" icon="hourglass_top" title="Application under review">
            A partner doctor will review your credentials. You cannot go online until verified.
          </DashboardAlert>
        )}

        {verificationStatus === 'rejected' && (
          <DashboardAlert variant="error" icon="cancel" title="Application rejected">
            Contact support if you believe this was an error.
          </DashboardAlert>
        )}

        {verificationStatus === 'verified' && (
          <DashboardAlert variant="success" icon="verified" title="Verified advisor">
            You are approved to receive patients. Toggle online when you are ready for calls.
          </DashboardAlert>
        )}

        {presenceError && (
          <DashboardAlert variant="error" icon="error">
            {presenceError}
          </DashboardAlert>
        )}

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-stack-md shadow-sm">
          <div>
            <p className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant">Live dispatch</p>
            <p className="text-sm text-on-surface-variant mt-1">
              {connected
                ? online
                  ? 'You are visible to patients on Discover'
                  : 'Go online to appear as available'
                : 'Connecting to realtime server…'}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className={`text-sm font-label-md ${online ? 'text-secondary' : 'text-outline'}`}>
              {online ? 'Online' : 'Offline'}
            </span>
            <button
              type="button"
              disabled={verificationStatus !== 'verified'}
              aria-pressed={online}
              onClick={handlePresenceToggle}
              className={`w-14 h-7 rounded-full relative transition-colors shrink-0 ${
                online ? 'bg-secondary' : 'bg-surface-variant'
              } ${verificationStatus !== 'verified' ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                  online ? 'left-8' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <StatCard
            icon="account_balance_wallet"
            label="Earnings"
            accent="secondary"
            value={loading ? '…' : `${balance?.coinBalance ?? 0} coins`}
            hint="Available balance"
          />
          <StatCard
            icon="lock"
            label="Escrow"
            accent="primary"
            value={loading ? '…' : `${balance?.escrowBalance ?? 0} coins`}
            hint="Held for active sessions"
          />
          <StatCard
            icon="payments"
            label="Session rate"
            accent="tertiary"
            value={`${user?.profile?.coinRatePerSession ?? 0} coins`}
            hint="Per consultation"
          />
        </div>

        <DashboardSection
          title="Recent activity"
          badge={
            transactions.length > 0 ? (
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="flex items-center gap-1 text-primary hover:text-on-primary-fixed-variant font-label-md text-sm"
              >
                <MaterialIcon name="download" className="text-[18px]" />
                CSV
              </button>
            ) : undefined
          }
        >
          {loading ? (
            <LoadingSpinner />
          ) : transactions.length === 0 ? (
            <EmptyState
              icon="history"
              title="No sessions yet"
              description="Go online to receive patient calls. Activity will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/50">
                    <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant">Date</th>
                    <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant">Type</th>
                    <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface border-b border-outline-variant/30">
                      <td className="py-stack-sm px-stack-lg">{new Date(tx.timestamp).toLocaleDateString()}</td>
                      <td className="py-stack-sm px-stack-lg text-on-surface-variant capitalize text-sm">
                        {tx.type.replace(/_/g, ' ')}
                      </td>
                      <td
                        className={`py-stack-sm px-stack-lg text-right font-label-md ${
                          tx.amountCoins > 0 ? 'text-secondary' : 'text-error'
                        }`}
                      >
                        {tx.amountCoins > 0 ? '+' : ''}
                        {tx.amountCoins}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardSection>
      </main>
    </AppShell>
  )
}
