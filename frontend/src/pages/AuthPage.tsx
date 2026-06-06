import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MaterialIcon } from '../components/MaterialIcon'
import { Logo } from '../components/Logo'

type AuthMode = 'login' | 'signup'

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const navigate = useNavigate()

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-primary-container p-margin-desktop text-on-primary relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-on-primary-fixed-variant rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-stack-sm mb-stack-md">
            <Logo className="w-12 h-12" />
            <h1 className="font-display-lg text-display-lg">Green Heart</h1>
          </div>
          <p className="font-body-lg text-body-lg text-primary-fixed-dim max-w-md">
            The holistic health intelligence platform powered by a global coin economy.
          </p>
        </div>
        <div className="relative z-10 flex flex-col gap-stack-lg mt-stack-lg">
          <div className="glass-panel-brand p-stack-md rounded-xl shadow-lg">
            <div className="flex items-center gap-stack-sm mb-stack-sm">
              <MaterialIcon name="public" filled className="text-primary-fixed-dim" />
              <h3 className="font-headline-md text-headline-md">Global Coin Economy</h3>
            </div>
            <p className="font-body-md text-body-md text-surface-container-low opacity-80">
              Earn, trade, and invest in your well-being across borders with our secure, decentralized wellness ledger.
            </p>
          </div>
          <div className="glass-panel-brand p-stack-md rounded-xl shadow-lg">
            <div className="flex items-center gap-stack-sm mb-stack-sm">
              <MaterialIcon name="monitoring" filled className="text-primary-fixed-dim" />
              <h3 className="font-headline-md text-headline-md">Diagnostic Precision</h3>
            </div>
            <p className="font-body-md text-body-md text-surface-container-low opacity-80">
              Advanced AI analytics process your holistic health markers to deliver unparalleled, actionable insights.
            </p>
          </div>
        </div>
        <div className="relative z-10 mt-auto pt-stack-lg">
          <p className="font-label-md text-label-md text-primary-fixed-dim uppercase tracking-widest">
            Informed Calm. Clinical Reliability.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface relative">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl shadow-primary-container/10 p-stack-lg transition-all duration-300 relative z-10">
          <div className="md:hidden flex flex-col items-center text-center mb-stack-lg">
            <Logo className="w-12 h-12 mb-stack-sm" />
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">Green Heart</h1>
            <p className="font-label-md text-label-md text-on-surface-variant">Holistic Health Intelligence</p>
          </div>

          <div className="flex bg-surface-variant rounded-lg p-unit mb-stack-lg">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-center font-label-md text-label-md rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-center font-label-md text-label-md rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Sign Up
            </button>
          </div>

          {mode === 'login' ? (
            <form className="flex flex-col gap-stack-md" onSubmit={(e) => { e.preventDefault(); navigate('/discover') }}>
              <div className="text-center mb-stack-sm">
                <h2 className="font-headline-md text-headline-md text-on-surface">Welcome Back</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Enter your credentials to access your dashboard.
                </p>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-unit">Email Address</label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
                  placeholder="name@example.com"
                  type="email"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-unit">
                  <label className="block font-label-md text-label-md text-on-surface-variant">Password</label>
                  <button type="button" className="font-label-md text-label-md text-primary hover:underline">
                    Forgot?
                  </button>
                </div>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
                  placeholder="••••••••"
                  type="password"
                />
              </div>
              <button
                type="submit"
                className="mt-stack-sm w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-on-primary-fixed-variant transition-colors flex justify-center items-center gap-stack-sm"
              >
                CONTINUE TO PLATFORM
                <MaterialIcon name="arrow_forward" className="text-[18px]" />
              </button>
              <div className="mt-stack-sm relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant" />
                </div>
                <div className="relative bg-surface-container-lowest px-4 font-label-md text-label-md text-on-surface-variant">
                  Or continue with
                </div>
              </div>
              <button
                type="button"
                className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md py-3 rounded-lg hover:bg-surface-container transition-colors flex justify-center items-center gap-stack-sm"
              >
                <img
                  alt="Google Logo"
                  className="w-5 h-5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYdvonpeUd4Vy2ExHFpRyyxWnLTD9SzprpyMIahsN2QNVwd8M5fuWQo7mhsLgPd3KCin3_GEJiF55p0UhN86wD-9HkuPtY6pIQ-0gCIOkmFnS4fAR45AjB6ZXMJuLGPpQ7RfF-Zlk9q1PhFxPVyMKzdP0RWWRss0O5dVxN5f-zAfKM8k8bUfz-e_qKCQxaGt1ZxK3nX_roQ5Ha-I44d2ELvBSRx0puhfUJoV9kq3F5opSezkM9C0vyawuf-AoagU80Y6COh1JdquCb"
                />
                Google
              </button>
            </form>
          ) : (
            <form className="flex flex-col gap-stack-md" onSubmit={(e) => { e.preventDefault(); navigate('/discover') }}>
              <div className="text-center mb-stack-sm">
                <h2 className="font-headline-md text-headline-md text-on-surface">Create Account</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Select your primary role to get started.</p>
              </div>
              <div className="grid grid-cols-2 gap-stack-sm mb-stack-sm">
                <label className="cursor-pointer">
                  <input defaultChecked className="peer sr-only" name="role" type="radio" />
                  <div className="p-stack-sm border border-outline-variant rounded-lg peer-checked:border-primary peer-checked:bg-surface-container peer-checked:ring-1 peer-checked:ring-primary transition-all text-center">
                    <MaterialIcon name="health_and_safety" filled className="text-primary mb-unit" />
                    <div className="font-label-md text-label-md text-on-surface">Looking for Care</div>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="role" type="radio" />
                  <div className="p-stack-sm border border-outline-variant rounded-lg peer-checked:border-primary peer-checked:bg-surface-container peer-checked:ring-1 peer-checked:ring-primary transition-all text-center">
                    <MaterialIcon name="medical_services" filled className="text-primary mb-unit" />
                    <div className="font-label-md text-label-md text-on-surface">Offering Service</div>
                  </div>
                </label>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-unit">Email Address</label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
                  placeholder="name@example.com"
                  type="email"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-unit">Create Password</label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
                  placeholder="Min. 8 characters"
                  type="password"
                />
              </div>
              <button
                type="submit"
                className="mt-stack-sm w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-on-primary-fixed-variant transition-colors flex justify-center items-center gap-stack-sm"
              >
                CREATE ACCOUNT
                <MaterialIcon name="arrow_forward" className="text-[18px]" />
              </button>
            </form>
          )}

          <p className="mt-stack-md text-center font-label-md text-label-md text-on-surface-variant">
            <Link to="/discover" className="text-primary hover:underline">
              Browse as guest →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
