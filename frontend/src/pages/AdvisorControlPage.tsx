import { useState, useEffect } from 'react'
import { AppShell, appShellMainClass } from '../components/layout/AppShell'
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
  const canGoOnline = verificationStatus === 'verified' && connected

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
    if (!canGoOnline && !online) return
    setPresenceError('')
    const newStatus = !online
    try {
      await sessionService.updatePresence({ online: newStatus })
      setOnline(newStatus)
    } catch (err: any) {
      const code = err.response?.data?.error?.code
      const message = err.response?.data?.error?.message
      if (code === 'ADVISOR_NOT_VERIFIED') {
        setPresenceError('You must be verified before going online.')
      } else if (code === 'SOCKET_NOT_CONNECTED' || !connected) {
        setPresenceError('Realtime connection required — wait for Live indicator or refresh.')
      } else {
        setPresenceError(message || 'Could not update online status.')
      }
    }
  }

  return (
    <AppShell activeNav="advisor" showSearch={false}>
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        {verificationStatus === 'pending_review' && (
          <div className="bg-primary-container/20 border border-primary/30 p-stack-md rounded-lg mb-stack-lg flex gap-3">
            <MaterialIcon name="hourglass_top" filled className="text-primary shrink-0" />
            <div>
              <p className="font-label-md font-bold uppercase tracking-wide text-primary">Under review</p>
              <p className="text-sm text-on-surface-variant mt-1">
                A partner doctor will review your application. You cannot go online until verified.
              </p>
            </div>
          </div>
        )}

        {verificationStatus === 'rejected' && (
          <div className="bg-error-container/20 border border-error p-stack-md rounded-lg mb-stack-lg flex gap-3">
            <MaterialIcon name="cancel" filled className="text-error shrink-0" />
            <div>
              <p className="font-label-md font-bold text-error">Application rejected</p>
              <p className="text-sm text-on-surface-variant mt-1">Contact support if you believe this was an error.</p>
            </div>
          </div>
        )}

        {verificationStatus === 'verified' && (
          <div className="bg-secondary-container/20 border border-secondary/40 p-stack-sm rounded-lg mb-stack-lg flex items-center justify-center gap-2 text-sm font-label-md uppercase tracking-wider text-secondary">
            <MaterialIcon name="verified" filled />
            Verified advisor
          </div>
        )}

        {presenceError && (
          <div className="bg-error-container/20 border border-error p-stack-sm rounded-lg mb-stack-lg text-sm">{presenceError}</div>
        )}

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md mb-stack-lg flex justify-between items-center">
          <div>
            <p className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant">Live dispatch</p>
            <p className="text-sm text-on-surface-variant mt-1">
              {connected ? 'Connected — patients can reach you when online' : 'Connecting to server…'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-label-md ${online ? 'text-secondary' : 'text-outline'}`}>
              {online ? 'Online' : 'Offline'}
            </span>
            <button
              type="button"
              disabled={verificationStatus !== 'verified'}
              aria-pressed={online}
              onClick={handlePresenceToggle}
              className={`w-14 h-7 rounded-full relative transition-colors ${
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-stack-lg">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
            <p className="text-sm text-on-surface-variant mb-1">Earnings (coins)</p>
            <p className="font-stat-xl text-stat-xl">{loading ? '…' : balance?.coinBalance ?? 0}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
            <p className="text-sm text-on-surface-variant mb-1">Session rate</p>
            <p className="font-stat-xl text-stat-xl">{user?.profile?.coinRatePerSession ?? 0} <span className="text-lg font-normal">coins</span></p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="px-stack-lg py-stack-md border-b border-outline-variant">
            <h3 className="font-headline-md">Recent activity</h3>
          </div>
          {transactions.length === 0 ? (
            <p className="p-8 text-center text-on-surface-variant text-sm">No sessions yet — go online to receive calls.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/40">
              {transactions.slice(0, 8).map((tx) => (
                <li key={tx.id} className="px-stack-lg py-3 flex justify-between text-sm">
                  <span className="text-on-surface-variant">{new Date(tx.timestamp).toLocaleDateString()}</span>
                  <span className="capitalize">{tx.type.replace(/_/g, ' ')}</span>
                  <span className={tx.amountCoins > 0 ? 'text-secondary font-medium' : 'text-error'}>
                    {tx.amountCoins > 0 ? '+' : ''}
                    {tx.amountCoins}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </AppShell>
  )
}
