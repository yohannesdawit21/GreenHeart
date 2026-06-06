import { useState, useEffect } from 'react'
import { AppShell, appShellMainClass } from '../components/layout/AppShell'
import { MaterialIcon } from '../components/MaterialIcon'
import { walletService } from '../api/wallet.service'
import type { WalletBalance, CoinPackageId } from '@shared/contracts/wallet.api'

const packages = [
  { id: 'starter' as CoinPackageId, label: 'Starter', coins: 20, price: '$19.99', icon: 'star_half' },
  { id: 'growth' as CoinPackageId, label: 'Popular', coins: 50, price: '$44.99', icon: 'trending_up', featured: true },
  { id: 'pro' as CoinPackageId, label: 'Pro', coins: 120, price: '$99.99', icon: 'diamond' },
]

export function WalletPage() {
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<CoinPackageId>('starter')
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const refreshBalance = async () => {
    const data = await walletService.getBalance()
    setBalance(data.wallet)
  }

  useEffect(() => {
    refreshBalance()
      .catch(() => setError('Could not load wallet'))
      .finally(() => setLoading(false))
  }, [])

  const handlePurchase = async () => {
    setIsPurchasing(true)
    setError('')
    setMessage('')
    try {
      const data = await walletService.initiatePurchase({ packageId: selectedPackage })
      if (data.mockPaymentId) {
        await walletService.completeSandboxPurchase(data.mockPaymentId)
        await refreshBalance()
        setMessage(`Added ${data.coins} coins to your wallet (sandbox payment).`)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Purchase failed')
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <AppShell activeNav="wallet" showSearch={false}>
      <main className={`${appShellMainClass} space-y-stack-lg`}>
        <header>
          <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-background">Wallet</h1>
          <p className="font-body-md text-on-surface-variant">Buy coins to book verified advisor sessions.</p>
        </header>

        <section className="rounded-xl bg-linear-to-br from-primary to-secondary p-stack-lg text-on-primary shadow-ambient">
          <p className="font-label-md text-sm uppercase tracking-wider opacity-80 mb-2">Available balance</p>
          <div className="flex items-baseline gap-2">
            <MaterialIcon name="monetization_on" className="text-3xl" />
            <h2 className="font-stat-xl text-stat-xl">{loading ? '…' : `${balance?.coinBalance ?? 0}`}</h2>
            <span className="font-headline-md opacity-90">coins</span>
          </div>
          {!loading && (balance?.escrowBalance ?? 0) > 0 && (
            <p className="mt-2 text-sm opacity-80">{balance?.escrowBalance} coins in escrow for active sessions</p>
          )}
        </section>

        {message && (
          <div className="bg-secondary-container/30 border border-secondary text-on-secondary-container p-stack-md rounded-lg flex items-center gap-2">
            <MaterialIcon name="check_circle" filled className="text-secondary" />
            <p>{message}</p>
          </div>
        )}
        {error && (
          <div className="bg-error-container/30 border border-error text-on-error-container p-stack-md rounded-lg flex items-center gap-2">
            <MaterialIcon name="error" filled />
            <p>{error}</p>
          </div>
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
                  selectedPackage === pkg.id ? 'border-primary ring-2 ring-primary/20 shadow-ambient' : 'border-outline-variant hover:border-primary/40'
                }`}
              >
                {pkg.featured && (
                  <span className="text-[10px] uppercase tracking-wider bg-primary text-on-primary px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                <div className="flex items-center gap-3 mt-2 mb-3">
                  <MaterialIcon name={pkg.icon} className="text-primary text-2xl" />
                  <div>
                    <p className="font-headline-md">{pkg.coins} coins</p>
                    <p className="text-sm text-on-surface-variant">{pkg.price}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-stack-lg flex justify-end pb-4 md:pb-0">
            <button
              type="button"
              onClick={handlePurchase}
              disabled={isPurchasing}
              className="bg-primary text-on-primary font-label-md px-8 py-3 rounded-lg hover:bg-on-primary-fixed-variant disabled:opacity-50 flex items-center gap-2"
            >
              {isPurchasing ? 'Processing…' : 'Buy coins (sandbox)'}
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </button>
          </div>
        </section>
      </main>
    </AppShell>
  )
}
