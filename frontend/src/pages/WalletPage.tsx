import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import {
  appShellMainClass,
  DashboardHeader,
  DashboardAlert,
  DashboardSection,
  LoadingSpinner,
  EmptyState,
} from '../components/layout/dashboard-ui'
import { MaterialIcon } from '../components/MaterialIcon'
import { walletService } from '../api/wallet.service'
import type { WalletBalance, CoinPackageId, TransactionDto } from '@shared/contracts/wallet.api'

const packages = [
  { id: 'starter' as CoinPackageId, label: 'Starter', coins: 20, price: '$19.99', icon: 'star_half' },
  { id: 'growth' as CoinPackageId, label: 'Popular', coins: 50, price: '$44.99', icon: 'trending_up', featured: true },
  { id: 'pro' as CoinPackageId, label: 'Pro', coins: 120, price: '$99.99', icon: 'diamond' },
]

export function WalletPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [transactions, setTransactions] = useState<TransactionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<CoinPackageId>('growth')
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const refreshWallet = async () => {
    const [balData, txData] = await Promise.all([walletService.getBalance(), walletService.getTransactions()])
    setBalance(balData.wallet)
    setTransactions(txData.transactions)
  }

  useEffect(() => {
    refreshWallet()
      .catch(() => setError('Could not load wallet'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const paymentId = searchParams.get('payment')
    if (!paymentId?.startsWith('mock_')) return

    walletService
      .completeMockPurchase({ mockPaymentId: paymentId })
      .then(async () => {
        setMessage('Payment completed — coins added to your wallet.')
        await refreshWallet()
        setSearchParams({})
      })
      .catch(() => setError('Could not complete payment. Try purchasing again.'))
  }, [searchParams, setSearchParams])

  const handlePurchase = async () => {
    setIsPurchasing(true)
    setError('')
    setMessage('')
    try {
      const data = await walletService.initiatePurchase({ packageId: selectedPackage })
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else if (data.mockPaymentId) {
        await walletService.completeMockPurchase({ mockPaymentId: data.mockPaymentId })
        setMessage(`Added ${data.coins} coins to your wallet.`)
        await refreshWallet()
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Purchase failed')
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <AppShell activeNav="wallet" showSearch={false}>
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        <DashboardHeader
          title="Wallet"
          description="Buy coins to book verified advisor sessions."
          action={
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="w-full sm:w-auto bg-surface-container-lowest border border-outline-variant text-primary px-5 py-3 rounded-lg font-label-md text-sm hover:bg-surface-container flex items-center justify-center gap-2"
            >
              <MaterialIcon name="history" className="text-sm" />
              {showHistory ? 'Hide history' : 'Transaction history'}
            </button>
          }
        />

        <section className="rounded-xl overflow-hidden shadow-ambient relative bg-linear-to-br from-primary to-secondary p-stack-lg md:p-10 text-on-primary">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10">
            <p className="font-label-md text-sm uppercase tracking-wider opacity-80 mb-2">Available balance</p>
            <div className="flex items-baseline gap-3">
              <MaterialIcon name="monetization_on" className="text-4xl opacity-90" />
              <h2 className="font-stat-xl text-stat-xl font-extrabold">{loading ? '…' : `${balance?.coinBalance ?? 0} coins`}</h2>
            </div>
            {!loading && (balance?.escrowBalance ?? 0) > 0 && (
              <p className="mt-2 text-sm opacity-80">{balance?.escrowBalance} coins in escrow for active sessions</p>
            )}
          </div>
        </section>

        {message && (
          <DashboardAlert variant="success" icon="check_circle">
            {message}
          </DashboardAlert>
        )}
        {error && (
          <DashboardAlert variant="error" icon="error">
            {error}
          </DashboardAlert>
        )}

        <section>
          <h3 className="font-headline-md text-headline-md mb-stack-md">Choose a bundle</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedPackage(pkg.id)}
                className={`text-left bg-surface-container-lowest rounded-xl p-stack-md border transition-all ${
                  selectedPackage === pkg.id
                    ? 'border-primary ring-2 ring-primary/20 shadow-ambient'
                    : 'border-outline-variant hover:border-primary/40'
                }`}
              >
                {pkg.featured && (
                  <span className="text-[10px] uppercase tracking-wider bg-primary text-on-primary px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                <div className="flex items-center gap-3 mt-2 mb-2">
                  <MaterialIcon name={pkg.icon} className="text-primary text-2xl" />
                  <div>
                    <p className="font-headline-md">{pkg.coins} coins</p>
                    <p className="text-sm text-on-surface-variant">{pkg.price}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-stack-lg flex justify-end pb-2 md:pb-0">
            <button
              type="button"
              onClick={handlePurchase}
              disabled={isPurchasing}
              className="w-full sm:w-auto bg-primary text-on-primary font-label-md px-8 py-3 rounded-lg hover:bg-on-primary-fixed-variant disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPurchasing ? 'Processing…' : 'Buy coins (sandbox)'}
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </button>
          </div>
        </section>

        {showHistory && (
          <DashboardSection title="Transaction history">
            {loading ? (
              <LoadingSpinner />
            ) : transactions.length === 0 ? (
              <EmptyState icon="receipt_long" title="No transactions yet" description="Purchase coins to get started." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/50">
                      <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant">Date</th>
                      <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant">Type</th>
                      <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant text-right">Coins</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-outline-variant/30 hover:bg-surface">
                        <td className="py-stack-sm px-stack-lg text-sm">{new Date(tx.timestamp).toLocaleString()}</td>
                        <td className="py-stack-sm px-stack-lg text-sm capitalize">{tx.type.replace(/_/g, ' ')}</td>
                        <td
                          className={`py-stack-sm px-stack-lg text-right font-label-md ${
                            tx.amountCoins >= 0 ? 'text-secondary' : 'text-error'
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
        )}
      </main>
    </AppShell>
  )
}
