import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MaterialIcon } from '../components/MaterialIcon'
import { Logo } from '../components/Logo'
import { sessionService } from '../api/session.service'
import { walletService } from '../api/wallet.service'
import { useAuth } from '../context/AuthContext'
import type { WalletBalance, TransactionDto } from '@shared/contracts/wallet.api'

export function AdvisorControlPage() {
  const { user } = useAuth()
  const [online, setOnline] = useState(false)
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [transactions, setTransactions] = useState<TransactionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [presenceError, setPresenceError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceData, transData] = await Promise.all([
          walletService.getBalance(),
          walletService.getTransactions()
        ])
        setBalance(balanceData.wallet)
        setTransactions(transData.transactions)
      } catch (err) {
        console.error('Failed to fetch advisor data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handlePresenceToggle = async () => {
    if (user?.profile?.verificationStatus !== 'verified') return
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
      } else if (code === 'SOCKET_NOT_CONNECTED') {
        setPresenceError('Realtime connection required — refresh the page and try again.')
      } else {
        setPresenceError(message || 'Could not update online status.')
      }
    }
  }

  const handleDownloadCsv = () => {
    if (transactions.length === 0) return
    const header = 'Date,Type,Amount (Coins)\n'
    const rows = transactions
      .map(
        (tx) =>
          `${new Date(tx.timestamp).toISOString()},${tx.type},${tx.amountCoins}`,
      )
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'greenheart-activity.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const verificationStatus = user?.profile?.verificationStatus

  return (
    <div className="text-on-surface antialiased bg-background min-h-screen">
      <header className="bg-surface-container-lowest border-b border-outline-variant fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 md:hidden">
        <div className="flex items-center gap-2 font-headline-md text-headline-md font-bold text-primary">
          <Logo className="w-8 h-8" />
          Green Heart
        </div>
        <div className="flex items-center gap-stack-md">
          <Link to="/auth" className="text-primary cursor-pointer hover:bg-surface-container p-2 rounded-full">
            <MaterialIcon name="account_circle" />
          </Link>
          <Link to="/wallet" className="text-primary cursor-pointer hover:bg-surface-container p-2 rounded-full">
            <MaterialIcon name="monetization_on" />
          </Link>
        </div>
      </header>

      <nav className="bg-surface border-r border-outline-variant hidden md:flex flex-col w-64 h-screen py-stack-lg px-stack-md gap-stack-md fixed left-0 top-0">
        <div className="mb-stack-lg flex items-center gap-3 px-4">
          <Logo className="w-10 h-10" />
          <div>
            <Link to="/discover" className="font-headline-md text-headline-md font-extrabold text-primary block">
              Green Heart
            </Link>
            <div className="font-label-md text-label-md text-on-surface-variant">Holistic Health</div>
          </div>
        </div>
        <Link to="/discover" className="flex items-center gap-stack-sm text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-lg transition-transform hover:scale-95">
          <MaterialIcon name="explore" />
          <span className="font-label-md text-label-md">Discover</span>
        </Link>
        <Link to="/wallet" className="flex items-center gap-stack-sm text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-lg transition-transform hover:scale-95">
          <MaterialIcon name="account_balance_wallet" />
          <span className="font-label-md text-label-md">WALLET</span>
        </Link>
        <Link to="/advisor" className="flex items-center gap-stack-sm bg-secondary-container text-on-secondary-container rounded-lg px-4 py-3 scale-[0.98] transition-transform">
          <MaterialIcon name="history" filled />
          <span className="font-label-md text-label-md">Logs</span>
        </Link>
        <span className="flex items-center gap-stack-sm text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-lg transition-transform hover:scale-95 cursor-pointer">
          <MaterialIcon name="settings" />
          <span className="font-label-md text-label-md">Settings</span>
        </span>
      </nav>

      <main className="pt-20 md:pt-stack-lg md:ml-64 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pb-32 md:pb-stack-lg">
        {verificationStatus === 'pending_review' && (
          <div className="bg-primary-container/20 border border-primary-container text-on-primary-container p-stack-md rounded-lg mb-stack-lg flex items-center gap-stack-sm shadow-sm">
            <MaterialIcon name="info" filled className="text-primary" />
            <div className="flex-grow">
              <p className="font-label-md text-label-md font-bold uppercase tracking-wider">Application Under Review</p>
              <p className="font-body-md text-body-md opacity-80">Our partner doctors are reviewing your credentials. You will be notified once verified.</p>
            </div>
          </div>
        )}

        {verificationStatus === 'rejected' && (
          <div className="bg-error-container/20 border border-error text-on-error-container p-stack-md rounded-lg mb-stack-lg flex items-center gap-stack-sm shadow-sm">
            <MaterialIcon name="error" filled className="text-error" />
            <div className="flex-grow">
              <p className="font-label-md text-label-md font-bold uppercase tracking-wider">Verification Rejected</p>
              <p className="font-body-md text-body-md opacity-80">Your application could not be verified. Please contact support for more information.</p>
            </div>
          </div>
        )}

        {verificationStatus === 'verified' && (
          <div className="bg-secondary/10 border border-secondary text-secondary-container p-stack-sm rounded-lg mb-stack-lg flex items-center justify-center gap-stack-sm text-xs font-label-md uppercase tracking-[0.2em]">
            <MaterialIcon name="verified" filled className="text-[16px]" />
            Verified Medical Advisor
          </div>
        )}

        {presenceError && (
          <div className="bg-error-container/20 border border-error text-on-error-container p-stack-sm rounded-lg mb-stack-lg flex items-center gap-stack-sm">
            <MaterialIcon name="error" filled className="text-error shrink-0" />
            <p className="font-body-md text-body-md">{presenceError}</p>
          </div>
        )}

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md flex justify-between items-center mb-stack-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-stack-sm">
            <MaterialIcon name="cell_tower" className="text-outline" />
            <span className="font-label-md text-label-md text-on-surface-variant tracking-widest uppercase">
              Live Dispatch
            </span>
          </div>
          <div className="flex items-center gap-stack-sm">
            <span className={`font-label-md text-label-md ${online ? 'text-secondary' : 'text-outline'}`}>
              ● {online ? 'ONLINE' : 'OFFLINE'}
            </span>
            <button
              type="button"
              disabled={verificationStatus !== 'verified'}
              aria-pressed={online}
              onClick={handlePresenceToggle}
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${
                online ? 'bg-secondary' : 'bg-surface-variant'
              } ${verificationStatus !== 'verified' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full transition-transform duration-300 ${
                  online ? 'left-7 bg-white' : 'left-1 bg-outline'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg flex flex-col justify-between shadow-[0_4px_24px_rgba(13,92,96,0.08)]">
            <div className="flex justify-between items-start mb-stack-md">
              <div className="w-12 h-12 bg-secondary-container/20 rounded-lg flex items-center justify-center border border-secondary-container/30">
                <MaterialIcon name="account_balance_wallet" filled className="text-secondary" />
              </div>
              <span className="bg-surface-container px-3 py-1 rounded-full font-label-md text-label-md text-on-surface-variant">
                Total Earnings
              </span>
            </div>
            <div>
              <h2 className="font-stat-xl text-stat-xl text-on-surface mb-unit">
                {loading ? '...' : balance?.coinBalance || 0} <span className="font-headline-md text-headline-md text-on-surface-variant font-normal">Coins</span>
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Available for withdrawal</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg flex flex-col justify-between shadow-[0_4px_24px_rgba(13,92,96,0.08)]">
            <div className="flex justify-between items-start mb-stack-md">
              <div className="w-12 h-12 bg-primary-container/10 rounded-lg flex items-center justify-center border border-primary-container/20">
                <MaterialIcon name="schedule" filled className="text-primary" />
              </div>
              <span className="bg-surface-container px-3 py-1 rounded-full font-label-md text-label-md text-on-surface-variant">
                Escrow Balance
              </span>
            </div>
            <div>
              <h2 className="font-stat-xl text-stat-xl text-on-surface mb-unit">
                {loading ? '...' : balance?.escrowBalance || 0} <span className="font-headline-md text-headline-md text-on-surface-variant font-normal">Coins</span>
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Pending session completion</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg flex flex-col justify-between shadow-[0_4px_24px_rgba(13,92,96,0.08)]">
            <div className="flex justify-between items-start mb-stack-md">
              <div className="w-12 h-12 bg-tertiary-container/10 rounded-lg flex items-center justify-center border border-tertiary-container/20">
                <MaterialIcon name="star" filled className="text-tertiary" />
              </div>
              <span className="bg-surface-container px-3 py-1 rounded-full font-label-md text-label-md text-on-surface-variant">
                Quality Score
              </span>
            </div>
            <div>
              <h2 className="font-stat-xl text-stat-xl text-on-surface mb-unit">
                {user?.profile?.coinRatePerSession ? `Rate: ${user.profile.coinRatePerSession}` : '4.9'} <span className="font-headline-md text-headline-md text-on-surface-variant font-normal">/ 5.0</span>
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Based on recent performance</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="px-stack-lg py-stack-md border-b border-outline-variant bg-surface-bright flex justify-between items-center">
            <h3 className="font-headline-md text-headline-md text-on-surface">Recent Activity</h3>
            <button type="button" onClick={handleDownloadCsv} className="flex items-center gap-unit text-primary hover:text-primary-container transition-colors">
              <span className="font-label-md text-label-md">Download CSV</span>
              <MaterialIcon name="download" className="text-[18px]" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/50">
                  <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant">Date</th>
                  <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant">Type</th>
                  <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant text-right">
                    Amount (Coins)
                  </th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface">
                {transactions.map((tx, i) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-surface transition-colors border-b border-outline-variant/30 ${
                      i % 2 === 1 ? 'bg-[#F8F9FA]' : 'bg-surface-container-lowest'
                    }`}
                  >
                    <td className="py-stack-sm px-stack-lg">{new Date(tx.timestamp).toLocaleDateString()}</td>
                    <td className="py-stack-sm px-stack-lg text-on-surface-variant uppercase text-xs tracking-wider">{tx.type.replace('_', ' ')}</td>
                    <td className={`py-stack-sm px-stack-lg text-right font-label-md text-label-md ${tx.amountCoins > 0 ? 'text-secondary' : 'text-error'}`}>
                      {tx.amountCoins > 0 ? '+' : ''}{tx.amountCoins}
                    </td>
                  </tr>
                ))}
                {!loading && transactions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-on-surface-variant">No recent activity</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <nav className="bg-surface-container-lowest border-t border-outline-variant fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 md:hidden shadow-lg">
        <Link to="/discover" className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:text-primary transition-transform scale-95">
          <MaterialIcon name="explore" />
          <span className="font-label-md text-label-md text-[10px]">Discover</span>
        </Link>
        <Link to="/wallet" className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:text-primary transition-transform scale-95">
          <MaterialIcon name="account_balance_wallet" />
          <span className="font-label-md text-label-md text-[10px]">Wallet</span>
        </Link>
        <Link to="/advisor" className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-xl p-2 scale-95 transition-transform">
          <MaterialIcon name="history" filled />
          <span className="font-label-md text-label-md text-[10px]">Logs</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:text-primary transition-transform scale-95">
          <MaterialIcon name="settings" />
          <span className="font-label-md text-label-md text-[10px]">Settings</span>
        </Link>
      </nav>
    </div>
  )
}
