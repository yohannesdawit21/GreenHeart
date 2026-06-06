import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MaterialIcon } from '../components/MaterialIcon'
import { Logo } from '../components/Logo'
import { PasswordInput } from '../components/PasswordInput'
import { btnPrimary, btnOutline } from '../components/layout/buttonStyles'
import { FormError } from '../components/layout/dashboard-ui'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/apiError'

const SPECIALTY_OPTIONS = [
  'Anxiety',
  'Depression',
  'Sleep',
  'Stress',
  'CBT',
  'Trauma',
  'Grief',
  'Relationships',
  'Nutrition',
  'Mindfulness',
  'Burnout',
  'Addiction',
] as const

const SESSION_RATE_OPTIONS = [50, 75, 100, 125, 150, 175, 200]

const inputClass =
  'w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline'

const labelClass = 'block font-label-md text-label-md text-on-surface-variant mb-unit'

function buildAdvisorBio(fields: {
  professionalTitle: string
  credentials: string
  yearsExperience: string
  approach: string
}): string {
  const header: string[] = []
  if (fields.professionalTitle.trim()) header.push(`Title: ${fields.professionalTitle.trim()}`)
  if (fields.credentials.trim()) header.push(`Credentials: ${fields.credentials.trim()}`)
  if (fields.yearsExperience.trim()) header.push(`Experience: ${fields.yearsExperience.trim()} years`)

  const approach = fields.approach.trim()
  if (header.length === 0) return approach
  return `${header.join('\n')}\n---\n${approach}`
}

function FormSection({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description?: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <section className="col-span-2 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 p-stack-md flex flex-col gap-stack-md">
      <div className="flex items-start gap-stack-sm">
        <span className="w-9 h-9 rounded-lg bg-secondary-container/30 flex items-center justify-center shrink-0">
          <MaterialIcon name={icon} className="text-secondary text-lg" />
        </span>
        <div>
          <h3 className="font-label-md text-sm font-bold uppercase tracking-wide text-on-surface">{title}</h3>
          {description && <p className="text-sm text-on-surface-variant mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">{children}</div>
    </section>
  )
}

export function AdvisorApplyPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [professionalTitle, setProfessionalTitle] = useState('')
  const [credentials, setCredentials] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [coinRatePerSession, setCoinRatePerSession] = useState(100)
  const [approach, setApproach] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { registerAdvisor } = useAuth()
  const navigate = useNavigate()

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 8 ? [...prev, tag] : prev,
    )
  }

  const addCustomTag = () => {
    const tag = customTag.trim()
    if (!tag || selectedTags.includes(tag) || selectedTags.length >= 8) return
    setSelectedTags((prev) => [...prev, tag.slice(0, 50)])
    setCustomTag('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (selectedTags.length === 0) {
      setError('Select at least one specialty or focus area.')
      return
    }
    if (approach.trim().length < 40) {
      setError('Please write at least a few sentences about your approach and who you help.')
      return
    }
    if (!credentials.trim()) {
      setError('License or certification details are required for partner verification.')
      return
    }

    setIsSubmitting(true)

    try {
      await registerAdvisor({
        email,
        password,
        profile: {
          username: username.trim(),
          bio: buildAdvisorBio({
            professionalTitle,
            credentials,
            yearsExperience,
            approach,
          }),
          tags: selectedTags,
          coinRatePerSession,
        },
      })
      navigate('/advisor')
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Application submission failed'))
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
          <p className="font-body-lg text-body-lg text-on-secondary-container max-w-md mb-stack-lg">
            Share your expertise and help our global community achieve holistic health and balance.
          </p>
          <ul className="space-y-3 text-sm text-on-secondary-container">
            {[
              'Partners review your credentials before video verification',
              'Set your session rate in platform coins',
              'Specialties help patients find you on Discover',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <MaterialIcon name="check_circle" className="text-secondary shrink-0 text-base" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 mt-auto pt-stack-lg">
          <p className="font-label-md text-label-md text-on-secondary-container uppercase tracking-widest">
            Expertise. Empathy. Growth.
          </p>
        </div>
      </div>

      <div className="w-full md:w-2/3 flex items-start justify-center p-margin-mobile md:p-margin-desktop bg-surface relative overflow-y-auto">
        <div className="w-full max-w-3xl bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl p-stack-lg my-stack-lg transition-all duration-300 relative z-10">
          <div className="mb-stack-lg">
            <Link to="/auth" className="text-primary flex items-center gap-1 font-label-md hover:underline mb-stack-sm">
              <MaterialIcon name="arrow_back" className="text-sm" />
              Back to login
            </Link>
            <h2 className="font-display-md text-display-md text-on-surface">Advisor application</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Tell us about your practice — partners use this profile during verification.
            </p>
          </div>

          {error && <FormError className="mb-stack-md">{error}</FormError>}

          <form className="grid grid-cols-1 md:grid-cols-2 gap-stack-md" onSubmit={handleSubmit}>
            <FormSection title="Account" description="Sign-in details for Advisor Hub" icon="person">
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Email address</label>
                <input
                  className={inputClass}
                  placeholder="jane@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Display name</label>
                <input
                  className={inputClass}
                  placeholder="Dr. Jane Smith"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  minLength={2}
                  required
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Password</label>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Confirm password</label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </FormSection>

            <FormSection
              title="Professional credentials"
              description="Shown to partner doctors during verification"
              icon="badge"
            >
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Professional title</label>
                <input
                  className={inputClass}
                  placeholder="Licensed Clinical Psychologist"
                  type="text"
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Years of experience</label>
                <input
                  className={inputClass}
                  placeholder="e.g. 8"
                  type="number"
                  min={0}
                  max={60}
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>License & certifications</label>
                <input
                  className={inputClass}
                  placeholder="State license #, board certifications, degree (PsyD, MD, LCSW…)"
                  type="text"
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value)}
                  required
                />
                <p className="text-xs text-on-surface-variant mt-1">
                  Required for partner verification — include license number or certifying body.
                </p>
              </div>
            </FormSection>

            <FormSection
              title="Practice & services"
              description="How patients will find and book you"
              icon="medical_services"
            >
              <div className="col-span-2">
                <label className={labelClass}>Specialties & focus areas (up to 8)</label>
                <div className="flex flex-wrap gap-2 mb-stack-sm">
                  {SPECIALTY_OPTIONS.map((tag) => {
                    const active = selectedTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          active
                            ? 'bg-secondary-container text-on-secondary-container border-secondary'
                            : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-primary/40'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    className={`${inputClass} flex-1 py-2 text-sm`}
                    placeholder="Add custom specialty"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomTag()
                      }
                    }}
                  />
                  <button type="button" onClick={addCustomTag} className={`${btnOutline} text-sm px-4 shrink-0`}>
                    Add
                  </button>
                </div>
                {selectedTags.length > 0 && (
                  <p className="text-xs text-secondary mt-2">
                    Selected: {selectedTags.join(', ')}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Session rate (coins per consultation)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {SESSION_RATE_OPTIONS.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setCoinRatePerSession(rate)}
                      className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
                        coinRatePerSession === rate
                          ? 'bg-primary-container text-on-primary-container border-primary'
                          : 'border-outline-variant hover:border-primary/40'
                      }`}
                    >
                      {rate} coins
                    </button>
                  ))}
                </div>
                <input
                  className={`${inputClass} max-w-xs`}
                  type="number"
                  min={20}
                  max={500}
                  step={5}
                  value={coinRatePerSession}
                  onChange={(e) => setCoinRatePerSession(Number(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Your approach & who you help</label>
                <textarea
                  className={`${inputClass} min-h-[120px]`}
                  placeholder="Describe your therapeutic approach, languages spoken, and the types of clients you work best with…"
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  required
                />
                <p className="text-xs text-on-surface-variant mt-1">{approach.length}/40 characters minimum</p>
              </div>
            </FormSection>

            <div className="col-span-2 mt-stack-sm">
              <div className="flex items-start gap-stack-sm mb-stack-md rounded-lg bg-primary-container/10 border border-primary/20 p-stack-sm">
                <input type="checkbox" id="terms" className="mt-1 shrink-0" required />
                <label htmlFor="terms" className="font-label-md text-label-md text-on-surface-variant text-sm">
                  I agree to the Advisor Terms of Service and confirm that all credentials and information provided are
                  accurate. I understand I must pass partner video verification before accepting patient consultations.
                </label>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${btnPrimary} text-label-md py-4 w-full flex justify-center items-center gap-stack-sm shadow-lg`}
              >
                {isSubmitting ? 'Submitting application…' : 'Submit application'}
                <MaterialIcon name="send" className="text-[18px]" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
