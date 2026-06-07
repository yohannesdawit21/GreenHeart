import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import {
  appShellMainClass,
  DashboardHeader,
  DashboardAlert,
  DashboardSection,
  LoadingSpinner,
  EmptyState,
} from '../components/layout/dashboard-ui'
import { btnOutline, btnPackage, btnPrimary } from '../components/layout/buttonStyles'
import { MaterialIcon } from '../components/MaterialIcon'
import { walletService } from '../api/wallet.service'
import { getApiErrorMessage } from '../utils/apiError'
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
  const [showHistory, setShowHistory] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<CoinPackageId>('growth')
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [message, setMessage] = useState('')
  const [loadError, setLoadError] = useState('')
  const [purchaseError, setPurchaseError] = useState('')

  const refreshWallet = async () => {
    const [balData, txData] = await Promise.all([walletService.getBalance(), walletService.getTransactions()])
    setBalance(balData.wallet)
    setTransactions(txData.transactions)
  }

  useEffect(() => {
    refreshWallet()
      .catch((err) => setLoadError(getApiErrorMessage(err, 'Could not load wallet')))
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
      .catch((err) => setLoadError(getApiErrorMessage(err, 'Could not complete payment. Try purchasing again.')))
  }, [searchParams, setSearchParams])

  const handlePurchase = async () => {
    setIsPurchasing(true)
    setPurchaseError('')
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
    } catch (err: unknown) {
      setPurchaseError(getApiErrorMessage(err, 'Purchase failed'))
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <AppShell activeNav="wallet" showSearch={false}>
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        <DashboardAlert variant="info" icon="info" title="Demo coins only">
          Purchases use a sandbox payment flow. Coins are for demonstration — not real money and not withdrawable as cash.
        </DashboardAlert>

        <DashboardHeader
          title="Wallet"
          description="Buy demo coins to book verified advisor sessions."
          action={
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className={`${btnOutline} text-sm px-5 py-3 flex items-center justify-center gap-2 w-full sm:w-auto`}
            >
              <MaterialIcon name="history" className="text-sm" />
              {showHistory ? 'Hide history' : 'Transaction history'}
            </button>
          }
        />

        <section className="rounded-xl overflow-hidden shadow-ambient relative bg-linear-to-br from-primary to-secondary p-stack-lg md:p-10 text-on-primary">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10">
            <p className="font-label-md text-sm uppercase tracking-wider opacity-80 mb-2">Demo coin balance</p>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span>{message}</span>
              <Link to="/discover" className={`${btnPrimary} text-sm px-4 py-2 text-center`}>
                Find an advisor
              </Link>
            </div>
          </DashboardAlert>
        )}
        {loadError && (
          <DashboardAlert variant="error" icon="error">
            {loadError}
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
                className={btnPackage(selectedPackage === pkg.id)}
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
          <div className="mt-stack-lg flex flex-col items-end gap-stack-sm pb-2 md:pb-0">
            {purchaseError && (
              <div className="w-full sm:w-auto sm:min-w-[280px]">
                <DashboardAlert variant="error" icon="error">{purchaseError}</DashboardAlert>
              </div>
            )}
            <button
              type="button"
              onClick={handlePurchase}
              disabled={isPurchasing}
              className={`${btnPrimary} px-8 py-3 w-full sm:w-auto flex items-center justify-center gap-2`}
            >
              {isPurchasing ? 'Processing…' : 'Buy demo coins (sandbox)'}
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
              <>
              <div className="md:hidden divide-y divide-outline-variant/40">
                {transactions.map((tx) => (
                  <div key={tx.id} className="py-stack-md flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm capitalize">{tx.type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(tx.timestamp).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <span
                      className={`font-label-md ${tx.amountCoins >= 0 ? 'text-secondary' : 'text-error'}`}
                    >
                      {tx.amountCoins > 0 ? '+' : ''}
                      {tx.amountCoins}
                    </span>
                  </div>
                ))}
              </div>
              <div className="hidden md:block overflow-x-auto">
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
              </>
            )}
          </DashboardSection>
        )}
      </main>
    </AppShell>
  )
}
