import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MaterialIcon } from '../components/MaterialIcon'
import { Logo } from '../components/Logo'

const performanceLogs = [
  { date: 'Oct 24, 2023', sessionId: '#SD-8921', duration: '45 mins', coins: 15 },
  { date: 'Oct 22, 2023', sessionId: '#SD-8840', duration: '120 mins', coins: 40 },
  { date: 'Oct 20, 2023', sessionId: '#SD-8799', duration: '30 mins', coins: 10 },
  { date: 'Oct 18, 2023', sessionId: '#SD-8652', duration: '60 mins', coins: 20 },
]

export function AdvisorControlPage() {
  const [online, setOnline] = useState(false)

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
        <div className="mb-stack-lg flex items-center gap-3">
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
        <Link to="/wallet" className="flex items-center gap-stack-sm bg-secondary-container text-on-secondary-container rounded-lg px-4 py-3 transition-transform scale-95">
          <MaterialIcon name="account_balance_wallet" />
          <span className="font-label-md text-label-md">WALLET</span>
        </Link>
        <Link to="/advisor" className="flex items-center gap-stack-sm text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-lg transition-transform hover:scale-95">
          <MaterialIcon name="history" />
          <span className="font-label-md text-label-md">Logs</span>
        </Link>
        <span className="flex items-center gap-stack-sm text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-lg transition-transform hover:scale-95 cursor-pointer">
          <MaterialIcon name="settings" />
          <span className="font-label-md text-label-md">Settings</span>
        </span>
      </nav>

      <main className="pt-20 md:pt-stack-lg md:ml-64 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pb-32 md:pb-stack-lg">
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
              aria-pressed={online}
              onClick={() => setOnline(!online)}
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${
                online ? 'bg-secondary' : 'bg-surface-variant'
              }`}
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
                Available Balance
              </span>
            </div>
            <div>
              <h2 className="font-stat-xl text-stat-xl text-on-surface mb-unit">
                450 <span className="font-headline-md text-headline-md text-on-surface-variant font-normal">Coins</span>
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Ready for transfer</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg flex flex-col justify-between shadow-[0_4px_24px_rgba(13,92,96,0.08)]">
            <div className="flex justify-between items-start mb-stack-md">
              <div className="w-12 h-12 bg-primary-container/10 rounded-lg flex items-center justify-center border border-primary-container/20">
                <MaterialIcon name="schedule" filled className="text-primary" />
              </div>
              <span className="bg-surface-container px-3 py-1 rounded-full font-label-md text-label-md text-on-surface-variant">
                Active Time
              </span>
            </div>
            <div>
              <h2 className="font-stat-xl text-stat-xl text-on-surface mb-unit">
                1,240 <span className="font-headline-md text-headline-md text-on-surface-variant font-normal">Mins</span>
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">+12% from last month</p>
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
                4.9 <span className="font-headline-md text-headline-md text-on-surface-variant font-normal">/ 5.0</span>
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Based on 84 reviews</p>
            </div>
          </div>
        </div>

        <div className="mb-stack-md">
          <span className="inline-flex items-center gap-unit bg-secondary/10 border border-secondary/20 text-secondary px-4 py-2 rounded-full font-label-md text-label-md">
            <MaterialIcon name="check_circle" filled className="text-[18px]" />
            Cash-Out Requested
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="px-stack-lg py-stack-md border-b border-outline-variant bg-surface-bright flex justify-between items-center">
            <h3 className="font-headline-md text-headline-md text-on-surface">Performance Logs</h3>
            <button type="button" className="flex items-center gap-unit text-primary hover:text-primary-container transition-colors">
              <span className="font-label-md text-label-md">Download CSV</span>
              <MaterialIcon name="download" className="text-[18px]" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/50">
                  <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant">Date</th>
                  <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant">Session ID</th>
                  <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant">Duration</th>
                  <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant text-right">
                    Coins Earned
                  </th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface">
                {performanceLogs.map((log, i) => (
                  <tr
                    key={log.sessionId}
                    className={`hover:bg-surface transition-colors border-b border-outline-variant/30 ${
                      i % 2 === 1 ? 'bg-[#F8F9FA]' : 'bg-surface-container-lowest'
                    }`}
                  >
                    <td className="py-stack-sm px-stack-lg">{log.date}</td>
                    <td className="py-stack-sm px-stack-lg text-on-surface-variant">{log.sessionId}</td>
                    <td className="py-stack-sm px-stack-lg">{log.duration}</td>
                    <td className="py-stack-sm px-stack-lg text-right font-label-md text-label-md">{log.coins}</td>
                  </tr>
                ))}
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
        <Link to="/wallet" className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl p-2 transition-transform scale-95">
          <MaterialIcon name="account_balance_wallet" filled />
          <span className="font-label-md text-label-md text-[10px]">Wallet</span>
        </Link>
        <Link to="/advisor" className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:text-primary transition-transform scale-95">
          <MaterialIcon name="history" />
          <span className="font-label-md text-label-md text-[10px]">Logs</span>
        </Link>
        <span className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:text-primary transition-transform scale-95 cursor-pointer">
          <MaterialIcon name="settings" />
          <span className="font-label-md text-label-md text-[10px]">Settings</span>
        </span>
      </nav>
    </div>
  )
}
