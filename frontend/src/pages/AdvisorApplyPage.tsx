import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MaterialIcon } from '../components/MaterialIcon'
import { Logo } from '../components/Logo'
import { useAuth } from '../context/AuthContext'

export function AdvisorApplyPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { registerAdvisor } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await registerAdvisor({
        email,
        password,
        profile: {
          username,
          bio,
          tags: [],
          coinRatePerSession: 100 // Default rate
        }
      })
      navigate('/advisor')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Application submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex flex-col justify-between w-1/3 bg-secondary-container p-margin-desktop text-on-secondary relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-stack-sm mb-stack-md">
            <Logo className="w-12 h-12" />
            <h1 className="font-display-lg text-display-lg text-primary">Green Heart</h1>
          </div>
          <h2 className="font-headline-lg text-headline-lg mb-stack-md">Join Our Network of Advisors</h2>
          <p className="font-body-lg text-body-lg text-on-secondary-container max-w-md">
            Share your expertise and help our global community achieve holistic health and balance.
          </p>
        </div>
        <div className="relative z-10 mt-auto pt-stack-lg">
          <p className="font-label-md text-label-md text-on-secondary-container uppercase tracking-widest">
            Expertise. Empathy. Growth.
          </p>
        </div>
      </div>

      <div className="w-full md:w-2/3 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface relative">
        <div className="w-full max-w-2xl bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl p-stack-lg transition-all duration-300 relative z-10">
          <div className="mb-stack-lg">
            <Link to="/auth" className="text-primary flex items-center gap-1 font-label-md hover:underline mb-stack-sm">
              <MaterialIcon name="arrow_back" className="text-sm" />
              Back to login
            </Link>
            <h2 className="font-display-md text-display-md text-on-surface">Advisor Application</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Apply to become a verified advisor on the Green Heart platform.
            </p>
          </div>

          {error && (
            <div className="mb-stack-md p-stack-sm bg-error-container text-on-error-container rounded-lg text-label-md">
              {error}
            </div>
          )}

          <form className="grid grid-cols-1 md:grid-cols-2 gap-stack-md" onSubmit={handleSubmit}>
            <div className="col-span-2 md:col-span-1">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-unit">Display Name</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
                placeholder="Dr. Jane Smith"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-unit">Email Address</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
                placeholder="jane@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-unit">Password</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
                placeholder="Min. 8 characters"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-unit">Professional Bio & Credentials</label>
              <textarea
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline min-h-[120px]"
                placeholder="Describe your expertise, certifications, and experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
              />
            </div>
            
            <div className="col-span-2 mt-stack-sm">
              <div className="flex items-start gap-stack-sm mb-stack-md">
                <input type="checkbox" id="terms" className="mt-1" required />
                <label htmlFor="terms" className="font-label-md text-label-md text-on-surface-variant">
                  I agree to the Advisor Terms of Service and verify that all information provided is accurate. 
                  I understand that I must be verified by a partner doctor before I can accept consultations.
                </label>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-lg hover:bg-on-primary-fixed-variant transition-colors flex justify-center items-center gap-stack-sm disabled:opacity-50 shadow-lg"
              >
                {isSubmitting ? 'SUBMITTING APPLICATION...' : 'SUBMIT APPLICATION'}
                <MaterialIcon name="send" className="text-[18px]" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
