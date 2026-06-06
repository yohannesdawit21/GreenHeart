import { Link } from 'react-router-dom'
import { MaterialIcon } from '../components/MaterialIcon'
import { Logo } from '../components/Logo'

const packages = [
  {
    id: 'starter',
    label: 'Starter',
    coins: 20,
    price: '$19.99 USD',
    icon: 'star_half',
    features: ['1 AI Diagnostic Scan', 'Basic Metric Tracking'],
  },
  {
    id: 'growth',
    label: 'Most Popular',
    coins: 50,
    price: '$44.99 USD',
    save: 'Save 10%',
    icon: 'trending_up',
    featured: true,
    features: ['3 AI Diagnostic Scans', 'Advanced Metric Tracking', '1 Month Premium Access'],
  },
  {
    id: 'pro',
    label: 'Pro',
    coins: 120,
    price: '$99.99 USD',
    save: 'Save 20%',
    icon: 'diamond',
    features: ['Unlimited Diagnostic Scans', 'Priority AI Processing', '3 Months Premium Access'],
  },
]

export function WalletPage() {
  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex">
      <nav className="hidden md:flex flex-col w-64 h-screen py-stack-lg px-stack-md gap-stack-md bg-surface border-r border-outline-variant fixed left-0 top-0 z-40">
        <div className="mb-stack-lg px-4 flex items-center gap-3">
          <Logo className="w-10 h-10" />
          <div>
            <Link to="/discover" className="font-headline-md text-headline-md font-extrabold text-primary block">
              Green Heart
            </Link>
            <p className="font-label-md text-label-md text-on-surface-variant">Holistic Health</p>
          </div>
        </div>
        <ul className="flex flex-col gap-unit w-full font-label-md text-label-md">
          <li>
            <Link to="/discover" className="flex items-center gap-stack-sm text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-lg transition-colors">
              <MaterialIcon name="explore" />
              <span>Discover</span>
            </Link>
          </li>
          <li>
            <Link to="/wallet" className="flex items-center gap-stack-sm bg-secondary-container text-on-secondary-container rounded-lg px-4 py-3 scale-[0.98] transition-transform">
              <MaterialIcon name="account_balance_wallet" filled />
              <span>WALLET</span>
            </Link>
          </li>
          <li>
            <Link to="/advisor" className="flex items-center gap-stack-sm text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-lg transition-colors">
              <MaterialIcon name="history" />
              <span>Logs</span>
            </Link>
          </li>
          <li>
            <span className="flex items-center gap-stack-sm text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer">
              <MaterialIcon name="settings" />
              <span>Settings</span>
            </span>
          </li>
        </ul>
      </nav>

      <main className="flex-1 md:ml-64 bg-[#F8F9FA] min-h-screen pb-24 md:pb-8">
        <header className="w-full h-16 flex justify-between items-center px-margin-mobile md:px-margin-desktop bg-surface-container-lowest md:bg-transparent border-b border-outline-variant md:border-none sticky top-0 z-30 md:static">
          <div className="md:hidden flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-headline-md text-headline-md font-bold text-primary">Green Heart</span>
          </div>
          <div className="hidden md:block">
            <h2 className="font-headline-md text-headline-md text-on-background">Wallet Hub</h2>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors">
              <MaterialIcon name="monetization_on" />
            </button>
            <div className="w-10 h-10 rounded-full bg-surface-dim overflow-hidden cursor-pointer border border-outline-variant hover:border-primary transition-colors">
              <img
                alt="User profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKfXjwFisKRVVRSGXawzQK01zI8nUFSjXFStAx1LpwDlJH0ji1kv76bM9hyMQF383_7fbrej0mIjfiGu_bltKCjfPP8y1AN3eu8Yt3IKOyctRJdbtlFCXqEhWvfzFJenWx15YVDptYJj37pKhHrkhp4PKG5xJf3DTcTBwoZTMibStkJlSBwOu1m-wI1ICnWyxOEcsXlA0k552pF5C5ImkUoqHclwx50foOBzuCXZ2AUJ8KomMWcZ7m5XwCrAm-uIVsmCh6gby6wcv_"
              />
            </div>
          </div>
        </header>

        <div className="px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto space-y-stack-lg">
          <section className="rounded-xl overflow-hidden shadow-ambient relative bg-linear-to-br from-primary to-secondary p-stack-lg md:p-10 text-on-primary">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="font-label-md text-label-md text-on-primary/80 mb-2 uppercase tracking-wider">
                  Available Balance
                </p>
                <div className="flex items-baseline gap-3">
                  <MaterialIcon name="monetization_on" className="text-4xl opacity-90" />
                  <h2 className="font-stat-xl text-stat-xl font-extrabold tracking-tight">50 Coins</h2>
                </div>
              </div>
              <button type="button" className="bg-surface-container-lowest text-primary px-6 py-3 rounded-lg font-label-md text-label-md hover:bg-surface-bright transition-colors shadow-sm flex items-center gap-2">
                <MaterialIcon name="history" className="text-sm" />
                View Transaction History
              </button>
            </div>
          </section>

          <section>
            <div className="mb-stack-md">
              <h3 className="font-headline-md text-headline-md text-on-background mb-2">Acquire Coins</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Select a bundle to top up your Green Heart wallet for AI health diagnostics and premium features.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-surface-container-lowest rounded-xl p-stack-md flex flex-col justify-between h-full cursor-pointer transition-all ${
                    pkg.featured
                      ? 'border-2 border-primary shadow-ambient relative transform md:-translate-y-2'
                      : 'border border-outline-variant hover:shadow-ambient'
                  }`}
                >
                  {pkg.featured && (
                    <>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary font-label-md text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">
                        {pkg.label}
                      </div>
                      <div className="absolute top-4 right-4 text-primary">
                        <MaterialIcon name="check_circle" filled />
                      </div>
                    </>
                  )}
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          pkg.featured ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-primary'
                        }`}
                      >
                        <MaterialIcon name={pkg.icon} />
                      </div>
                      {!pkg.featured && (
                        <span className="font-label-md text-label-md bg-surface text-on-surface-variant px-3 py-1 rounded-full border border-outline-variant">
                          {pkg.label}
                        </span>
                      )}
                    </div>
                    <h4 className="font-headline-md text-headline-md mb-1">{pkg.coins} Coins</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                      {pkg.price}
                      {pkg.save && (
                        <span className="text-xs text-primary font-label-md ml-2 inline-block bg-primary/10 px-2 py-0.5 rounded">
                          {pkg.save}
                        </span>
                      )}
                    </p>
                    <ul className="space-y-3 font-body-md text-body-md text-on-surface-variant border-t border-outline-variant pt-4">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <MaterialIcon name="check_circle" className="text-primary text-sm" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-stack-lg flex justify-end">
              <button type="button" className="bg-primary text-on-primary font-label-md text-label-md px-8 py-4 rounded-lg shadow-ambient hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-2 w-full md:w-auto justify-center">
                INITIALIZE TOP-UP
                <MaterialIcon name="arrow_forward" className="text-sm" />
              </button>
            </div>
          </section>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 md:hidden bg-surface-container-lowest shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-outline-variant glass-panel">
        <Link to="/discover" className="flex flex-col items-center justify-center text-on-surface-variant p-2 w-16">
          <MaterialIcon name="explore" className="mb-1" />
          <span className="font-label-md text-[10px]">Discover</span>
        </Link>
        <Link to="/wallet" className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl p-2 w-16 scale-95 transition-transform">
          <MaterialIcon name="account_balance_wallet" filled className="mb-1" />
          <span className="font-label-md text-[10px]">Wallet</span>
        </Link>
        <Link to="/advisor" className="flex flex-col items-center justify-center text-on-surface-variant p-2 w-16">
          <MaterialIcon name="history" className="mb-1" />
          <span className="font-label-md text-[10px]">Logs</span>
        </Link>
        <span className="flex flex-col items-center justify-center text-on-surface-variant p-2 w-16">
          <MaterialIcon name="settings" className="mb-1" />
          <span className="font-label-md text-[10px]">Settings</span>
        </span>
      </nav>
    </div>
  )
}
